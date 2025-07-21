module.exports = {
  '*.{ts,tsx,js,jsx}': (filesArray) => {
    const files = filesArray.join();
    return [
      `nx affected:lint --fix --uncommitted`,
    ];
  },
};
