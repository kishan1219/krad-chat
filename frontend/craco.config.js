const path = require('path')

// Ensure production flags during production builds
if (process.argv.includes('build')) {
    process.env.NODE_ENV = 'production'
    process.env.FAST_REFRESH = 'false'
    process.env.DISABLE_ESLINT_PLUGIN = 'true'
}

module.exports = {
    reactScriptsVersion: 'react-scripts',
    eslint: {
        enable: false
    },
    babel: {
        plugins: [
            ['react-refresh/babel', { skipEnvCheck: true }]
        ]
    },
    style: {
        sass: {
            loaderOptions: {
                sassOptions: {
                    includePaths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src/assets')],
                    loadPaths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src/assets')],
                    quietDeps: true,
                    silenceDeprecations: [
                        'legacy-js-api',
                        'import',
                        'global-builtin',
                        'color-functions',
                        'color-module-compat',
                        'slash-div'
                    ]
                }
            }
        }
        // postcss: {
        //     plugins: [require('postcss-rtl')()]
        // }
    },
    webpack: {
        // module: {
        //     rules: [
        //         {
        //             test: /\.jsx?$/,
        //             exclude: /node_modules/,
        //             use: {
        //                 loader: 'babel-loader',
        //                 options: {
        //                     presets: ['@babel/preset-env']
        //                 }
        //             }
        //         }
        //     ]
        // },
        configure: (webpackConfig) => {
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
                ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
            )

            webpackConfig.resolve.plugins.splice(scopePluginIndex, 1)
            webpackConfig.resolve.fallback = {
                ...(webpackConfig.resolve.fallback || {}),
                buffer: false,
                crypto: false,
                stream: false,
                util: false
            }
            webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
                plugin => plugin?.constructor?.name !== 'CssMinimizerPlugin'
            )
            webpackConfig.plugins = (webpackConfig.plugins || []).filter(
                plugin => plugin?.constructor?.name !== 'ESLintWebpackPlugin'
            )
            // Deprecation/autoprefixer warnings were suppressed here via ignoreWarnings; the
            // underlying issues are fixed instead (bootstrap 5.3, Sass module migration, sass-loader 17).
            return webpackConfig
        },
        alias: {
            '@src': path.resolve(__dirname, 'src'),
            '@assets': path.resolve(__dirname, 'src/@core/assets'),
            '@components': path.resolve(__dirname, 'src/@core/components'),
            '@layouts': path.resolve(__dirname, 'src/@core/layouts'),
            '@store': path.resolve(__dirname, 'src/redux'),
            '@styles': path.resolve(__dirname, 'src/@core/scss'),
            '@configs': path.resolve(__dirname, 'src/configs'),
            '@utils': path.resolve(__dirname, 'src/utility/Utils'),
            '@hooks': path.resolve(__dirname, 'src/utility/hooks')
        }
    }
}
