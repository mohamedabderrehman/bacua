# الإعداد

ثبّت باستخدام `npm ci` ثم شغّل `npm start` أو `npm run web`. افحص الأنواع عبر `npm run typecheck` وصدّر الويب عبر `npm run build:web`. لا تتطلب المصادقة أو الإجابات المحاكية بيانات خادم. قدم `dist/` عبر HTTP.

## التفاصيل والأوامر

Install with `npm ci`. Start using `npm start`, web with `npm run web`, check types with `npm run typecheck`, and export web with `npm run build:web`. No server credentials are required for mock authentication or assistant replies. Serve exported `dist/` over HTTP; do not open it as file URLs.

## متغيرات تقرأها الشيفرة

| Variable | Source consumer | Configuration rule |
|---|---|---|


لا تُحمَّل ملفات الأمثلة تلقائياً. تستخدم وحدات dotenv الملف حيث تكون مهيأة، ويستخدم PHP بيئة العملية أو الاستضافة. افصل المزودين عن العرض وأنشئ أسراراً جديدة واحفظها خارج المستودع.

## أوامر المكونات

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
