import React from 'react';

async function getResources() {
  const base = process.env.STRAPI_URL;
  const token = process.env.STRAPI_TOKEN;

  // Demo fallback (used when Strapi is not available at build time)
  const demo = [
    {
      id: 'demo-1',
      title: 'Демо-ресурс',
      description: 'Это демонстрационный ресурс, Strapi недоступен.',
      link: '#',
      type: 'pdf',
      dateAdded: '2024-01-01',
      featured: false
    }
  ];

  if (!base) return demo;

  try {
    const url = `${base}/api/resources-page?populate[resources_list][populate]=*`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      // cache: 'no-store' // keep default so static build can prerender if needed
    });
    if (!res.ok) return demo;
    const json = await res.json();
    const list = json?.data?.attributes?.resources_list || [];

    // Normalize items
    return list.map((item, idx) => {
      // item is component object with fields matching resource_item
      const id = item.id ?? `r-${idx}`;
      const title = item.title ?? item.attributes?.title ?? '';
      const description = item.description ?? item.attributes?.description ?? '';
      const external_link = item.external_link ?? item.attributes?.external_link ?? null;
      const type = item.type ?? item.attributes?.type ?? '';
      const dateAdded = item.dateAdded ?? item.attributes?.dateAdded ?? item.attributes?.dateAdded ?? null;

      // file could be a media object
      const fileData = item.file ?? item.attributes?.file ?? null;
      let fileUrl = null;
      if (fileData) {
        // Strapi may return { data: [...] } or direct object depending on populate
        const data = fileData.data ?? fileData;
        if (Array.isArray(data)) {
          fileUrl = data[0]?.attributes?.url ?? null;
        } else {
          fileUrl = data?.attributes?.url ?? null;
        }
      }

      const link = external_link || fileUrl || '#';

      return { id, title, description, link, type, dateAdded, featured: item.featured ?? false };
    });
  } catch (err) {
    return demo;
  }
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="container">
      <h1>Ресурсы</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem'}}>
        {resources.map((r) => (
          <article key={r.id} style={{border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '6px', background: '#fff'}}>
            <h3 style={{marginTop:0}}>{r.title}</h3>
            <p style={{color: 'var(--text-secondary)'}}>{r.description}</p>
            <p style={{marginBottom: '0.5rem', fontSize: '0.9rem'}}><strong>Тип:</strong> {r.type}</p>
            <a href={r.link} target="_blank" rel="noopener noreferrer">Открыть</a>
          </article>
        ))}
      </div>
    </div>
  );
}
