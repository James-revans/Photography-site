import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import babel from "rollup-plugin-babel";
import livereload from "rollup-plugin-livereload";
import json from "@rollup/plugin-json";
import autoPreprocess from "svelte-preprocess";
import alias from "@rollup/plugin-alias";
import scss from "rollup-plugin-scss";
import copy from "rollup-plugin-copy";

const INPUT_DIR = "src";
const OUTPUT_DIR = "build";

const production = !process.env.ROLLUP_WATCH;

export default {
    // inlineDynamicImports: true,

    input: `${INPUT_DIR}/main.js`,
    output: {
        format: "iife",
        file: `${OUTPUT_DIR}/bundle.js`,
        name: "app",
    },
    plugins: [
        svelte({
            preprocess: autoPreprocess(),
            // we'll extract any component CSS out into
            // a separate file — better for performance
            dev: !production,

            css: (css) => {
                css.write(`${OUTPUT_DIR}/bundle.js.css`);
            },
        }),
        scss({}),
        copy({
            targets: [{ src: `${INPUT_DIR}/public/*`, dest: `${OUTPUT_DIR}` }],
        }),
        alias({
            entries: [
                { find: "shared", replacement: "./src/shared" },
                { find: "images", replacement: `./src/public/images` },
            ],
        }),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        babel({
            exclude: "node_modules/**",
            runtimeHelpers: true,
        }),
        commonjs(),
        json(),
        !production && livereload(`${OUTPUT_DIR}`),
        !production && serve(),
    ],
};

function serve() {
    let started = false;
    // return {writeBundle() {}}
    if (!started) {
        started = true;
        require("child_process").spawn("npm", ["run", "serve", "--", "--dev"], {
            stdio: ["ignore", "inherit", "inherit"],
            shell: true,
        });
    }
}
