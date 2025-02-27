import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwind from 'eslint-plugin-tailwindcss';
import unusedImports from 'eslint-plugin-unused-imports';
import { dirname } from 'path';
import tseslint, { configs as tsEslintConfigs } from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = tseslint.config(
  { ignores: ['.next/**/*', 'node_modules/**/*', 'eslint.config.mjs'] },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports
    },
    extends: [
      eslint.configs.recommended,
      eslintPluginPrettierRecommended,
      ...tsEslintConfigs.recommended,
      ...tailwind.configs['flat/recommended'],
      ...compat.extends('next/core-web-vitals', 'next/typescript'),
      ...compat.extends('plugin:import/recommended', 'plugin:import/typescript')
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          paths: ['./src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json']
        },
        typescript: {
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-unused-vars': [
        'off',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: ['../*'] }
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^(?!\\.)'], ['^\\u0000', '^\\.', '^src/']]
        }
      ],
      'simple-import-sort/exports': 'error',
      'import/newline-after-import': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@next/next/no-async-client-component': 'error'
    }
  }
);
export default eslintConfig;
