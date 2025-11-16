# Exequias API

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0F172A)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-ff69b4?logo=prettier&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

API Express moderne, typée « stack JS », avec Drizzle ORM et PostgreSQL (Neon/SaaS ou self-hosted). Pensée pour être lisible, extensible, et prête à l’emploi.

---

## 🚀 Aperçu

- Accédez à `GET /` pour un aperçu HTML stylé (servi via `app.get('/')`).
- Endpoints système: `GET /health` (statut) et `GET /api` (ping JSON).
- La page est responsive, minimaliste et prête à personnaliser (`src/server-page.html`).

> Astuce: changez le gradient `--accent1` et la police Google Fonts pour matcher votre brand.

---

## 🧩 Technologies

- Express 5 (middleware moderne, `helmet`, `cors`, `cookie-parser`)
- Drizzle ORM (schéma en `pg-core`, migrations avec `drizzle-kit`)
- PostgreSQL via Neon HTTP (`@neondatabase/serverless` + `drizzle-orm/neon-http`)
- Winston + Morgan (logs JSON + console en dev)
- ESLint + Prettier (qualité et style de code)

---

## 🛠️ Outils & Dépendances (groupés et expliqués)

Core Web
- `express` — framework HTTP pour définir routes et middlewares (`src/app.js`).
- `dotenv` — charge `.env` automatiquement via `src/index.js`.

Sécurité
- `helmet` — sécurise les en‑têtes HTTP; réduit surface d’attaque courante.
- `cors` — autorise le front (autre domaine) à appeler l’API; configurez `origin` en prod.
- `cookie-parser` — sérialise/désérialise les cookies; combiné avec options sûres (`utils/cookies.js`).

Logs & Observabilité
- `morgan` — trace chaque requête HTTP; branché sur `winston` (via stream) pour centraliser.
- `winston` — logger JSON; enregistre dans `logs/combined.log` et `logs/error.log`, console en dev.

Base de données & ORM
- `drizzle-orm` — ORM typé pour Postgres (définit schémas, requêtes, migrations) (pg-core), requêtes chainées, retours typés.
- `@neondatabase/serverless` — driver HTTP Neon; parfait en serverless ou dev rapide.
- `drizzle-kit` (dev) — génère/applique migrations; ouvre Drizzle Studio.

Authentification
- `bcrypt` — hache les mots de passe (salage, coût 10). Utilisé dans `auth.service.js`.
- `jsonwebtoken` — signe/vérifie des tokens JWT (secret requis: `JWT_SECRET`, durée par défaut: `1d`).
- Cookies — `httpOnly`, `sameSite=strict`, `secure` en prod, `maxAge=15min` (`utils/cookies.js`).

Validation
- `zod` — valide les payloads des requêtes. Schémas `signupSchema` et `signinSchema` (`validations/auth.validation.js`). Facilite réponses 400 claires.

Qualité & DX (dev)
- `eslint`, `@eslint/js` — linting moderne pour JavaScript; voir `eslint.config.js`.
- `eslint-plugin-prettier` — exécute Prettier via ESLint.
- `prettier` — formate le code de façon cohérente; voir `.prettierrc`.

Aliases d’import
- Définis dans `package.json#imports` pour des chemins courts: `#config/*`, `#controllers/*`, `#routes/*`, `#utils/*`, etc.

Installation rapide (modules Auth)
```bash
npm install bcrypt jsonwebtoken zod
```
Ces modules sont requis pour `sign-up / sign-in`.

---

## 📦 Installation

1. Cloner le repo
2. Installer les dépendances

```bash
npm install
```

3. Créer un fichier `.env` à la racine en se basant sur `.env.example` (ou collez l’exemple ci‑dessous).

```env
# Serveur
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Base de données (PostgreSQL)
# Exemple Neon: postgres://user:password@host/dbname?sslmode=require
DATABASE_URL=postgres://user:password@host:5432/dbname

# Sécurité (JWT)
JWT_SECRET=change-me-in-production
```

---

## ▶️ Démarrage

```bash
# lance le serveur avec rechargement
npm run start
```

- Par défaut: écoute sur `http://localhost:3000` (modifiable via `PORT`).
- Route racine: renvoie la page `server-page.html`.

---

## 🗃️ Base de données et Migrations

- Configuration Drizzle: `drizzle.config.js`
- Schémas: `src/models/*.js` (ex: `users`)
- Driver: Neon HTTP (`drizzle-orm/neon-http`)

```bash
# Générer les migrations à partir des schémas
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Ouvrir Drizzle Studio (exploration DB)
npm run db:studio
```

> Note: le dialecte est `postgresql`. Assurez‑vous que `DATABASE_URL` pointe vers une instance valide.

---

## 🔧 Scripts utiles

- `npm run lint` — exécute ESLint
- `npm run lint:fix` — corrige automatiquement
- `npm run format` — applique Prettier
- `npm run format:check` — vérifie le formatage

---

## 📁 Structure

```
exequias-api/
├── drizzle.config.js
├── drizzle/
│   ├── 0000_unknown_epoch.sql
│   └── meta/
├── src/
│   ├── app.js            # configuration Express + middlewares, routes montées
│   ├── index.js          # charge .env et démarre le serveur
│   ├── server.js         # écoute sur PORT
│   ├── server-page.html  # page d’accueil stylée
│   ├── config/
│   │   ├── logger.js     # Winston + transports fichiers/console
│   │   └── database.js   # drizzle(neon-http) + export db
│   ├── models/
│   │   └── user.model.js # schéma users (pg-core)
│   ├── routes/
│   │   └── auth.route.js # endpoints /api/auth
│   ├── controllers/
│   │   └── auth.controller.js # logique signup (validation + cookies + token)
│   ├── services/
│   │   └── auth.service.js    # hash + création utilisateur en DB
│   ├── validations/
│   │   └── auth.validation.js # zod schemas (signup/signin)
│   └── utils/
│       ├── jwt.js        # signature/vérif JWT (secret + exp)
│       ├── cookies.js    # options httpOnly/secure/sameSite
│       └── format.js     # formatage des erreurs de validation
├── logs/
│   ├── combined.log
│   └── error.log
└── package.json
```

> Aliases d’import (via `package.json#imports`): `#config/*`, `#controllers/*`, `#routes/*`, `#utils/*`, etc.

---

## 🛣️ Endpoints

- `GET /` — page d’accueil HTML.
- `GET /health` — statut, timestamp, uptime.
- `GET /api` — ping JSON.
- `POST /api/auth/sign-up` — inscription utilisateur.
  - Body JSON (zod): `{ name, email, password, role? }`
  - Valide l’email et renvoie `201` avec `{ id, name, email, role }`
  - Dépose un cookie `token` (JWT) `httpOnly`, `sameSite=strict`, `secure` en prod.
- `POST /api/auth/sign-in` — authentification utilisateur.
  - Body JSON (zod): `{ email, password }`
  - Vérifie l’utilisateur en base puis compare le mot de passe (`comparePassword`).
  - À implémenter côté contrôleur: signer un JWT (`jwttoken.sign`) et le déposer en cookie via `cookies.set`.
- `POST /api/auth/sign-out` — déconnexion.
  - À implémenter: suppression du cookie (`cookies.clear`) et réponse `200`.

---

## 🧪 Essais rapides

```bash
# Démarrer
npm run start

# Ping
curl -i http://localhost:3000/api

# Health
curl -s http://localhost:3000/health | jq

# Inscription (exemple)
curl -i \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane.doe@example.com","password":"secret123","role":"user"}' \
  http://localhost:3000/api/auth/sign-up

# Connexion (exemple, une fois le contrôleur sign-in implémenté)
curl -i \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"secret123"}' \
  http://localhost:3000/api/auth/sign-in
```

Réponses attendues: `200` pour `/health` & `/api`, `201` pour un `sign-up` valide (avec en-tête `Set-Cookie: token=...`).

---

## 🔐 Sécurité & Cookies

- Cookie `token` configuré `httpOnly`, `sameSite=strict`, `secure` en prod, `maxAge=15min`.
- `JWT_SECRET` requis en prod (par défaut une valeur de dev est utilisée).

---

## 📝 Journalisation

- En dev: logs colorisés en console + fichiers `logs/combined.log` et `logs/error.log`.
- En prod: JSON structuré (timestamp, stack) via Winston.

---

## 🤝 Contribution

- Respectez ESLint et Prettier.
- Proposez des routes sous `src/routes/` et `src/controllers/`.
- Ajoutez vos schémas sous `src/models/` et générez vos migrations.

---

## 📜 Licence

ISC — voir le champ `license` dans `package.json`.

---

## 🧭 Roadmap (idées)

- Authentification (compléter sign-in/sign-out, refresh token)
- CRUD Users + validations
- Tests (Jest/Supertest)
- Observabilité (metrics, tracing)
