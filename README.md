# nutriaide
Nutriction App
nutriaide/
├── mobile/                # Expo app
│   ├── app/               # Screens
│   ├── lib/               # API + session helpers
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── .env.example
├── server/                # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts
│   │   ├── auth/
│   │   ├── food/
│   │   ├── logs/
│   │   ├── meds/
│   │   ├── doctor/
│   │   └── ocr/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── README.md
