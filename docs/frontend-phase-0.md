# Frontend Phase 0 — Project Setup & Architecture Foundation

## 1. Overview
The LearnHub web frontend is built with **Next.js 15+ (App Router)**, **React 19**, **TypeScript (strict)**, and **Tailwind CSS**. It is designed to consume the Laravel REST API (`/api/v1`) using Sanctum cookie-based SPA authentication.

---

## 2. Directory Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Inter font, RootProvider, Navbar & Footer
│   │   ├── page.tsx           # Storefront Home Page with hero, categories, and courses
│   │   ├── not-found.tsx      # Custom 404 page
│   │   ├── error.tsx          # Global ErrorBoundary with retry
│   ├── components/
│   │   ├── providers/         # RootProvider (QueryClient, next-themes, Sonner Toaster)
│   │   ├── shared/            # Navbar, Footer, ThemeToggle, LanguageSelector
│   │   └── ui/                # Button, Input, Card, Badge, Skeleton
│   ├── lib/
│   │   ├── api-client.ts      # Typed API client with Sanctum CSRF & correlation IDs
│   │   ├── auth-context.tsx   # AuthContext and useAuth session provider
│   │   └── utils.ts           # Class merging (cn), price and duration formatters
│   ├── types/
│   │   └── api.ts             # TypeScript definitions aligned with backend OpenAPI spec
│   ├── styles/
│   │   └── globals.css        # Tailwind CSS variables (light/dark mode tokens)
│   └── middleware.ts          # Edge middleware guarding /my-learning, /instructor, /admin
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 3. Technology & Architecture Choices
1. **Sanctum SPA Cookie Authentication:** No tokens stored in localStorage. Protected against XSS.
2. **Design System & Theming:** Custom HSL variables for dark/light themes with Radix UI accessibility primitives.
3. **API Contract Alignment:** Strongly typed API client unwrapping standard LearnHub error envelope (`code`, `message`, `details`, `correlation_id`).
4. **Performance & Security:** Security headers configured in `next.config.ts`, sub-500ms p95 targets, image remote patterns configured for CDN.
