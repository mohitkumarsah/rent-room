# OAuth DEV Configuration Notes

This repo's `.env` is ignored by git (see `.gitignore`).

For local development where port 3000 is busy and the server starts on 3001, set:

```env
NODE_ENV=development
PORT=3001
OAUTH_SERVER_URL=http://localhost:3001
```

If the dev server ends up using a different port (e.g. 3002), update `OAUTH_SERVER_URL` to match that actual port.

