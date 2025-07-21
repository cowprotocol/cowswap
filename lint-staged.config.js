module.exports = {
  '*.{ts,tsx,js,jsx}': files => {
    const list = files.map(f => `"${f}"`).join(' ');
    return [
      `eslint --fix --max-warnings=0 ${list}`,
      `git add ${list}`
    ];
  }
};
