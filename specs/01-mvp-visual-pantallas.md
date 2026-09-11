# SPEC 01 — MVP visual: pantallas de Arcade Vault

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-09-11
> **Objective:** Portar a Next.js las 5 pantallas visuales del template (Biblioteca, Detalle, Reproductor, Auth, Salón de la Fama) con navegación real y datos mock, sin implementar ningún juego jugable.

## Why this spec exists

El repo es hoy el scaffold sin modificar de `create-next-app`. Este spec introduce la primera estructura real de rutas, componentes y datos, migrando el prototipo estático en `references/templates/` (React vía CDN + hash routing) al App Router de Next.js 16. Es la base visual sobre la que después se conectará lógica real de juegos y backend.

## Scope

**In:**

- 5 pantallas, cada una como ruta real de App Router:
  - `/biblioteca` (Library) — grid de juegos, buscador, filtro por categoría. También es la ruta raíz: `/` redirige o renderiza el mismo contenido que `/biblioteca`.
  - `/juegos/[id]` (GameDetail) — portada, descripción, tags, stats, leaderboard del juego.
  - `/juegos/[id]/jugar` (GamePlayer) — HUD falso (puntuación, vidas, nivel), arena decorativa, modal de fin de partida con guardado de score.
  - `/auth` (Auth) — tabs iniciar sesión / crear cuenta, botón de invitado, botones sociales decorativos (sin OAuth real).
  - `/salon` (HallOfFame) — tabs por juego, podio top 3, tabla de puntuaciones, fila "tu mejor marca" si hay usuario.
- `Nav` global (desktop + panel móvil hamburguesa) y footer, montados en `app/layout.tsx`.
- Datos mock migrados de `references/templates/data.jsx` (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) a `lib/data.ts` tipado.
- CSS del template (`references/templates/styles.css`) portado a `app/globals.css`, debajo del `@import "tailwindcss"` existente, conservando variables (`--cyan`, `--magenta`, `--pixel`, etc.), keyframes y nombres de clase usados por los componentes (`.card`, `.chip`, `.crt`, `.cover-bricks`, etc.).
- Simulación visual del reproductor (HUD que suma puntos random cada 220ms vía `setInterval`, subida de nivel, modal "fin del juego") tal como en el template — es un mock decorativo, no un juego real.
- Persistencia en `localStorage` del navegador para usuario (`av_user`) y puntuaciones guardadas (`av_scores`), igual que el template.
- Componentes de pantalla completa como Client Components (`"use client"`), replicando la estructura de estado del template (useState/useEffect/useMemo).
- Tipografía: se usan `Press Start 2P` y `JetBrains Mono` de `next/font/google` (ya introducidas en `app/layout.tsx` por el commit `fe0eb9c`, previo a este spec), reemplazando a Geist/Geist Mono. Los nombres de fuente (`--pixel`, `--mono` en CSS) se remapean a `--font-pixel`/`--font-mono`.

**Out of scope (for future specs):**

- Cualquier juego jugable real (Bloque Buster, Caída, Serpentina, etc.) — el reproductor sigue siendo un mock visual.
- Backend, API routes, base de datos, autenticación real u OAuth.
- Modelos de dominio globales (`Game`, `Score`, `Player` en `types/` compartidos) — los tipos de esta spec viven localmente en `lib/data.ts`.
- Landing page (`home.jsx`) y página About/Contacto (`about.jsx`) de `references/templates/home-about/` — carpeta descartada para este MVP (incluye una nota `Untitled` que indica que ese diseño está mal implementado).
- Migración a fuentes retro de Google Fonts.
- Tests automatizados.
- Versión responsive pixel-perfect fuera de los breakpoints que ya trae `styles.css`.

## Data model

Se migra `references/templates/data.jsx` a `lib/data.ts`:

```ts
export type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string; // clase CSS, ej. "cover-bricks"
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;
};

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
};

export const GAMES: Game[];
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export const PLAYERS: string[];
export function seededScores(seed: number, count?: number): ScoreRow[];
```

Datos de sesión en `localStorage` (mismas claves que el template):

- `av_user`: `{ name: string } | null`.
- `av_scores`: array de `{ game: string; score: number; name: string; at: number }`.

## Implementation plan

1. Crear `lib/data.ts` con los tipos y el contenido migrado de `data.jsx` (`GAMES`, `CATS`, `PLAYERS`, `seededScores`).
2. ~~Portar `references/templates/styles.css` a `app/globals.css`~~ — **ya hecho** en el commit `fe0eb9c` (previo a este spec): CSS portado casi literal, `--pixel`/`--mono` remapeados a `--font-pixel`/`--font-mono` (Press Start 2P / JetBrains Mono), `#root` renombrado a `.av-root`, y sin el `body { font-family: Arial }` inconsistente. No requiere trabajo adicional.
3. Crear `components/Nav.tsx` (`"use client"`) migrando `nav.jsx`, usando `next/link` y `usePathname` para el estado activo en vez de comparar `route.name`.
4. Crear `app/layout.tsx` actualizado: montar `Nav` y el footer del template, manteniendo `LayoutProps<"/">`.
5. Crear `app/biblioteca/page.tsx` (`"use client"`) migrando `biblioteca.jsx` (`Library` + `GameCard`), navegando con `next/link` a `/juegos/[id]`.
6. Hacer que `app/page.tsx` renderice el mismo contenido que `/biblioteca` (o redirija con `redirect("/biblioteca")`).
7. Crear `app/juegos/[id]/page.tsx` (`"use client"`) migrando `detalle.jsx`, usando `PageProps<"/juegos/[id]">` y `GAMES.find`.
8. Crear `app/juegos/[id]/jugar/page.tsx` (`"use client"`) migrando `reproductor.jsx`, incluyendo el `setInterval` de puntuación falsa, el modal de fin de juego y el guardado en `localStorage` (`av_scores`).
9. Crear `app/auth/page.tsx` (`"use client"`) migrando `auth.jsx`, guardando el usuario en `localStorage` (`av_user`) al enviar el formulario o al entrar como invitado, y redirigiendo a `/biblioteca`.
10. Crear `app/salon/page.tsx` (`"use client"`) migrando `salon.jsx` (`HallOfFame`), leyendo el usuario actual desde `localStorage`.
11. Conectar el botón de sesión del `Nav` (mostrar nombre de usuario / botón "Iniciar Sesión") leyendo `av_user` de `localStorage` y permitiendo cerrar sesión.
12. Revisión visual manual de las 5 rutas en `next dev` comparando contra `references/templates/Arcade Vault.html` abierto en el navegador.

## Acceptance criteria

- [ ] `/` y `/biblioteca` muestran el grid de juegos, buscador funcional y chips de categoría que filtran la lista.
- [ ] Click en una card o en "JUGAR" navega a `/juegos/[id]` con los datos correctos del juego.
- [ ] `/juegos/[id]` muestra portada, tags, descripción, stats y leaderboard de 10 filas generado por `seededScores`.
- [ ] Botón "JUGAR AHORA" en el detalle navega a `/juegos/[id]/jugar`.
- [ ] En `/juegos/[id]/jugar`, la puntuación sube automáticamente mientras no está en pausa ni terminado.
- [ ] Botón "PAUSA" detiene el incremento de puntuación y lo reanuda al volver a pulsarlo.
- [ ] Botón "FIN" abre el modal de fin de juego con la puntuación final.
- [ ] Guardar la puntuación en el modal la persiste en `localStorage` bajo `av_scores` y muestra el mensaje de confirmación.
- [ ] `/auth` permite alternar entre tab "Iniciar sesión" y "Crear cuenta", enviar el formulario guarda el usuario en `localStorage` (`av_user`) y redirige a `/biblioteca`.
- [ ] "Jugar como invitado" en `/auth` navega a `/biblioteca` sin usuario guardado.
- [ ] El `Nav` muestra "Iniciar Sesión" sin usuario y el nombre de usuario (con opción de cerrar sesión) cuando hay uno guardado en `localStorage`.
- [ ] `/salon` muestra tabs por juego, podio top 3 y tabla de puntuaciones que cambian al seleccionar otro juego.
- [ ] Con usuario logueado, `/salon` muestra la fila adicional "tu mejor marca".
- [ ] El menú hamburguesa funciona en viewport móvil (abre/cierra el panel lateral).
- [ ] `next build` compila sin errores de TypeScript ni de ESLint.

## Decisions

- **Sí:** rutas reales de App Router en español (`/biblioteca`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`) en vez del hash routing del template. Es el patrón nativo de Next.js y evita reinventar un router.
- **No:** incluir `home.jsx`/`about.jsx` de `references/templates/home-about/`. Ese set trae su propio `nav.jsx` y `styles.css` en conflicto con el set principal, y el archivo `Untitled` adjunto indica explícitamente que ese diseño está mal implementado.
- **Sí:** mantener la simulación falsa de puntuación en el reproductor (`setInterval` random). Es un mock decorativo para completar la vista, no constituye "implementar un juego".
- **Sí:** persistir usuario y scores en `localStorage`, igual que el template, para que la demo se sienta completa sin necesitar backend.
- **Sí (revisado durante /spec-impl):** migrar a las fuentes Google Fonts del template (Press Start 2P, JetBrains Mono) en vez de Geist/Geist Mono. Este cambio ya estaba hecho en el repo (commit `fe0eb9c`, previo a este spec) antes de que se aprobara la decisión original "No"; se mantiene por ser trabajo ya realizado y porque calza mejor con el diseño pixel-art que Geist.
- **Sí:** portar `styles.css` casi literal a `app/globals.css` en vez de reescribir todo en utilidades Tailwind, para minimizar el riesgo de desviarse del diseño del template.
- **Sí:** cada pantalla como Client Component completo (`"use client"`), en vez de separar en islas Server/Client, porque todas tienen estado o interactividad y el template ya está estructurado así.
- **No:** crear tipos globales compartidos `Game`/`Score`/`Player`. Los tipos de este spec quedan locales a `lib/data.ts`; tipos globales se definirán cuando exista lógica de juego real.

## Risks

| Risk | Mitigation |
| --- | --- |
| `localStorage` deshabilitado (modo privado/SSR) | Envolver accesos en `try/catch` como ya hace el template; sin persistencia la app sigue siendo usable en la sesión. |
| Migrar de hash-state a rutas reales puede romper referencias cruzadas entre pantallas (`navigate({name, id})`) | Reemplazar cada `navigate(...)` del template por el `href` o `router.push` equivalente durante la migración de cada archivo, verificando cada link manualmente en el paso 12. |
| CSS portado casi literal puede chocar con utilidades Tailwind ya usadas en `app/page.tsx`/`globals.css` actuales | `app/page.tsx` se reemplaza por completo en el paso 6; no queda markup del scaffold original que dependa de las utilidades por defecto. |

## What is **not** in this spec

- Ningún juego jugable (Bloque Buster, Caída, Serpentina, Glotón, Invasores, Rocas, Ranaria, Duelo Pixel).
- Backend, API routes o autenticación real.
- Landing page y página About/Contacto de `home-about/`.
- Fuentes retro de Google Fonts.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
