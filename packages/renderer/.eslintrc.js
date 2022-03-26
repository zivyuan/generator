module.exports = {
  root: true,
  "env": {
    "browser": true,
    "node": true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:vue/vue3-strongly-recommended',
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-multiple-template-root': 'off',
    //   "vue/no-v-html": "off",
    'vue/html-self-closing': 'off',
    'vue/multi-word-component-names': 'off',
    //   "vue/no-useless-template-attributes": "off",
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
  plugins: ['@typescript-eslint', 'no-loops'],
  parserOptions: {
    "parser": "@typescript-eslint/parser",
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
};
