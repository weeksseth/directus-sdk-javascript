const axios = require('axios');

module.exports = function SDK(options) {
  options = options || {};

  return {
    url: options.url,
    token: options.token,
    env: options.env || '_',
  };
};
