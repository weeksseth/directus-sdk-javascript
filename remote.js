const axios = require('axios');
const base64 = require('base-64');
const qs = require('qs');

/**
 * Create a new SDK instance
 * @param       {object} [options]
 * @param       {string} [options.url]   The API url to connect to
 * @param       {string} [options.env]   The API environment to connect to
 * @param       {string} [options.token] The access token to use for requests
 * @constructor
 */
module.exports = function SDK(options = {}) {
  return {
    url: options.url,
    token: options.token,
    env: options.env || '_',
    axios: axios.create({
      paramsSerializer: qs.stringify,
      timeout: 1500,
    }),

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
    },

    request(method, endpoint, params = {}, data = {}) {
      if (!method || typeof method !== 'string' || method.length === 0) {
        throw new Error('request(): Parameter `method` is required');
      }
      if (!endpoint || typeof endpoint !== 'string' || params.length === 0) {
        throw new Error('request(): Parameter `endpoint` is required');
      }
      if (typeof params !== 'object') {
        throw new Error(`request(): Parameter \`params\` has to be of type Object. [${typeof params}] given.`);
      }
      if (typeof data !== 'object') {
        throw new Error(`request(): Parameter \`data\` has to be of type Object. [${typeof data}] given.`);
      }
      if (!this.url || typeof this.url !== 'string' || this.url.length === 0) {
        throw new Error('request(): No API URL set');
      }

      return this.axios.request({
        url: endpoint,
        method,
        baseURL: `${this.url}/${this.env}/`,
        params,
        data,
      })
        .then(res => res.data)
        .catch((error) => {
          if (error.response) {
            throw error.response.data.error;
          } else {
            throw { // eslint-disable-line
              code: -1,
              message: 'Network Error',
            };
          }
        });
    },
  };
};
