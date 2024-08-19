module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig-eslint.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    "eslint:recommended",
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/member-delimiter-style': 'error',
    'quotes': ["error", "single"],
    "camelcase": ["error", {"properties": "always"}],
    "semi": "off",
    "@typescript-eslint/semi": ["error"],
    "@typescript-eslint/prefer-readonly": ["error"],
    "no-labels": "error",
    "key-spacing": "error",
    "keyword-spacing": "error",
    "no-continue": "error",
    "no-lonely-if": "error",
    "no-multi-assign": "error",
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-unneeded-ternary": "error",
    "no-whitespace-before-property": "error",
    "nonblock-statement-body-position": "error",
    'arrow-spacing': "error",
    "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "_"}]
  },
};
