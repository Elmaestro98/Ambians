# 🎟 Billeto — Contexte Projet pour Gemini Code Assist

## 📌 Présentation

Ambians est une plateforme de vente de billets en ligne pour des événements
(concerts, galas, soirées). Les organisateurs publient leurs événements, les
acheteurs paient via mobile money, et reçoivent un billet électronique avec QR code.

---

## ⚙️ Stack Technique

| Couche          | Technologie             | Version   |
| --------------- | ----------------------- | --------- |
| Framework       | Next.js (App Router)    | 14+       |
| Langage         | TypeScript              | 5+ strict |
| Auth            | Clerk                   | Latest    |
| Base de données | Supabase (PostgreSQL)   | Latest    |
| ORM             | Prisma                  | 5+        |
| Style           | Tailwind CSS + DaisyUI  | 3+ / 4+   |
| Paiements       | Wave API + Orange Money | -         |
| Stockage        | Supabase Storage        | -         |
| Temps réel      | Supabase Realtime       | -         |
| Déploiement     | Vercel                  | -         |

---

## 🗂️ Structure des Dossiers

```
Ambians/
├── app/
│   ├── (auth)/                  # Pages Clerk : sign-in, sign-up
│   ├── (public)/                # Pages visiteurs : accueil, événements
│   │   ├── page.tsx             # Homepage
│   │   └── events/
│   │       ├── page.tsx         # Liste des événements
│   │       └── [id]/page.tsx    # Détail d'un événement
│   ├── (dashboard)/             # Pages organisateur (protégées)
│   │   ├── dashboard/page.tsx
│   │   ├── events/
│   │   │   ├── new/page.tsx     # Créer un événement
│   │   │   └── [id]/edit/page.tsx
│   │   └── payouts/page.tsx     # Reversements
│   ├── (admin)/                 # Pages admin Billeto
│   └── api/
│       ├── webhooks/
│       │   ├── clerk/route.ts   # Webhook Clerk → sync users
│       │   ├── wave/route.ts    # Webhook confirmation paiement Wave
│       │   └── orange/route.ts  # Webhook Orange Money
│       ├── events/route.ts
│       ├── tickets/route.ts
│       └── payments/route.ts
├── components/
│   ├── ui/                      # Composants DaisyUI réutilisables
│   ├── events/                  # Composants liés aux événements
│   ├── tickets/                 # Composants liés aux billets
│   └── dashboard/               # Composants du dashboard organisateur
├── lib/
│   ├── prisma.ts                # Instance Prisma singleton
│   ├── supabase.ts              # Client Supabase (server + client)
│   ├── wave.ts                  # Helpers Wave API
│   ├── orange-money.ts          # Helpers Orange Money API
│   ├── qrcode.ts                # Génération & vérification QR (HMAC-SHA256)
│   └── pdf.ts                   # Génération PDF billets
├── hooks/                       # Custom React hooks
├── types/                       # Types TypeScript globaux
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── middleware.ts                # Clerk auth middleware
```

---

## 🗄️ Modèle de Données Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  BUYER
  ORGANIZER
  ADMIN
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  REFUNDED
  FAILED
}

enum PaymentProvider {
  WAVE
  ORANGE_MONEY
}

enum PayoutStatus {
  PENDING
  PROCESSING
  DONE
  FAILED
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique          // ID Clerk
  email     String   @unique
  phone     String?
  name      String?
  role      Role     @default(BUYER)
  createdAt DateTime @default(now())

  events  Event[]
  orders  Order[]
  payouts Payout[]
}

model Event {
  id          String      @id @default(cuid())
  title       String
  description String
  date        DateTime
  venue       String
  city        String
  imageUrl    String?
  status      EventStatus @default(DRAFT)
  organizerId String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  organizer   User         @relation(fields: [organizerId], references: [id])
  ticketTypes TicketType[]
}

model TicketType {
  id      String @id @default(cuid())
  name    String                        // Ex: Normal, VIP, VVIP
  price   Float
  quota   Int
  sold    Int    @default(0)
  eventId String

  event   Event    @relation(fields: [eventId], references: [id])
  tickets Ticket[]
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  total      Float
  commission Float
  status     OrderStatus @default(PENDING)
  createdAt  DateTime    @default(now())

  user    User     @relation(fields: [userId], references: [id])
  tickets Ticket[]
  payment Payment?
}

model Ticket {
  id           String  @id @default(cuid())
  qrCode       String  @unique
  hmacSignature String
  scanned      Boolean @default(false)
  orderId      String
  ticketTypeId String

  order      Order      @relation(fields: [orderId], references: [id])
  ticketType TicketType @relation(fields: [ticketTypeId], references: [id])
  scanLogs   ScanLog[]
}

model Payment {
  id          String          @id @default(cuid())
  orderId     String          @unique
  provider    PaymentProvider
  amount      Float
  status      OrderStatus     @default(PENDING)
  reference   String?         // Référence retournée par Wave/OM
  webhookData Json?
  createdAt   DateTime        @default(now())

  order Order @relation(fields: [orderId], references: [id])
}

model Payout {
  id           String       @id @default(cuid())
  organizerId  String
  amount       Float
  status       PayoutStatus @default(PENDING)
  processedAt  DateTime?
  createdAt    DateTime     @default(now())

  organizer User @relation(fields: [organizerId], references: [id])
}

model ScanLog {
  id        String   @id @default(cuid())
  ticketId  String
  agentId   String
  result    Boolean                        // true = valide, false = rejeté
  reason    String?
  scannedAt DateTime @default(now())

  ticket Ticket @relation(fields: [ticketId], references: [id])
}
```

---

## 🔐 Authentification — Clerk

- Clerk gère l'inscription, la connexion, les sessions
- Le middleware `middleware.ts` protège les routes `(dashboard)` et `(admin)`
- Le webhook `/api/webhooks/clerk` synchronise les users Clerk → table `User` Prisma
- Pour récupérer l'utilisateur courant :

```typescript
// Côté serveur (Server Component / Route Handler)
import { auth, currentUser } from "@clerk/nextjs/server";
const { userId } = await auth();
const user = await currentUser();

// Côté client (Client Component)
import { useUser } from "@clerk/nextjs";
const { user, isLoaded } = useUser();
```

- Le `clerkId` est stocké dans la table `User` pour faire le lien avec Prisma

---

## 🗃️ Supabase

- **Base de données** : PostgreSQL via Prisma (on n'utilise PAS le client Supabase pour les requêtes DB)
- **Stockage** : Supabase Storage pour les affiches d'événements et les PDF de billets
- **Realtime** : Supabase Realtime pour les notifications de nouvelles ventes (dashboard organisateur)

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Client serveur (Route Handlers, Server Actions)
export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Client navigateur (Client Components)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

---

## 🎨 Style — Tailwind CSS + DaisyUI

- **DaisyUI** est le système de composants principal (btn, card, modal, badge, table…)
- **Tailwind** pour les ajustements fins et le layout
- Thème DaisyUI utilisé : `night` (sombre) ou personnalisé dans `tailwind.config.ts`
- Conventions de nommage des classes :

```tsx
// ✅ Utiliser les composants DaisyUI en priorité
<button className="btn btn-primary">Acheter</button>
<div className="card bg-base-100 shadow-xl">...</div>
<span className="badge badge-success">Disponible</span>

// ✅ Tailwind pour le layout
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

---

## 💳 Paiements

### Wave API

- Initiation : `POST https://api.wave.com/v1/checkout/sessions`
- Webhook de confirmation reçu sur `/api/webhooks/wave`
- Vérification signature : header `X-Wave-Signature` (HMAC-SHA256)

### Orange Money API

- Initiation : USSD push vers le numéro du client
- Webhook de confirmation reçu sur `/api/webhooks/orange`

### Flux général

```
1. POST /api/payments/initiate  →  crée Order (PENDING) + appelle Wave/OM
2. Wave/OM envoie webhook       →  /api/webhooks/wave ou /orange
3. Webhook vérifie signature    →  met à jour Order (CONFIRMED)
4. Génère Tickets + QR codes    →  envoie email avec PDF
```

---

## 🔧 Variables d'Environnement

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma / Supabase DB
DATABASE_URL=
DIRECT_URL=

# Paiements
WAVE_API_KEY=
WAVE_WEBHOOK_SECRET=
ORANGE_MONEY_API_KEY=
ORANGE_MONEY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
QR_HMAC_SECRET=
```

---

## 📐 Conventions de Code

- **Langue** : code en anglais, commentaires en français
- **Typage** : TypeScript strict, pas de `any`
- **Composants** : Server Components par défaut, `"use client"` uniquement si nécessaire
- **Fetching** : `fetch` natif Next.js avec `cache` et `revalidate` dans les Server Components
- **Mutations** : Server Actions (`"use server"`) ou Route Handlers pour les webhooks
- **Erreurs** : toujours typer les erreurs, utiliser `try/catch` sur les appels API externes
- **Nommage fichiers** : `kebab-case.ts`, composants `PascalCase.tsx`

---

## 🚀 Commandes Utiles

```bash
# Dev
pnpm dev

# Prisma
pnpm prisma migrate dev --name nom_migration
pnpm prisma generate
pnpm prisma studio

# Supabase CLI
pnpm supabase start
pnpm supabase db push
```

---

\_
