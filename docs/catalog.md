# Catalog & Search Module (`CAT-*`)

## 1. Purpose
The Catalog & Search module powers public course discovery, categories hierarchy, search querying with filters and facets, home storefront rails, detailed curriculum outlines (with preview-only access gating), and learner wishlists.

---

## 2. Endpoints Table

| Method | Endpoint | Description | Auth Required | Cache TTL |
|---|---|---|---|---|
| `GET` | `/api/v1/catalog/home` | Home storefront rails: Featured, Trending, and New courses | Public | 10 mins (Redis tag: `catalog:home`) |
| `GET` | `/api/v1/catalog/courses` | Filterable course list (category, level, rating, language, price) with pagination | Public | Dynamic query |
| `GET` | `/api/v1/catalog/courses/{slug}` | Full course page with curriculum outline & Schema.org JSON-LD SEO | Public | 1 hour (Redis tag: `course:{slug}`) |
| `GET` | `/api/v1/catalog/courses/{slug}/related` | Related courses within the same category | Public | 30 mins |
| `GET` | `/api/v1/catalog/search/autocomplete` | Fast search suggestions debounced on title | Public | No cache |
| `GET` | `/api/v1/catalog/categories` | Complete category hierarchy tree | Public | 24 hours |
| `GET` | `/api/v1/catalog/categories/{slug}` | Specific category outline with children | Public | 24 hours |
| `GET` | `/api/v1/wishlist` | Authenticated learner's saved wishlist courses | Bearer / Cookie | User private |
| `POST` | `/api/v1/wishlist/{courseUlid}` | Save course to wishlist | Bearer / Cookie | No |
| `DELETE` | `/api/v1/wishlist/{courseUlid}` | Remove course from wishlist | Bearer / Cookie | No |

---

## 3. SEO & Rich Data Integration
Course detail responses include a dedicated `seo` payload:
- `meta_title`: `<Title> | LearnHub`
- `meta_description`: Course subtitle or truncated description (max 160 chars)
- `canonical_url`: Standardized permalink
- `json_ld`: Full Schema.org `Course` structured metadata including `provider`, `aggregateRating`, and `offers`.

---

## 4. Search & Indexing Engine
- Powered by **Laravel Scout** with **Meilisearch** driver.
- Courses are automatically indexed upon entering status `published` and purged upon status change or soft deletion.
- Query builder supports multi-criteria filtering:
  - `filter[level]`: `beginner`, `intermediate`, `advanced`, `all_levels`
  - `filter[language]`: e.g. `en`, `bn`
  - `filter[rating]`: minimum star threshold (e.g. `4.5`)
  - `filter[category]`: category slug
  - `filter[search]`: full-text keyword match
