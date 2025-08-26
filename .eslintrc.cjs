module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'no-restricted-imports': ['error', {
      'paths': [
        { name: 'msw', message: 'Mocky jsou zakázané. Vše přes Supabase.' },
        { name: '@mswjs/interceptors', message: 'Mocky jsou zakázané.' },
        { name: 'faker', message: 'Mock data jsou zakázaná.' },
        { name: 'miragejs', message: 'Mocky jsou zakázané.' }
      ],
      'patterns': ['**/__mocks__/*', '**/mocks/*', '**/fixtures/*']
    }],
    'no-restricted-globals': ['error', { name: 'fetch', message: 'Použij Supabase klienta nebo schválený wrapper.' }],
    'no-restricted-syntax': [
      'error',
      { selector: "CallExpression[callee.name='axios']", message: 'Nepoužívej axios – komunikace přes Supabase.' }
    ]
  }
  ,
  overrides: [
    {
      files: ['src/services/api-client.ts'], // povolit fetch/axios pouze zde
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off'
      }
    }
  ]
}
