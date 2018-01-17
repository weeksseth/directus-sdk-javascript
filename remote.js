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

class RemoteInstance {
  constructor() {
    // Headers to be send with every request
    this._headers = {};

    // The currently in use full unparsed access token
    this._accessToken = null

    // The currently in use api url
    this._url = null;

    // The instance of the timer which requests a new token
    //  if the current one is about to expire
    this._refreshTimer = null;

    // The timer which fires when the access token is
    //  expiring
    this._logoutTimer = null;
  }

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

  // Request methods
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
    if (Boolean(this._url) === false) reject({
      error: {
        message: 'No API URL set'
      }
    });

    const requestConfig = {
      url,
      method,
      params: method === 'get' ? requestData : {},
      data: method !== 'get' ? requestData : {},
      headers: this._createHeaders(),
      baseURL: this._url,

      // Only return API response, ignore request meta
      transformResponse: data => data.data,

      // Use QS to format params
      paramsSerializer: params => qs.stringify(params, {arrayFormat: 'brackets'})
    };

    return axios.request(requestconfig);
  }

  // Authentication flow
  // ---------------------------------------------------------------------------

  /**
   * Authenticate the user with the provided credentials
   *
   * If the user has provided an URL, change the internal saved URL
   * @param {Object} credentials - The user credentials to get the access token for.
   * @param {String} credentials.email - The user's email address.
   * @param {String} credentials.password - The user's password.
   * @param {String} credentials.url - The API url to authenticate to.
   * @promise
   * @fulfill {Boolean} - Returns true if successful
   * @reject {Error} - API error
   */
  login(credentials) {
    return new Promise((resolve, reject) => {
      if (credentials.url && credentials.url.length > 0) {
        this.url = credentials.url;
      }

      if (
        Boolean(credentials.email) === false ||
        Boolean(credentials.password) === false
      ) {
        reject({
          error: {
            message: 'Provide credentials'
          }
        });
      }

      this.request('post', '/auth/authenticate', {
        email: credentials.email,
        password: credentials.password
      })
        .then(response => {
          this._accessToken = response.data.data;
        })
        .catch(reject);
    });
  }

  /**
   * The logout function calls an optionally set callback function
   *  in order to allow the user to act accordingly in the app
   *  in which the SDK is used
   */
  logout() {
    if (this.onLogOut) this.onLogOut();

    this._accessToken = null;
    this._clearTimers();

    // TODO: This should send a request to the API to invalidate the
    //   current token
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

  // Interfaces
  // ---------------------------------------------------------------------------
  getInterface(name) {
    return this.request('get', `interfaces/${name}.js`);
  }
}

function requiredParam(name) {
  throw new Error(`Missing parameter [${name}]`);
}

module.exports = RemoteInstance;
