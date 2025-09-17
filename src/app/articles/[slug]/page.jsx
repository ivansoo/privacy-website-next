import { marked } from 'marked';
import React from 'react';

// Генерируем пути для всех статей из single type `articles-page`
export async function generateStaticParams() {
  const base = process.env.STRAPI_URL;
  if (!base) return [{ slug: 'demo-article' }];

  try {
    const res = await fetch(`${base}/api/articles-page?populate[articles][fields][0]=slug`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
      // allow Next to cache this during build so pages can be prerendered
    });
    if (!res.ok) return [{ slug: 'demo-article' }];
    const json = await res.json();
    const articles = json?.data?.attributes?.articles || [];
    if (!Array.isArray(articles) || articles.length === 0) return [{ slug: 'demo-article' }];
    return articles.map((a) => ({ slug: a.slug }));
  } catch (err) {
    return [{ slug: 'demo-article' }];
  }
}

async function getArticle(slug) {
  const base = process.env.STRAPI_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/articles-page?populate[articles][populate]=*`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const articles = json?.data?.attributes?.articles || [];
    if (!Array.isArray(articles)) return null;
    return articles.find((it) => it.slug === slug) || null;
  } catch (err) {
    return null;
  }
}

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  if (!article) {
    return (
      <div className="container">
        <h1>Статья не найдена</h1>
        <p>Возможно, Strapi недоступен при сборке — проверьте переменную окружения STRAPI_URL.</p>
      </div>
    );
  }

  const htmlContent = marked(article.content || article.body || '');

  return (
    <article className="container">
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </article>
  );
}
