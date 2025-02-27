export default {
  '*': () => [
    'prettier --write .',
    'npm run type-check',
    'eslint --fix --max-warnings=0 --no-warn-ignored',
    'git add .'
  ]
};
