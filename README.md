This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ✨ Fonctionnalités

- 🎫 Achat de billets en ligne (Normal, VIP, VVIP)
- 💳 Paiement via **Wave** et **Orange Money**
- 📲 Billet électronique avec **QR code** unique et sécurisé
- 📊 Dashboard organisateur avec stats en temps réel
- 🔐 Authentification sécurisée via **Clerk**
- 📱 Interface **mobile-first** optimisée 2G/3G
- ✅ Application de scan pour le contrôle d'accès

---

## 🛠 Stack Technique

| Couche                  | Technologie             |
| ----------------------- | ----------------------- |
| Framework               | Next.js 14 (App Router) |
| Langage                 | TypeScript 5 strict     |
| Auth                    | Clerk                   |
| Base de données         | Supabase (PostgreSQL)   |
| ORM                     | Prisma 5                |
| Style                   | Tailwind CSS + DaisyUI  |
| Stockage fichiers       | Supabase Storage        |
| Temps réel              | Supabase Realtime       |
| Gestionnaire de paquets | pnpm                    |
| Déploiement             | Vercel                  |

---

## 📋 Prérequis

Avant de commencer, assure-toi d'avoir installé :

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- Un compte [Supabase](https://supabase.com)
- Un compte [Clerk](https://clerk.com)

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/ton-username/billeto.git
cd billeto
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Copie le fichier d'exemple et remplis les valeurs :

```bash
cp .env.example .env.local
```

Ouvre `.env.local` et renseigne toutes les clés (voir section [Variables d'environnement](#-variables-denvironnement)).

### 4. Initialiser la base de données

```bash
# Appliquer les migrations Prisma
pnpm prisma migrate dev --name init

# Générer le client Prisma
pnpm prisma generate
```

### 5. Lancer en développement

```bash
pnpm dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

---

## 🔑 Variables d'Environnement

Crée un fichier `.env.local` à la racine avec les variables suivantes :

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Prisma / Base de données Supabase
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Paiements
WAVE_API_KEY=
WAVE_WEBHOOK_SECRET=
ORANGE_MONEY_API_KEY=
ORANGE_MONEY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
QR_HMAC_SECRET=un_secret_long_et_aleatoire
```

> ⚠️ Ne commite **jamais** le fichier `.env.local`. Il est déjà dans le `.gitignore`.

---

## 📁 Structure du Projet

```
Ambians/
├── app/
│   ├── (auth)/           # Pages Clerk (sign-in, sign-up)
│   ├── (public)/         # Pages visiteurs (accueil, événements)
│   ├── (dashboard)/      # Pages organisateur (protégées)
│   ├── (admin)/          # Pages admin Billeto
│   └── api/              # Route Handlers & Webhooks
├── components/           # Composants React réutilisables
├── lib/                  # Utilitaires (Prisma, Supabase, Wave…)
├── hooks/                # Custom React hooks
├── types/                # Types TypeScript globaux
├── prisma/
│   └── schema.prisma     # Schéma de la base de données
└── middleware.ts         # Protection des routes via Clerk
```

---

## 🧰 Commandes Utiles

```bash
# Développement
pnpm dev                  # Lancer le serveur de développement
pnpm build                # Build de production
pnpm start                # Lancer le build de production
pnpm lint                 # Vérifier le code avec ESLint

# Prisma
pnpm prisma migrate dev   # Créer et appliquer une migration
pnpm prisma generate      # Regénérer le client Prisma
pnpm prisma studio        # Interface visuelle de la base de données

# Supabase
pnpm supabase start       # Lancer Supabase en local
pnpm supabase db push     # Pousser les changements de schéma
```

---

## 💳 Modèle Économique

Billeto prend une commission sur chaque billet vendu :

| Volume de billets   | Commission |
| ------------------- | ---------- |
| < 200 billets       | 10 %       |
| 200 – 1 000 billets | 7,5 %      |
| > 1 000 billets     | 5 %        |

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Crée ta branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commite tes changements (`git commit -m 'feat: ajout de ma fonctionnalité'`)
4. Push sur la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvre une Pull Request

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
