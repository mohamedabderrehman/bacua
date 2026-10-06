/**
 * Replaces `import.meta` with `{}`.
 *
 * zustand's middleware bundle (the module that also exports `persist`, which we do use)
 * reads `import.meta.env.MODE` to auto-enable Redux devtools. Metro's web target emits
 * that untouched into a classic <script>, and the browser rejects the whole bundle with
 * "Cannot use 'import.meta' outside a module" before a single line runs — a blank page
 * with no console output.
 *
 * Rewriting it to `{}` makes `import.meta.env` evaluate to undefined, which is exactly
 * the branch zustand already handles (it leaves devtools off). Scoped to web in the
 * config below, since the native transform profile handles this correctly on its own.
 */
function transformImportMeta({ types: t }) {
  return {
    name: 'bacua-transform-import-meta',
    visitor: {
      MetaProperty(path) {
        const { node } = path;
        if (node.meta && node.meta.name === 'import' && node.property.name === 'meta') {
          path.replaceWith(t.objectExpression([]));
        }
      },
    },
  };
}

module.exports = function (api) {
  const platform = api.caller((caller) => (caller ? caller.platform : null));
  // Cache key must include the platform, or the first-bundled platform's config sticks.
  api.cache.using(() => platform);

  const plugins = [];
  if (platform === 'web') {
    plugins.push(transformImportMeta);
  }
  // Reanimated 4 moved its Babel plugin into react-native-worklets.
  // It must stay last in the list.
  plugins.push('react-native-worklets/plugin');

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
