import React from 'react';

async function getArticles() {
  const base = process.env.STRAPI_URL;
  if (!base) {
    return [
      {
        id: 'demo-article-1',
        title: 'Демо-статья',
        description: 'Демо-статья, Strapi не настроен.',
        slug: 'demo-article',
        dateAdded: new Date().toISOString(),
      },
    ];
  }

  try {
    const res = await fetch(`${base}/api/articles-page?populate[articles][populate]=*&fields[articles]=title,slug,description,dateAdded`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const articles = json?.data?.attributes?.articles || [];
    return Array.isArray(articles) ? articles : [];
  } catch (err) {
    return [];
  }
}

export default async function ArticlesIndexPage() {
  const articles = await getArticles();

  return (
    <div className="container">
      <h1>Материалы</h1>
      {articles.length === 0 ? (
        <p>Материалы скоро появятся.</p>
      ) : (
        <ul>
          {articles.map((a) => (
            <li key={a.id}>
              <h3>{a.title}</h3>
              {a.description && <p>{a.description}</p>}
              <p>
                <a href={`/articles/${a.slug}`}>Читать</a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
