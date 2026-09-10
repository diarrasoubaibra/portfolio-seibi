# Portfolio Sei Bi Boye

Site portfolio (Next.js 14, App Router, TypeScript) avec un espace **Atelier**
protégé par mot de passe (`/admin`) où le propriétaire du portfolio peut
modifier tout le contenu (missions, expertises, parcours, contact…) depuis
une interface web, sans toucher au code.

## Comment ça marche

- **Page publique (`/`)** : rendue à partir de `data/content.json`.
- **Atelier (`/admin`)** : protégé par `middleware.ts`, qui redirige vers
  `/admin/login` si la session n'est pas valide. Un seul compte admin
  (mot de passe unique), pas de gestion multi-utilisateurs.
- **Enregistrement depuis l'Atelier** :
  - En **développement local** (`npm run dev`, sans `GITHUB_TOKEN` configuré),
    l'enregistrement écrit directement dans `data/content.json` sur le disque.
  - En **production sur Vercel/Netlify** (disque non persistant entre les
    requêtes), l'enregistrement fait un **commit direct sur GitHub** via
    l'API GitHub (fichier `data/content.json`), ce qui déclenche le
    redéploiement automatique déjà configuré par Vercel/Netlify sur ce
    dépôt. Le site public reflète donc le changement environ **1 minute**
    après l'enregistrement (le temps du build), pas instantanément.

Ce choix (commit Git plutôt qu'une base de données) évite d'avoir à
provisionner et maintenir une base de données externe pour un simple
portfolio, et donne gratuitement un historique complet des modifications
(chaque enregistrement = un commit).

## Démarrage local

```bash
npm install
cp .env.example .env.local
npm run hash-password   # suit les instructions, colle le résultat dans .env.local
```

Dans `.env.local`, définis au minimum :

```
ADMIN_PASSWORD_SALT=...   # généré par npm run hash-password
ADMIN_PASSWORD_HASH=...   # généré par npm run hash-password
SESSION_SECRET=...        # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ne définis **pas** `GITHUB_TOKEN` en local : ça garde un cycle
édition → enregistrement → rechargement rapide, sans créer de commits à
chaque test.

```bash
npm run dev
```

- Site public : http://localhost:3000
- Atelier : http://localhost:3000/admin (redirige vers `/admin/login` si non connecté)

## Déploiement (Vercel ou Netlify)

1. Pousse ce dépôt sur GitHub.
2. Connecte le dépôt à Vercel ou Netlify (déploiement automatique à chaque push).
3. Dans les "Environment Variables" de l'hébergeur, ajoute :
   - `ADMIN_PASSWORD_SALT`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (mêmes
     valeurs que dans `.env.local`, ou régénère un mot de passe différent
     pour la prod avec `npm run hash-password`).
   - `GITHUB_TOKEN` : crée un **fine-grained personal access token** sur
     GitHub (Settings → Developer settings → Fine-grained tokens), limité à
     **ce seul dépôt**, avec la permission **Contents: Read and write**.
   - `GITHUB_OWNER` : ton nom d'utilisateur ou organisation GitHub.
   - `GITHUB_REPO` : le nom du dépôt.
   - `GITHUB_BRANCH` : `main` (ou la branche que l'hébergeur déploie).
4. Sur Vercel, active le stockage des images (**Storage → Create Database →
   Blob**, connecte-le au projet). Vercel ajoute automatiquement la variable
   `BLOB_READ_WRITE_TOKEN` — rien à copier-coller. Sans ce store, l'upload
   d'image depuis l'Atelier échoue en production (le repli disque local ne
   fonctionne que sur `npm run dev`, pas sur un hébergeur serverless).
5. Déploie. Le site public est servi immédiatement ; l'Atelier est
   accessible sur `/admin` avec le mot de passe défini à l'étape 3.

Donne l'URL `https://ton-domaine/admin` et le mot de passe uniquement au
propriétaire du portfolio — c'est le seul point d'entrée pour éditer le
contenu.

## Sécurité de l'Atelier

- Le mot de passe n'est **jamais** stocké en clair : seuls un sel et un hash
  (scrypt) vivent dans les variables d'environnement.
- La session est un cookie **httpOnly**, signé (HMAC-SHA256 via
  `SESSION_SECRET`), expirant après 7 jours — non lisible ni falsifiable
  depuis le navigateur.
- `middleware.ts` bloque toute page sous `/admin` sans session valide ;
  `app/api/content/route.ts` revérifie la session côté serveur avant
  d'accepter un enregistrement (défense en profondeur, indépendante du
  middleware).
- Le token GitHub ne doit avoir accès qu'à **ce dépôt** (fine-grained token),
  jamais un token classique avec accès à tous tes dépôts.

## Modifier le design ou la structure

- Contenu : `data/content.json` (structure typée dans `types/content.ts`).
- Composants de la page publique : `components/*.tsx`.
- Styles : `app/globals.css` (page publique) et `app/admin/admin.css`
  (Atelier). Polices (`DM Serif Display` + `Manrope`) chargées via
  `next/font/google` dans `app/layout.tsx`.
- Formulaire d'édition : `app/admin/AdminEditor.tsx`.

## Note sur ce livrable

Ce projet a été écrit et vérifié (syntaxe de chaque fichier, logique
d'authentification testée unitairement) sans pouvoir exécuter
`npm install && npm run dev` dans l'environnement où il a été généré
(accès au registre npm bloqué côté sandbox). Fais tourner `npm install`
puis `npm run dev` en local avant de déployer, et signale tout problème
d'installation — le code lui-même (logique, imports, JSX) a été
soigneusement relu et testé unitairement partout où c'était possible.
