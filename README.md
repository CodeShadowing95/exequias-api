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
- La page est responsive, minimaliste et prête à personnaliser (`src/server-page.html`).

> Astuce: changez le gradient `--accent1` et la police Google Fonts pour matcher votre brand.

---

## 🧩 Technologies

- Express 5 (middleware moderne, `helmet`, `cors`, `cookie-parser`)
- Drizzle ORM (schéma en `pg-core`, migrations avec `drizzle-kit`)
- PostgreSQL (via `DATABASE_URL`, compatible Neon serverless)
- Winston + Morgan (logs JSON + console en dev)
- ESLint + Prettier (qualité et style de code)

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
│   ├── app.js            # configuration Express + middlewares
│   ├── index.js          # charge .env et démarre le serveur
│   ├── server.js         # écoute sur PORT
│   ├── server-page.html  # page d’accueil stylée
│   ├── config/
│   │   └── logger.js     # Winston + transports fichiers/console
│   ├── models/
│   │   └── user.model.js # schéma users (pg-core)
│   └── ...
├── logs/
│   ├── combined.log
│   └── error.log
└── package.json
```

> Aliases d’import (via `package.json#imports`): `#config/*`, `#models/*`, `#routes/*`, etc.

---

## 🧪 Essai rapide

```bash
# 1) démarrer
npm run start

# 2) ping de l’API
curl -i http://localhost:3000/
```

Réponse attendue: `HTTP/1.1 200 OK` + page HTML.

---

## 📝 Journalisation

- En dev: logs colorisés en console + fichiers `logs/combined.log` et `logs/error.log`.
- En prod: JSON structuré (timestamp, stack) via Winston.

---

## 🛣️ Endpoints

- `GET /` — page d’accueil HTML.
- Endpoints métiers: à ajouter dans `src/routes/` et `src/controllers/`.

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

- Authentification (JWT), gestion des rôles
- CRUD Users + validations
- Tests (Jest/Supertest)
- Observabilité (metrics, tracing)
