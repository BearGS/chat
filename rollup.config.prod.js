import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import { name, version, author, main, module, cjs } from './package.json'
import baseConfig from './rollup.config.base'

// banner
const banner =
  `${'/*!\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2018-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the MIT License.\n` +
  ` */`

export default [
  {
    ...baseConfig,
    output: [
      {
        name,
        banner,
        file: main,
        format: 'umd'
      },
      {
        banner,
        file: cjs,
        format: 'cjs'
      },
      {
        banner,
        file: module,
        format: 'es'
      },
    ],
    plugins: [...baseConfig.plugins]
  },
  {
    ...baseConfig,
    output: [
      {
        name,
        banner,
        format: 'umd',
        file: `dist/${name}.min.js`,
      },
    ],
    plugins: [
      ...baseConfig.plugins,
      uglify(
        {
          compress: {
            drop_console: true
          }
        },
        minify
      )
    ]
  },
]
