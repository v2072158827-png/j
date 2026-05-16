async function checkAdmin(db, password) {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_password').first();
  return !row || !row.value || row.value === password;
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const password = url.searchParams.get('password') || context.request.headers.get('x-admin-password') || '';
    const db = context.env.DB;

    if (!(await checkAdmin(db, password))) {
      return Response.json({ error: '密码错误' }, { status: 403 });
    }

    const rows = await db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const row of rows.results) {
      if (row.key.startsWith('api_key_') && row.value) {
        settings[row.key] = row.value.slice(0, 6) + '****' + row.value.slice(-4);
      } else {
        settings[row.key] = row.value;
      }
    }
    return Response.json(settings);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const { key, value, password } = await context.request.json();
    if (!key) {
      return Response.json({ error: '缺少 key' }, { status: 400 });
    }

    const db = context.env.DB;

    if (!(await checkAdmin(db, password))) {
      return Response.json({ error: '密码错误' }, { status: 403 });
    }

    await db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
    ).bind(key, value, value).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
