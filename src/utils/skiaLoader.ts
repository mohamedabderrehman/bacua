/**
 * Skia readiness — native implementation.
 *
 * On iOS and Android Skia is linked into the binary, so there is nothing to load and it
 * is always available. The web counterpart (`skiaLoader.web.ts`) has to fetch CanvasKit's
 * WebAssembly before any Skia component mounts; Metro picks that file automatically for
 * the web platform, which keeps `canvaskit-wasm` out of the native bundles entirely.
 */
export async function loadSkia(): Promise<void> {
  // no-op
}

export function isSkiaAvailable(): boolean {
  return true;
}
