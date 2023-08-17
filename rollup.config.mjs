// import rust from "@wasm-tool/rollup-plugin-rust";

// export default {
//     input: {
//         foo: "Cargo.toml",
//     },
//     plugins: [
//         rust(),
//     ],
// };

import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: 'json' };
import dts from "rollup-plugin-dts";
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';

const LIBRARY_NAME = 'Library'; // Change with your library's name
const EXTERNAL = []; // Indicate which modules should be treated as external
const GLOBALS = {}; // https://rollupjs.org/guide/en/#outputglobals

const banner = `/*!
 * ${pkg.name}
 * ${pkg.description}
 *
 * @version v${pkg.version}
 * @author ${pkg.author}
 * @homepage ${pkg.homepage}
 * @repository ${pkg.repository.url}
 * @license ${pkg.license}
 */`;

const makeConfig = (env = 'development') => {
    let bundleSuffix = '';

    if (env === 'production') {
        bundleSuffix = 'min.';
    }

    const config = {
        input: 'lib.ts',
        external: EXTERNAL,
        output: [
            {
                banner,
                name: LIBRARY_NAME,
                file: `dist/${LIBRARY_NAME}.umd.${bundleSuffix}js`, // UMD
                format: 'umd',
                exports: 'auto',
                globals: GLOBALS
            },
            {
                banner,
                file: `dist/${LIBRARY_NAME}.cjs.${bundleSuffix}js`, // CommonJS
                format: 'cjs',
                exports: 'auto',
                globals: GLOBALS
            },
            {
                banner,
                file: `dist/${LIBRARY_NAME}.esm.${bundleSuffix}js`, // ESM
                format: 'es',
                exports: 'named',
                globals: GLOBALS
            }
        ],
        plugins: [
            typescript(),
            url({
                include: ['**/*.wasm'],
                limit: 1 * 1024 * 1024,
            }),
        ]
    };

    if (env === 'production') {
        config.plugins.push(terser({
            output: {
                comments: /^!/
            }
        }));
    }

    return config;
};

export default commandLineArgs => {
    const configs = [
        makeConfig(),
        {
            input: "./pkg/wasmer_wasix_js.d.ts",
            output: [{ file: "dist/pkg/wasmer_wasix_js.d.ts", format: "es" }],
            plugins: [dts()],
        }
    ];

    // Production
    if (commandLineArgs.environment === 'BUILD:production') {
        configs.push(makeConfig('production'));
    }

    return configs;
};
