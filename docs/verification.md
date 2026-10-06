# Current release verification

Recorded on 2026-10-06 using disposable local data. Historical deployment is a separate owner-provided fact.

## Passed locally

Type checking and static Expo web export passed. An incremental Markdown parser could loop forever on a partial table header during streaming; its pure parser now has prefix regression checks. The default web preview uses the existing non-Skia fallback. Browser checks passed completed mock replies, conversation restoration after refresh and cancellation. Mock sign-in and the visible demonstration label are retained. Native device and opt-in CanvasKit verification are separate remaining checks.

## Checks and commands

```sh
npm ci
npm run typecheck
npm run web
# Static browser preview:
npm run build:web
python -m http.server 8092 --directory dist
```

## CI status

The configured GitHub Actions workflows are registered, but the initial runs ended with startup_failure before any jobs or check annotations were created. Local results above are independent of CI. No passing CI badge is shown; the service supplied no further diagnostic message through the available API.

## Remaining platform and coverage limits

Authentication and assistant responses are local mocks. The default browser fallback is the supported demonstration path; enabling EXPO_PUBLIC_ENABLE_SKIA_WEB=1 opts into a separately unverified CanvasKit path. No real AI, remote account security or cross-device synchronization is claimed.

PHP checks used PHP 8.4.26; Node builds used Node 24.19; Python checks used Python 3.12.10 where applicable. This record does not claim production hardening, paid provider verification or tests on every platform.
