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

    const rows = await db.prepare(
      'SELECT * FROM history ORDER BY created_at DESC LIMIT 50'
    ).all();
    return Response.json(rows.results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    const password = url.searchParams.get('password') || context.request.headers.get('x-admin-password') || '';
    const db = context.env.DB;

    if (!(await checkAdmin(db, password))) {
      return Response.json({ error: '密码错误' }, { status: 403 });
    }

    if (id) {
      await db.prepare('DELETE FROM history WHERE id = ?').bind(id).run();
    } else {
      await db.prepare('DELETE FROM history').run();
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
