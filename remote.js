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
  constructor() {
    // Headers to be send with every request
    this._headers = {};

    // The currently in use full unparsed access token
    this._accessToken;

    // The currently in use api url
    this._url;

    // The expiry date of the token
    this._exp;

    // The interval which checks token expiry each minute
    this._refreshInterval;

    // Flag to prevent the SDK to sendout refresh requests when it's already fired one
    this._isRefreshing = false;
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

  /**
   * Get the payload out of a JWT
   * @param {String} token - The JWT to parse
   * @returns {Object} The payload of the JWT
   */
  _extractPayload(token) {
    const payloadBase64 = token.split('.')[1].replace('-', '+').replace('_', '/');
    return JSON.parse(base64.decode(payloadBase64));
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
        this._url = credentials.url;
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
        .then(response => response.data.token)
        .then(token => this._saveToken(token))
        .then(() => {
          this._refreshInterval = setInterval(() => this._refreshIfNeeded(), 5000);
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
    this._exp = null;

    if (this._refreshInterval) clearInterval(this._refreshInterval);
  }

  /**
   * Checks the difference between the expiry date of the token and the
   *   current date. Fetches a new token when the expiry date of the token
   *   is within 60 seconds of the current time, so the SDK stays logged in
   *
   * @private
   */
  _refreshIfNeeded() {
    const now = Date.now();
    const exp = this._exp.getTime();
    const diffInSeconds = (exp - now) / 1000;
    const refreshOffset = 30;

    if (diffInSeconds <= refreshOffset && this._isRefreshing === false) {
      this._isRefreshing = true;

      this.request('post', '/auth/refresh', {
        token: this._accessToken
      })
        .then(response => response.data.token)
        .then(token => this._saveToken(token))
        .then(() => {
          this._isRefreshing = false;
        })
        .catch((err) => {
          console.error('Logging out due to error in refreshing the access token: ');
          console.error(err.response.data);
          this.logout();
        });
    }
  }

  /**
   * Extract the expiry date from the token and save the token to
   *   this._accessToken
   * @private
   * @param {String} token - The access token to save.
   * @returns {String} The token that was passed.
   */
  _saveToken(token) {
    this._accessToken = token;
    const payload = this._extractPayload(token);
    this._exp = new Date(payload.exp * 1000);

    return token;
  }

  // ---------------------------------------------------------------------------

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
