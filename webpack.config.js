module.exports = (options, webpack) => {
  return {
    ...options,
    devtool: 'source-map',
  };
};
