import js from '@eslint/js';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '*.min.js', 'public/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        XMLHttpRequest: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        queueMicrotask: 'readonly',
        reportError: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        MessageChannel: 'readonly',
        MSApp: 'readonly',
        __REACT_DEVTOOLS_GLOBAL_HOOK__: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript files should be handled by TypeScript compiler
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  }
];