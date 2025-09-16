import React from 'react';

async function getArticles() {
  const base = process.env.STRAPI_URL;
  if (!base) {
    // temporary fallback to avoid server error when env is not set
    return [
      { id: 1, attributes: { slug: 'demo-article', title: 'Примерная статья' } }
    ];
  }

  try {
    const res = await fetch(`${base}/api/articles`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
      cache: 'no-store'
    });

    if (!res.ok) {
      // Log server response for debugging and return fallback
      const text = await res.text().catch(() => '');
      try {
        // Only log in development; use warn instead of error to avoid dev overlay
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' && typeof console.warn === 'function') {
          console.warn('Strapi responded with non-ok status', res.status, text);
        }
      } catch (e) {
        /* ignore logging errors */
      }
      return [
        { id: 1, attributes: { slug: 'demo-article', title: 'Примерная статья' } }
      ];
    }

    const data = await res.json();
    return data.data;
  } catch (err) {
    // network or parsing error - log and return fallback
    try {
      if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('Failed to fetch articles from Strapi:', err);
      }
    } catch (e) {}
    return [
      { id: 1, attributes: { slug: 'demo-article', title: 'Примерная статья' } }
    ];
  }
}

export default async function HomePage() {
  const articles = await getArticles();
  return (
    <div className="container">
      <h1>Статьи</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <a href={`/articles/${article.attributes.slug}`}>
              {article.attributes.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
