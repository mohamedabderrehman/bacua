// Web entry point.
//
// CanvasKit must be on the global object *before* the app module graph is imported.
// Loading it from a React effect is too late: by then Skia's web container has already
// been initialised, and its draw call runs inside a Reanimated worklet whose closure was
// serialised without CanvasKit. The symptom is
//
//   Cannot read properties of undefined (reading 'PictureRecorder')
//     at PictureRecorder (skia/web/JsiSkia.js)
//     at drawOnscreen (sksg/Container.web.js)
//
// which fires on first paint rather than at load, so it survives a hard refresh.
//
// This is the pattern react-native-skia documents as "defer root component registration
// until Skia loads": await the loader, and only then import the router entry.
import { loadSkia } from './src/utils/skiaLoader';

// `finally`, not `then`: if CanvasKit fails we still boot the app. isSkiaAvailable() will
// report false and the Skia components fall back to their non-Skia rendering.
loadSkia().finally(() => {
  require('expo-router/entry');
});
