// tools/node-sass-compat/index.js
const sass = require('sass');

function translate(options = {}) {
  const { outputStyle, ...rest } = options;
  // node-sass の値 → dart-sass の値へマッピング
  const style =
    outputStyle === 'nested' || outputStyle === 'compact'
      ? 'expanded'
      : outputStyle === 'compressed'
      ? 'compressed'
      : rest.style;

  return { ...rest, style };
}

exports.render = (opts, cb) => sass.render(translate(opts), cb);
exports.renderSync = (opts) => sass.renderSync(translate(opts));
// 雑に info を返す（node-sass 互換で参照されることがある）
exports.info = `node-sass-compat (dart-sass ${sass.info || ''})`;
