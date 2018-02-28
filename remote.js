const axios = require('axios');
const base64 = require('base-64');

/**
 * Create a new SDK instance
 * @param       {object} [options]
 * @param       {string} [options.url]   The API url to connect to
 * @param       {string} [options.env]   The API environment to connect to
 * @param       {string} [options.token] The access token to use for requests
 * @constructor
 */
module.exports = function SDK(options) {
  options = options || {};

  return {
    url: options.url,
    token: options.token,
    env: options.env || '_',

    get payload() {
      if (!this.token || typeof this.token !== 'string' || this.token.length === 0) {
        return null;
      }

      return this.getPayload(this.token);
    },

    /**
     * Retrieves the payload from a JWT
     * @param  {string} token The JWT to retrieve the payload from
     * @return {object}       The JWT payload
     */
    getPayload(token) {
      const payloadBase64 = token.split('.')[1].replace('-', '+').replace('_', '/');
      const payloadDecoded = base64.decode(payloadBase64);
      const payloadObject = JSON.parse(payloadDecoded);

      if (payloadObject.exp && typeof payloadObject.exp === 'number') {
        payloadObject.exp = new Date(payloadObject.exp * 1000);
      }

      return payloadObject;
    }
  };
};
