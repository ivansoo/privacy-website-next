// Файл: src/app/resources/page.jsx
import Link from 'next/link';

async function getContent() {
  // Запрашиваем всю страницу контента и все ее компоненты
  // If STRAPI_URL is not configured, return demo content so build can succeed offline.
  if (!process.env.STRAPI_URL) {
    return {
      articles: [
        {
          id: 'demo-article-1',
          title: 'Демо-статья',
          description: 'Это демонстрационная статья, Strapi недоступен при сборке.',
          slug: 'demo-article',
          dateAdded: new Date().toISOString(),
        },
      ],
      resources: [],
    };
  }

  try {
    const res = await fetch(`${process.env.STRAPI_URL}/api/site-content?populate[articles][populate]=*&populate[resources][populate]=*`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
      // Оставляем кэш по умолчанию (force-cache) чтобы Next.js мог статически собрать страницу.
    });

    if (!res.ok) {
      // если сервер вернул ошибку — используем пустые массивы вместо падения сборки
      return { articles: [], resources: [] };
    }

    const data = await res.json();
    if (!data || !data.data || !data.data.attributes) {
      return { articles: [], resources: [] };
    }

    return {
      articles: data.data.attributes.articles || [],
      resources: data.data.attributes.resources || [],
    };
  } catch (err) {
    // В случае сетевой ошибки возвращаем запасные данные
    return {
      articles: [
        {
          id: 'demo-article-1',
          title: 'Демо-статья',
          description: 'Это демонстрационная статья, Strapi недоступен при сборке.',
          slug: 'demo-article',
          dateAdded: new Date().toISOString(),
        },
      ],
      resources: [],
    };
  }
}

export default async function ResourcesPage() {
  const { articles, resources } = await getContent();
  const allContent = [...articles, ...resources].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

  return (
    <div className="container">
      <h1>Все материалы</h1>
      {allContent.length > 0 ? (
        <ul>
          {allContent.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {/* Если у элемента есть slug, это статья, и ссылка внутренняя. Иначе - внешняя. */}
              {item.slug ? (
                <Link href={`/${item.slug}`}>
                  Читать статью
                </Link>
              ) : (
                <a 
                  href={item.external_link || `${process.env.STRAPI_URL}${item.file.data.attributes.url}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Перейти к материалу ({item.type})
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Материалы скоро появятся.</p>
      )}
    </div>
  );
}
