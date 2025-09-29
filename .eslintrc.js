module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // place to override/add rules
  }
};

// override specific rules for certain file types
module.exports.overrides = [
  {
    files: ['*.vue', '**/*.vue'],
    rules: {
      'vue/valid-define-props': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['*.config.js', 'vue.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
];


