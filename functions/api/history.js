export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
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

    const db = context.env.DB;
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
