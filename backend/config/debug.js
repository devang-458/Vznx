const debug = (namespace) => {
  return (...args) => {
    if (process.env.DEBUG && process.env.DEBUG.includes(namespace)) {
      console.log(`[${namespace}]`, ...args);
    }
  };
};

module.exports = debug;
