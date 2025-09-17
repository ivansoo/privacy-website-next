#!/usr/bin/env node
// scripts/import-to-strapi.js
// Импорт-скрипт для переноса ресурсов в Strapi.
// Использование:
//   node scripts/import-to-strapi.js --file=path/to/resources.json [--update] [--dry-run]
// Требования: установить ENV STRAPI_URL и STRAPI_TOKEN (админ/загруженный PAT с правами).

const fs = require('fs');
const path = require('path');
const https = require('https');

// Поддержка встроенного fetch (Node 18+) или fallback на node-fetch
let fetchFn;
try {
  fetchFn = global.fetch || require('node-fetch');
} catch (e) {
  fetchFn = global.fetch;
}

if (!fetchFn) {
  console.error('Требуется fetch: используйте Node 18+ или установите node-fetch (npm i node-fetch@2)');
  process.exit(1);
}

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const m = arg.match(/^--([a-zA-Z0-9_-]+)(=(.*))?$/);
    if (m) args[m[1]] = m[3] || true;
  });
  return args;
}

async function uploadFile(strapiUrl, token, filePath) {
  // Upload using multipart/form-data to /api/upload
  const FormData = require('form-data');
  const form = new FormData();
  form.append('files', fs.createReadStream(filePath));

  const res = await fetchFn(`${strapiUrl.replace(/\/$/, '')}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // form.getHeaders() will include proper Content-Type
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${text}`);
  }
  const data = await res.json();
  // Strapi v4 returns array of uploaded files
  return data[0] || data;
}

async function createOrUpdateResource(strapiUrl, token, resource, update=false) {
  // Map resource fields to Strapi fields. Adjust this mapping to your collection type.
  const payload = {
    data: {
      title: resource.title,
      description: resource.description,
      type: resource.type || null,
      category: resource.category || null,
      tags: resource.tags || [],
      dateAdded: resource.dateAdded || new Date().toISOString(),
      featured: !!resource.featured,
    }
  };

  // Attach external link or media relation
  if (resource.external_link) {
    payload.data.external_link = resource.external_link;
  }

  if (resource.file && resource.filePath) {
    // filePath is local path to upload
    payload.file = resource.file; // placeholder, will attach after upload
  }

  // If update true and resource has a matching unique key (e.g., slug or id), try to find existing
  if (update && resource.slug) {
    // search by slug
    const qs = new URLSearchParams({ 'filters[slug][$eq]': resource.slug });
    const res = await fetchFn(`${strapiUrl.replace(/\/$/, '')}/api/resources?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      if (d && d.data && d.data.length > 0) {
        const existing = d.data[0];
        // update
        const updateRes = await fetchFn(`${strapiUrl.replace(/\/$/, '')}/api/resources/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!updateRes.ok) {
          const text = await updateRes.text();
          throw new Error(`Update failed: ${updateRes.status} ${updateRes.statusText} - ${text}`);
        }
        return await updateRes.json();
      }
    }
  }

  // Create new resource
  const createRes = await fetchFn(`${strapiUrl.replace(/\/$/, '')}/api/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Create failed: ${createRes.status} ${createRes.statusText} - ${text}`);
  }
  return await createRes.json();
}

async function run() {
  const args = parseArgs();
  const file = args.file || args.f;
  const update = !!args.update;
  const dryRun = !!args['dry-run'] || !!args.dry;

  const STRAPI_URL = process.env.STRAPI_URL || process.env.STRAPI_HOST;
  const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

  if (!file) {
    console.error('Укажите файл: --file=path/to/resources.json');
    process.exit(2);
  }
  if (!STRAPI_URL || !STRAPI_TOKEN) {
    console.error('Требуются переменные окружения STRAPI_URL и STRAPI_TOKEN');
    process.exit(2);
  }

  const absPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(absPath)) {
    console.error('Файл не найден:', absPath);
    process.exit(2);
  }

  const raw = fs.readFileSync(absPath, 'utf8');
  let items;
  try {
    items = JSON.parse(raw);
  } catch (e) {
    console.error('Ошибка парсинга JSON:', e.message);
    process.exit(2);
  }

  if (!Array.isArray(items)) {
    console.error('Ожидается массив объектов в JSON.');
    process.exit(2);
  }

  console.log(`Found ${items.length} items to import. update=${update} dryRun=${dryRun}`);

  for (const item of items) {
    console.log('---');
    console.log('Processing:', item.title || item.slug || item.id || '(no title)');

    try {
      // Upload file if local path provided
      if (item.filePath && fs.existsSync(item.filePath)) {
        console.log('Uploading file:', item.filePath);
        if (!dryRun) {
          const uploaded = await uploadFile(STRAPI_URL, STRAPI_TOKEN, item.filePath);
          // Set relation on item to uploaded file id (Strapi v4)
          item.file = { id: uploaded.id || uploaded[0]?.id };
          console.log('Uploaded file id:', item.file.id);
        }
      }

      if (!dryRun) {
        const res = await createOrUpdateResource(STRAPI_URL, STRAPI_TOKEN, item, update);
        console.log('Result:', res && res.data ? `ok id=${res.data.id}` : JSON.stringify(res));
      } else {
        console.log('Dry run: would create/update resource with payload:', JSON.stringify(item, null, 2));
      }
    } catch (err) {
      console.error('Error processing item:', err.message || err);
    }
  }

  console.log('Import finished');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
