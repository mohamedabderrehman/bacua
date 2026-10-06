# API and execution paths

This index is extracted from the current source. Router-local paths require their mount prefix from the server entry point. PHP endpoint paths map directly to files unless Apache rewrites them. Controllers and auth middleware are authoritative for request bodies and permissions.

See the source entry points below; this project does not declare Express/Flask router paths.

## Source entry points

- [package.json](../package.json)
- [index.web.js](../index.web.js)

## الاستخدام

المسارات المذكورة محلية للموجه وتحتاج بادئة الربط في الخادم. ملفات PHP هي مرجع المسارات ما لم تُعَد كتابتها. استخدم بيانات اصطناعية وفحوص الصلاحيات الموجودة في الشيفرة.


## Representative usage

There is no network AI endpoint in this frontend. AIProvider.send is an asynchronous iterable of delta, sources and done events; cancellation uses AbortSignal. The UI stores partial stopped text rather than discarding it. A future provider must implement that contract and identify real source data independently.

```sh
npm run check:markdown
npm run typecheck
# Source contract: src/services/ai/types.ts
# Current provider: src/services/ai/mock.ts
```
