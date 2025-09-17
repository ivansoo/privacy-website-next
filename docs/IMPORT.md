# Импорт материалов в Strapi

Этот документ описывает, как использовать скрипт импорта `scripts/import-to-strapi.js` для загрузки существующих материалов в Strapi.

Требования
- Node.js 18+ (рекомендуется) или установить `node-fetch` и `form-data`.
- Переменные окружения в среде запуска:
  - `STRAPI_URL` — базовый URL Strapi, например `https://cms.privacy.qrconsult.ru`
  - `STRAPI_TOKEN` — персональный токен (API token) с правами на создание/обновление записей и загрузку медиа.

Подготовка JSON файла
- Скрипт ожидает JSON файл, содержащий массив объектов. Пример записи:

```json
[
  {
    "title": "Название ресурса",
    "description": "Короткое описание",
    "type": "article",
    "category": "policy",
    "tags": ["privacy"],
    "dateAdded": "2024-08-01T12:00:00.000Z",
    "featured": false,
    "slug": "my-resource",
    "external_link": "https://example.com/resource.pdf",
    "filePath": "./media/myfile.pdf"
  }
]
```

- Поле `filePath` указывает локальный путь к файлу, который необходимо загрузить в медиа-библиотеку Strapi и затем связать с записью.
- Поля `type`, `category`, `tags`, `featured` должны соответствовать полям вашей коллекции `resources` в Strapi. При необходимости адаптируйте скрипт `scripts/import-to-strapi.js`.

Пример использования

В Windows PowerShell:

```powershell
$env:STRAPI_URL = "https://cms.privacy.qrconsult.ru";
$env:STRAPI_TOKEN = "your_token_here";
node .\scripts\import-to-strapi.js --file=./data/resources.json --update
```

Опции
- `--file` (обязательно): путь к JSON-файлу с массивом ресурсов.
- `--update`: пытаться найти существующую запись по `slug` и обновить её, если найдена. Иначе создаётся новая запись.
- `--dry-run`: не выполнять запросы к Strapi, только показать что бы было отправлено.

Советы
- Перед массовым импортом протестируйте 1–2 записи с `--dry-run=false`.
- Проверьте соответствие полей (slug, enums) между JSON и Strapi.
- Если у вас много файлов — загружайте их постепенно, чтобы не перегружать сервер.

Если нужно, могу доработать скрипт под конкретную структуру коллекции `resources` (поля/названия/тип поля media и т.д.).
