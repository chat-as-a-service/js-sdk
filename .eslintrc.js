module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'prettier/prettier': ['error'],
    'no-underscore-dangle': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    'import/prefer-default-export': 'off',
  },
  root: true,
};
