# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — plataforma para jugar juegos online y competir por la mayor cantidad de puntos (leaderboard-style). README y comunicación del proyecto en español.

**Estado actual: scaffold de `create-next-app` sin modificar.** Solo existen `app/layout.tsx`, `app/page.tsx` (splash de Next), `app/globals.css`. Todavía NO hay juegos, rutas, modelo de datos, tipos (`Game`/`Score`/`Player`), API, estado global, ni tests. No inventar arquitectura que no existe.

**Workflow: Spec Driven Design** vía skills `/spec` y `/spec-impl` de `Klerith/fernando-skills` (`npx skills@latest add Klerith/fernando-skills`). Estas skills aún no están instaladas y no hay `specs/` en el repo.



## Stack y gotchas de versión

Requiere leer varios archivos para entenderse; el training data probablemente está desactualizado.

- **Next.js 16.3.4 + React 19.2.8**, App Router. Antes de escribir código Next, consultar `node_modules/next/dist/docs/` (`01-app`, `03-architecture`, `index.md`), especialmente `01-app/02-guides/upgrading/version-16.md`.
- **Route types globales** (Next 16): `app/layout.tsx` usa `LayoutProps<"/">` — tipo generado en `.next/types`, no se importa. Usar el mismo patrón para nuevas páginas/layouts: `PageProps<"/ruta">`.
- **`middleware.ts` → `proxy.ts`** en Next 16.
- Caching: directivas `use cache` + config `cacheComponents` reemplazan APIs antiguas.
- **Tailwind CSS v4** — configurado 100% en `app/globals.css` (`@import "tailwindcss"` + `@theme inline`). No hay `tailwind.config.*`. Plugin PostCSS: `@tailwindcss/postcss`. Tokens de tema son CSS vars (`--background`, `--foreground`, `--font-sans`, `--font-mono`); dark mode vía `@media (prefers-color-scheme: dark)` sobre `:root` (no basado en clase).
- Inconsistencia latente: `globals.css` fija `body { font-family: Arial... }` mientras `layout.tsx` cablea las vars de Geist y `page.tsx` usa `font-sans`.
- **ESLint 9 flat config** (`eslint.config.mjs`): `eslint-config-next/core-web-vitals` + `/typescript`.
- TS `strict: true`. Alias de path **`@/*` → raíz del repo** (no `src/`).
- Fuentes `Geist` / `Geist_Mono` vía `next/font/google`, conectadas a CSS vars en el root layout.
- Todos los componentes actuales son Server Components; no hay `"use client"` en el repo.

## AGENTS.md

El bloque `nextjs-agent-rules` en `AGENTS.md` lo reescribe `next dev`. Commitearlo junto con el trabajo en vez de borrarlo del diff. Mantener la línea `@AGENTS.md` de arriba.
