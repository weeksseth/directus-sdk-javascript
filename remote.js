const axios = require('axios');
const base64 = require('base-64');
const qs = require('qs');

/**
 * TODO: Add static api access token support
 *  I imagine the remote instance keeps a flag if
 *  it's using a generated vs a static access token
 *  if the access token is set through a setter / on
 *  construction, it should set this flag to true, so
 *  we don't have to check for auth validity every request
 */

class RemoteInstance {
  constructor(options = {}) {
    // Headers to be send with every request
    this._headers = options.headers || {};

    // The currently in use full unparsed access token
    this._accessToken = options.accessToken || {};

    // The currently in use api url
    this._url = options.url || {};
  }

  // Private methods
  // ---------------------------------------------------------------------------

  /**
   * Takes whatever headers have been set and adds the Authorization header
   *  if the access token exists
   * @private
   * @returns {Object} the headers ready for use
   */
  _createHeaders() {
    const headers = this._headers || {};

    if (this._accessToken) {
      headers.Authorization = 'Bearer ' + this._accessToken;
    }

    return headers;
  }

  get url() {
    return this._url;
  }

  set url() {
    return this._url;
  }

  get accessToken() {
    return this._accessToken;
  }

  set accessToken() {
    return this._accessToken;
  }

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
    if (Boolean(this._url) === false) throw 'No API URL set';

    const requestConfig = {
      url,
      method,
      params: method === 'get' ? requestData : {},
      data: method !== 'get' ? requestData : {},
      headers: this._createHeaders(),
      baseURL: this._url,

      // Use QS to format params
      paramsSerializer: params => qs.stringify(params, {arrayFormat: 'brackets'})
    };

    return axios.request(requestConfig).then(response => response.data);
  }

  // ---------------------------------------------------------------------------

  // Auth
  // ---------------------------------------------------------------------------
  getToken(userCredentials = {}) {
    return this.request('post', '/auth/authenticate', userCredentials);
  }

  refreshToken(token) {
    return this.request('post', '/auth/refresh', { token });
  }

  // Items
  // ---------------------------------------------------------------------------
  getItems(table = requiredParam('table'), params = {}) {
    return this.request('get', `items/${table}`, params);
  }

  getItem(table = requiredParam('table'), primaryKey = requiredParam('primaryKey'), params = {}) {
    return this.request('get', `items/${table}/${primaryKey}`, params);
  }

  updateItem(table = requiredParam('table'), primaryKey = requiredParam('primaryKey'), data = {}) {
    return this.request('patch', `items/${table}/${primaryKey}`, data);
  }

  createItem(table = requiredParam('table'), data = {}) {
    return this.request('post', `items/${table}`, data);
  }

  deleteItem(table = requiredParam('table'), primaryKey = requiredParam('primaryKey')) {
    return this.request('delete', `items/${table}/${primaryKey}`);
  }

  // Tables
  // ---------------------------------------------------------------------------
  getTables(params = {}) {
    return this.request('get', 'tables', params);
  }

  getTable(table = requiredParam('table'), params = {}) {
    return this.request('get', `tables/${table}`, params);
  }
}

function requiredParam(name) {
  throw new Error(`Missing parameter [${name}]`);
}

module.exports = RemoteInstance;
