# Exequias API – Warp Project Rules

These rules guide Warp’s agents (and humans) when working in this repository.

---

## 1. Tech stack & runtime

- **Runtime:** Node.js, ECMAScript modules (`"type": "module"` in `package.json`).
- **Framework:** Express 5 (`src/app.js`).
- **Database:** PostgreSQL via Neon HTTP (`@neondatabase/serverless`) and Drizzle ORM.
- **Auth:** `bcrypt` for passwords, `jsonwebtoken` for JWTs, cookies for session transport.
- **Validation:** `zod`.
- **Logging:** Winston + Morgan.

**Agent instructions:**
- Use `import`/`export` syntax only (no `require`/`module.exports`).
- Prefer modern JS (async/await, arrow functions) consistent with existing code.
- When suggesting commands, assume **npm** (not yarn/pnpm).

---

## 2. Project scripts & commands

Use existing npm scripts from `package.json`:

- Dev server: `npm run start` (runs `node --watch src/index.js`).
- Lint: `npm run lint`.
- Lint + fix: `npm run lint:fix`.
- Format: `npm run format` / `npm run format:check`.
- DB tooling: `npm run db:generate`, `npm run db:migrate`, `npm run db:studio`.

**Agent instructions:**
- Prefer these scripts over raw `node`, `eslint`, `prettier`, or `drizzle-kit` CLI calls.
- When adding new workflows or docs, reference these scripts instead of hardcoding commands.

---

## 3. File structure & layering conventions

High-level structure (see `README.md` for more detail):

- `src/index.js` – loads env (`dotenv/config`) and imports `server.js`.
- `src/server.js` – starts the HTTP server.
- `src/app.js` – Express app configuration (middleware, base routes, route mounting).
- `src/config/` – infrastructure configuration:
  - `logger.js` – Winston logger (file + console transports).
  - `database.js` – Drizzle ORM + Neon HTTP client.
- `src/models/` – Drizzle schema definitions (e.g. `user.model.js`).
- `src/routes/` – Express routers (`auth.route.js`, etc.).
- `src/controllers/` – HTTP controllers containing request/response logic.
- `src/services/` – business logic, DB access via Drizzle.
- `src/validations/` – Zod schemas for payload validation.
- `src/utils/` – shared utilities (`jwt.js`, `cookies.js`, `format.js`, etc.).
- `drizzle/` – generated migrations and metadata (do not hand-edit casually).
- `logs/` – runtime log output.

**Agent instructions:**
- When adding a new feature:
  - **Route:** add a file under `src/routes/` and mount it in `src/app.js`.
  - **Controller:** put HTTP-specific logic in `src/controllers/`.
  - **Service:** put reusable business / DB logic in `src/services/`.
  - **Model:** add Drizzle schema(s) in `src/models/` and run DB scripts.
  - **Validation:** define Zod schemas in `src/validations/`.
  - **Utilities:** reusable helpers go in `src/utils/`.
- Keep controllers thin: validation + calling services + HTTP responses.
- Keep services responsible for DB access via Drizzle and domain rules.

---

## 4. Import aliases & module resolution

`package.json` defines import aliases under `imports`:

- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

**Agent instructions:**
- Prefer these aliases in new code instead of long relative paths.
  - Example: `import logger from '#config/logger.js';`
- Keep import style consistent with existing files (aliases first, then external packages).

---

## 5. Environment configuration

Environment variables (see `.env.example` and `README.md`):

- `PORT` – HTTP server port (default `3000`).
- `NODE_ENV` – `development` / `production` (affects logging and cookies).
- `LOG_LEVEL` – Winston log level (default `info`).
- `DATABASE_URL` – PostgreSQL connection string (Neon or self-hosted).
- `JWT_SECRET` – JWT signing secret (must be overridden in production).

**Agent instructions:**
- Do **not** hardcode secrets in source files or commands.
- When suggesting configuration changes, modify `.env.example` and document in `README.md` rather than committing real secrets.
- Use `process.env` consistently; centralize critical defaults in config modules when needed.

---

## 6. Coding style & linters

Configured by `.prettierrc` and `eslint.config.js`:

- Indent with **2 spaces**, no tabs.
- Line endings: **Unix** (`\n`).
- Quotes: **single quotes**.
- Require **semicolons**.
- `no-var`, prefer `const` where possible.
- Prefer arrow functions and object shorthand.
- `no-console` is allowed but structured logging via Winston is preferred in app logic.

**Agent instructions:**
- Always generate code conforming to these rules; run or suggest `npm run lint` and `npm run format` after substantial changes.
- Use `logger` (`#config/logger.js`) instead of `console.log` in production logic.
- For new tests (future work), respect ESLint globals defined for `tests/**/*.js`.

---

## 7. HTTP layer conventions

From `src/app.js` and `src/routes/auth.route.js`:

- Global middleware: `helmet`, `cors`, `express.json`, `express.urlencoded`, `cookie-parser`.
- Logging: `morgan('combined')` piped to Winston logger.
- Base routes:
  - `GET /` – serves `server-page.html`.
  - `GET /health` – returns `{ status, timestamp, uptime }`.
  - `GET /api` – simple JSON ping.
  - `POST /api/auth/sign-up` – user registration.
  - `POST /api/auth/sign-in` – placeholder.
  - `POST /api/auth/sign-out` – placeholder.

**Agent instructions:**
- When adding new endpoints, mount them under `/api/...` in `src/app.js` via dedicated routers in `src/routes/`.
- For new routes, follow the pattern: **router → controller → service → model**.
- Prefer JSON responses with explicit status codes and structured payloads (e.g. `{ message, data }` or `{ error, details }`).

---

## 8. Validation & error handling

From `src/validations/auth.validation.js` and `src/utils/format.js`:

- Use **Zod** schemas to validate request payloads.
- For signup, `signupSchema` checks name, email, password, role.
- Errors are formatted via `formatValidationError`, which expects the Zod error object.

From `src/controllers/auth.controller.js`:

- Controllers should:
  - `safeParse` the incoming body with the appropriate schema.
  - Return `400` with `{ error, details }` when validation fails.
  - Log invalid inputs with Winston where useful.
  - Use services like `createUser` for database operations.
  - Use utils (`jwttoken`, `cookies`) for JWT/cookie handling.

**Agent instructions:**
- When adding new endpoints, always:
  - Define a Zod schema in `src/validations/`.
  - Use `safeParse` and `formatValidationError` for error responses.
- Route unexpected errors through Express error handling (`next(error)`) instead of swallowing them.

---

## 9. Authentication & security

From `src/services/auth.service.js`, `src/utils/jwt.js`, and `src/utils/cookies.js`:

- Passwords are hashed with `bcrypt` (`saltRounds = 10`).
- JWTs are signed with `JWT_SECRET` and default expiry of `1d`.
- Cookies for auth tokens:
  - `httpOnly: true`
  - `sameSite: 'strict'`
  - `secure: NODE_ENV === 'production'`
  - `maxAge: 15 minutes`

**Agent instructions:**
- Do **not** return plaintext passwords or hashes in API responses.
- When implementing sign-in/sign-out or protected routes:
  - Reuse `hashPassword`/comparison logic and `jwttoken.verify`.
  - Use `cookies.set` / `cookies.clear` for cookie management.
  - Keep security defaults (httpOnly, sameSite, secure) intact unless there is a strong reason to change them.
- For new auth-related code, maintain French error/log messages for consistency unless the project is explicitly localized otherwise.

---

## 10. Database & Drizzle ORM

From `drizzle.config.js`, `src/config/database.js`, and `src/models/user.model.js`:

- Dialect: **PostgreSQL**.
- Drizzle uses Neon HTTP driver (`drizzle-orm/neon-http`).
- Schema files live in `src/models/*.js`.
- Migrations are generated into `drizzle/` via `npm run db:generate` and applied with `npm run db:migrate`.

**Agent instructions:**
- When adding new tables/columns:
  - Update or add schema files under `src/models/` using Drizzle `pg-core` helpers.
  - Run `npm run db:generate` then `npm run db:migrate` and update docs if needed.
- Avoid hand-editing SQL files in `drizzle/` unless you fully understand the implications.

---

## 11. Logging & observability

From `src/config/logger.js` and `src/app.js`:

- Winston writes to `logs/error.log` and `logs/combined.log`.
- In non-production envs, logs also go to the console with colors.
- HTTP logs are handled by Morgan and forwarded to Winston.

**Agent instructions:**
- Use `logger.info`, `logger.error`, etc. for application logs; avoid raw `console.log` in core logic.
- Include useful context in log messages (IDs, emails, etc.), but **never** log secrets or passwords.

---

## 12. Testing (future work)

`eslint.config.js` defines globals for Jest-style tests under `tests/**/*.js`, but no tests exist yet.

**Agent instructions:**
- When adding tests:
  - Place them under `tests/` and use Jest-style APIs (`describe`, `it`, `expect`, etc.).
  - Test controllers via HTTP (e.g. supertest) and services in isolation where appropriate.
- Keep tests aligned with existing layers (controllers vs services vs utils).

---

## 13. Warp-specific guidance

These notes are tailored for Warp agents but also useful for humans:

- Treat this file (`WARP.md`) as authoritative project context.
- When editing or generating code:
  - Respect the file structure and layering described above.
  - Use the import aliases defined in `package.json`.
  - Ensure new JavaScript passes `npm run lint` and `npm run format`.
- When creating new features, prefer small, focused changes across the appropriate layers rather than putting all logic into controllers.
- For any operation that changes the DB schema, **always** mention the need to run `npm run db:generate` and `npm run db:migrate`.
