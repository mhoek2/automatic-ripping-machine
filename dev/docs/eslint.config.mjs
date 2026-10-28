
import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: [
            'node_modules/**',
            'arm/ui/static/js/jquery-*.min.js',
        ],
    },
    {
        files: ['arm/ui/static/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: globals.browser,
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-console': 'warn',
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^xhr$|^status$|^error$|^ui$|^event$',
            }],
            'prefer-const': 'error',
            'no-var': 'error',
            'quotes': ['error', 'single'],
            'no-multi-spaces': ['error', { ignoreEOLComments: true }],
            'max-len': ['warn', { code: 100 }],
            'object-curly-spacing': ['error', 'always'],
            'space-in-parens': ['error', 'never'],
            'array-bracket-spacing': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'consistent-return': 'error',
            'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],
            'no-empty-function': 'warn',
            'no-else-return': 'warn',
            'no-use-before-define': ['error', {
                functions: false,
                classes: true,
            }],
            'no-nested-ternary': 'warn',
            'max-lines': ['warn', 500],
        },
    },
];