// server/src/env.ts
['DATABASE_URL', 'JWT_SECRET', 'PUBLIC_BASE_URL'].forEach((k) => {
    if (!process.env[k]) throw new Error(`Missing env: ${k}`);
  });
  