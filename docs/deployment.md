# Deployment and troubleshooting

## Historical status

Designed frontend application. Authentication and assistant replies are mocked; there is no deployed AI service implied.

تطبيق واجهة مصمم بعناية. المصادقة وإجابات المساعد محاكاة؛ لا يُفترض وجود خدمة ذكاء اصطناعي منشورة.

## Local release environment

Use fresh configuration, a disposable database/corpus and independently installed dependencies. This release never needs retired production services. Keep credentials, uploaded files, sessions, caches and signing material outside the public source. Credential removal does not revoke a provider key.

## Troubleshooting

### Web page blank

Inspect browser console and index.web.js CanvasKit initialization/fallback.

### Mock account accepted

This is the documented frontend behavior; no real authentication service is connected.

### State appears old

Use application reset controls or clear site storage for the local demo.

### Expo package mismatch

Use the committed dependency baseline; do not run blanket upgrades during release review.

## Current limits

Frontend only. Accounts and responses are simulated; live LLM, retrieval, synchronization and real account security are roadmap work.

واجهة فقط؛ الحسابات والأجوبة محاكاة. النموذج الحقيقي والاسترجاع والمزامنة وأمن الحسابات ضمن خارطة الطريق.
