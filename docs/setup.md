# Setup and configuration

Install with `npm ci`. Start using `npm start`, web with `npm run web`, check types with `npm run typecheck`, and export web with `npm run build:web`. No server credentials are required for mock authentication or assistant replies. Serve exported `dist/` over HTTP; do not open it as file URLs.

## Environment variables read by source

| Variable | Source consumer | Configuration rule |
|---|---|---|


Environment examples do not load themselves. Node dotenv modules read local `.env` where configured; PHP uses its process/hosting environment. Keep provider integrations disconnected for demos. Generate a new secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` or equivalent, then store it privately.

## Declared component commands

### `package.json`

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "typecheck": "tsc --noEmit",
  "fix-deps": "expo install --fix",
  "web": "expo start --web",
  "build:web": "expo export --platform web"
}
```

## Source boundaries

| Component | Responsibility |
|---|---|
| `app/` | Expo Router screens |
| `src/` | State, curriculum, mock AI and shared interface modules |
| `index.web.js` | Web initialization entry |
| `assets/` | Fonts and visual assets |
