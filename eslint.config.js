import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        jest: 'readonly',
        expect: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        document: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
    },
  },
  prettier,
];
