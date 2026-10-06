// Native entry point.
//
// Skia is linked into the binary on iOS and Android, so there is nothing to wait for and
// this just hands off to expo-router. The web counterpart (index.web.js) has to load
// CanvasKit first — see the comment there.
// Explicit package main resolves this file on web exports too. Use the
// platform-resolved loader before importing any screen that mounts Skia.
import { loadSkia } from './src/utils/skiaLoader';
loadSkia().finally(() => {
  require('expo-router/entry');
});
