module.exports = {
  '*.{ts,tsx,js,jsx}': (filesArray) => {
    const files = filesArray.join();
    console.log('affected files:', files);
    return [
      `nx affected:lint --fix --files=${files}`,
    ];
  },
};
