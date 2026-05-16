const MODELS = {
  deepseek: {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  mimo: {
    endpoint: 'https://api.xiaomimimo.com/v1/chat/completions',
    model: 'mimo-v2-flash',
  },
  zhipu: {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
  },
};

const PROMPT = `请分析以下简历，提供：
1. **优化建议**：指出简历中的问题和具体的改进方向（如量化成果、关键词优化、格式改进、内容补充等）
2. **改写后的简历**：基于建议改写一份更专业、更有竞争力的版本

要求：
- 不要输出任何开场白、寒暄或总结性语句，直接输出内容
- 用 Markdown 格式输出
- 用 "---SUGGESTIONS---" 和 "---REWRITTEN---" 作为分隔符分隔两部分内容`;

export async function onRequestPost(context) {
  try {
    const { model, resume } = await context.request.json();

    if (!model || !resume) {
      return Response.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const config = MODELS[model];
    if (!config) {
      return Response.json({ error: '不支持的模型' }, { status: 400 });
    }

    const db = context.env.DB;
    const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(`api_key_${model}`).first();
    const apiKey = row?.value;

    if (!apiKey) {
      return Response.json({ error: `未配置 ${model} 的 API Key，请在管理页面设置` }, { status: 400 });
    }

    const aiResponse = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: '你是一位资深的简历优化顾问，擅长分析简历并提供专业的改进建议。' },
          { role: 'user', content: `${PROMPT}\n\n简历内容：\n${resume}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json().catch(() => ({}));
      return Response.json({ error: err.error?.message || `AI API 请求失败 (${aiResponse.status})` }, { status: 502 });
    }

    const data = await aiResponse.json();
    const content = data.choices[0].message.content;

    const parts = content.split('---REWRITTEN---');
    const suggestions = parts[0].split('---SUGGESTIONS---').pop().trim();
    const rewritten = parts[1] ? parts[1].trim() : content;

    await db.prepare(
      'INSERT INTO history (model, original, suggestions, rewritten, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(model, resume, suggestions, rewritten, Math.floor(Date.now() / 1000)).run();

    return Response.json({ suggestions, rewritten });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
