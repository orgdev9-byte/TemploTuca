export function validate(data) {
  if (data.schemaVersion !== 1 || !Array.isArray(data.pages)) throw Error('Modelo inválido');
  const ids = new Set();
  const siblings = new Set();
  for (const p of data.pages) {
    if (!p.id || !p.title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw Error(`Página inválida: ${p.id}`);
    if (ids.has(p.id)) throw Error(`ID duplicado: ${p.id}`);
    ids.add(p.id);
    const key = `${p.parentId ?? ''}/${p.slug}`;
    if (siblings.has(key)) throw Error(`Caminho duplicado: ${key}`);
    siblings.add(key);
    if (!['home', 'collection', 'article', 'calendar', 'gallery', 'visit'].includes(p.template)) throw Error(`Template inválido: ${p.id}`);
  }
  for (const p of data.pages) {
    const seen = new Set([p.id]);
    let parent = p.parentId;
    while (parent) {
      if (seen.has(parent)) throw Error(`Ciclo: ${p.id}`);
      seen.add(parent);
      const found = data.pages.find(x => x.id === parent);
      if (!found) throw Error(`Página pai ausente: ${parent}`);
      parent = found.parentId;
    }
  }
  return true;
}
