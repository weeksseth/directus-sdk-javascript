const axios = require('axios');
const qs = require('qs');

/**
 * TODO: Add static api access token support
 *  I imagine the remote instance keeps a flag if
 *  it's using a generated vs a static access token
 *  if the access token is set through a setter / on
 *  construction, it should set this flag to true, so
 *  we don't have to check for auth validity every request
 */

const RemoteInstance = {
  // Headers to be send with every request
  headers: {},

  // The currently in use full unparsed access token
  accessToken: null,

  // The currently in use api url
  url: null,

  // Private methods
  // ---------------------------------------------------------------------------

  /**
   * Takes whatever headers have been set and adds the Authorization header
   *  if the access token exists
   * @private
   * @returns {Object} the headers ready for use
   */
  _createHeaders() {
    const headers = this.headers || {};

    if (this.accessToken) {
      headers.Authorization = 'Bearer ' + this.accessToken;
    }

    return headers;
  },

  // ---------------------------------------------------------------------------

  /**
   * Generic request method to be used by all methods
   *
   * Can also be used publicly in order to access custom API endpoints
   *
   * @public
   * @async
   * @param {String} method - <get|post|put|patch|delete>
   * @param {String} url - Endpoint to send the request to
   * @param {Object} data - Query params (GET) or body (POST|PUT|PATCH|DELETE)
   * @promise
   * @fulfill {Object} - API response
   * @reject {Error} - API error
   */
  request(method, url, requestData = {}) {
    if (Boolean(this.url) === false) throw 'No API URL set';

    const requestConfig = {
      url,
      method,
      params: method === 'get' ? requestData : {},
      data: method !== 'get' ? requestData : {},
      headers: this._createHeaders(),
      baseURL: this.url,

      // Use QS to format params
      paramsSerializer: params => qs.stringify(params, {arrayFormat: 'brackets'})
    };

    return axios.request(requestConfig)
      .then(response => response.data)
      .catch(err => {
        if (err.response) {
          throw err.response.data.error;
        } else {
          throw err;
        }
      });
  },

  // ---------------------------------------------------------------------------

  // Auth
  // ---------------------------------------------------------------------------
  getToken(userCredentials = {}) {
    return this.request('post', '/auth/authenticate', userCredentials);
  },

  refreshToken(token) {
    return this.request('post', '/auth/refresh', { token });
  },

  // Items
  // ---------------------------------------------------------------------------
  getItems(collection = requiredParam('collection'), params = {}) {
    return this.request('get', `items/${collection}`, params);
  },

  getItem(collection = requiredParam('collection'), primaryKey = requiredParam('primaryKey'), params = {}) {
    return this.request('get', `items/${collection}/${primaryKey}`, params);
  },

  updateItem(collection = requiredParam('collection'), primaryKey = requiredParam('primaryKey'), data = {}) {
    return this.request('patch', `items/${collection}/${primaryKey}`, data);
  },

  createItem(collection = requiredParam('collection'), data = {}) {
    return this.request('post', `items/${collection}`, data);
  },

  deleteItem(collection = requiredParam('collection'), primaryKey = requiredParam('primaryKey')) {
    return this.request('delete', `items/${collection}/${primaryKey}`);
  },

  // Collections
  // ---------------------------------------------------------------------------
  getCollections(params = {}) {
    return this.request('get', 'collections', params);
  },

  getCollection(collection = requiredParam('collection'), params = {}) {
    return this.request('get', `collections/${collection}`, params);
  },

  // Utils
  // ---------------------------------------------------------------------------
  hash(string = requiredParam('string'), hasher = requiredParam('hasher')) {
    return this.request('post', 'utils/hash', { string, hasher });
  }
};

function requiredParam(name) {
  throw new Error(`Missing parameter [${name}]`);
}

module.exports = RemoteInstance;
