# Clean setup

Use the committed Expo SDK 54 dependencies. No backend or provider credentials are needed. Default web preview uses EXPO_PUBLIC_ENABLE_SKIA_WEB=0; set it to 1 only for a separate CanvasKit investigation. Mock sign-in accepts demonstration input; use learner@example.test and never a real password. Local persistence is browser/device storage, not a remote account.

## Commands

```sh
npm ci
npm run typecheck
npm run web
# Static browser preview:
npm run build:web
python -m http.server 8092 --directory dist
```

## Complete configuration inventory

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


Variables in the inventory are not all mandatory: the preceding prerequisites identify the required core values. Provider variables are required only for their enabled live integration. Tests may use DEMO_API_URL to override the local target. Never point bootstrap/reset/check scripts at a production database.
