# nutriaide
Nutriction App
nutriaide/
├─ mobile/                  # Expo app
│  ├─ app/                  # Screens + navigation
│  ├─ components/
│  ├─ lib/
│  ├─ assets/
│  ├─ app.json
│  ├─ package.json
│  └─ tsconfig.json
├─ server/                  # Express API
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ src/
│  │  ├─ index.ts
│  │  ├─ env.ts
│  │  ├─ auth/
│  │  │  ├─ routes.ts
│  │  │  └─ service.ts
│  │  ├─ food/
│  │  │  ├─ routes.ts
│  │  │  └─ service.ts
│  │  ├─ logs/
│  │  │  ├─ routes.ts
│  │  │  └─ service.ts
│  │  ├─ meds/
│  │  │  ├─ routes.ts
│  │  │  └─ service.ts
│  │  ├─ doctor/
│  │  │  ├─ routes.ts
│  │  │  └─ report.ts
│  │  └─ ocr/
│  │     └─ routes.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ .env.example
└─ README.md
