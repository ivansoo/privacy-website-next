import { marked } from 'marked';

async function getArticle(slug) {
  const base = process.env.STRAPI_URL;
  if (!base) {
    // Return demo article when env is not configured (e.g., local build without CMS)
    return {
      id: 1,
      attributes: {
        slug: 'demo-article',
        title: 'Примерная статья',
  content: `# Пример

Это демо-статья, контент недоступен.`
      }
    };
  }

  try {
    // Use default fetch cache behavior so Next can statically prerender pages
    const res = await fetch(`${base}/api/articles?filters[slug][$eq]=${slug}`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` }
    });
    if (!res.ok) throw new Error('Failed to fetch article');
    const data = await res.json();
    return data.data[0];
  } catch (err) {
    // On error, return a demo article to allow build to continue
    return {
      id: 1,
      attributes: {
        slug,
        title: 'Примерная статья',
        content: 'Контент временно недоступен.'
      }
    };
  }
}

// Called at build time when using `output: 'export'` so Next can statically generate
// all article pages. It fetches all articles from Strapi and returns an array of
// params objects: [{ slug: '...' }, ...]
export async function generateStaticParams() {
  const base = process.env.STRAPI_URL;
  if (!base) {
    // fallback: return a demo slug so export builds can complete when env isn't present
    return [{ slug: 'demo-article' }];
  }

  try {
    const pageSize = 1000; // reasonable upper bound for number of articles
    const res = await fetch(`${base}/api/articles?pagination[pageSize]=${pageSize}`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
      cache: 'no-store'
    });
    if (!res.ok) {
      // Return demo fallback instead of throwing to allow build to continue
      return [{ slug: 'demo-article' }];
    }
    const data = await res.json();
    if (!data?.data) return [{ slug: 'demo-article' }];
    return data.data.map(item => ({ slug: item.attributes.slug }));
  } catch (err) {
    // network or parsing error - return demo fallback
    return [{ slug: 'demo-article' }];
  }
}

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  const htmlContent = marked(article.attributes.content);

  return (
    <>
      <article className="container">
        <h1>{article.attributes.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>

      {/* Yandex.Metrika counter for article pages */}
      <script dangerouslySetInnerHTML={{ __html: `(function(m,e,t,r,i,k,a){\n        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};\n        m[i].l=1*new Date();\n        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}\n        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)\n    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');\n\n    ym(102189747, 'init', {webvisor:true, clickmap:true, accurateTrackBounce:true, trackLinks:true});` }} />

      <noscript>
        <div>
          <img src="https://mc.yandex.ru/watch/102189747" style={{position: 'absolute', left: '-9999px'}} alt="" />
        </div>
      </noscript>
    </>
  );
}
