import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import globals from 'globals';

export default tseslint.config([
  {
    ignores: ['**/lib/*', '**/coverage/*'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
      },
      parser: tseslint.parser,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    },
  },
]);
