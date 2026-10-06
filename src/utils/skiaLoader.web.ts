import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

/**
 * Skia readiness — web implementation.
 *
 * On web, Skia renders through CanvasKit, a ~7.6 MB WebAssembly module that must finish
 * loading *before* any Skia view mounts. Skip this and the first `<Canvas>` throws
 * "CanvasKit is not defined" from WebGLRenderer#onResize and takes the whole app down.
 *
 * `canvaskit.wasm` is served from `public/`, which Expo copies to the web root. The
 * explicit `locateFile` matters: canvaskit's own default resolves the binary relative to
 * the script directory, which is wrong once the loader has been bundled by Metro.
 */
let available = false;

export async function loadSkia(): Promise<void> {
  // Keep the existing lightweight backdrop on browsers with limited GPU/memory.
  // Native Skia is unchanged; enable CanvasKit explicitly for web validation.
  if (process.env.EXPO_PUBLIC_ENABLE_SKIA_WEB !== '1') return;
  try {
    await LoadSkiaWeb({ locateFile: (file: string) => `/${file}` });
    available = true;
  } catch (error) {
    // Never hard-fail the app over the backdrop. Components fall back to non-Skia
    // rendering via isSkiaAvailable(), so the rest of the UI still works.
    available = false;
    console.warn('[bacua] CanvasKit failed to load; Skia visuals disabled on web.', error);
  }
}

export function isSkiaAvailable(): boolean {
  return available;
}
