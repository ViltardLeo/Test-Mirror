import globals from "globals";
import pluginJs from "@eslint/js";


export default [
    {
        "rules": {
        },
        languageOptions: {
            globals: {...globals.browser, ...globals.node}
        }
    },
    pluginJs.configs.recommended,
];