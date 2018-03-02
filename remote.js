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
    refreshInterval: null,
    onAutoRefreshError: null,

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

    // REQUEST METHODS
    // -------------------------------------------------------------------------

    /**
     * Directus API request promise
     * @promise RequestPromise
     * @fulfill {object} Directus data
     * @reject {Error} Network error (if no connection to API)
     * @reject {Error} Directus error (eg not logged in or 404)
     */

    /**
     * Perform an API request to the Directus API
     * @param  {string} method      The HTTP method to use
     * @param  {string} endpoint    The API endpoint to request
     * @param  {Object} [params={}] The HTTP query parameters (GET only)
     * @param  {Object} [data={}]   The HTTP request body (non-GET only)
     * @return {RequestPromise}
     */
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

      const requestOptions = {
        url: endpoint,
        method,
        baseURL: `${this.url}/${this.env}/`,
        params,
        data,
      };

      if (this.token && typeof this.token === 'string' && this.token.length > 0) {
        requestOptions.headers = {};
        requestOptions.headers.Authorization = `Bearer ${this.token}`;
      }

      return this.axios.request(requestOptions)
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

    /**
     * GET convenience method. Calls the request method for you
     * @param  {string} endpoint    The endpoint to get
     * @param  {Object} [params={}] The HTTP query parameters (GET only)
     * @return {RequestPromise}
     */
    get(endpoint, params = {}) {
      if (!endpoint || typeof endpoint !== 'string' || endpoint.length === 0) {
        throw new Error('get(): Parameter `endpoint` is required');
      }

      return this.request('get', endpoint, params);
    },

    /**
     * POST convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @param  {Object} [body={}] The HTTP request body
     * @return {RequestPromise}
     */
    post(endpoint, body = {}) {
      if (!endpoint || typeof endpoint !== 'string' || endpoint.length === 0) {
        throw new Error('post(): Parameter `endpoint` is required');
      }

      return this.request('post', endpoint, {}, body);
    },

    /**
     * PATCH convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @param  {Object} [body={}] The HTTP request body
     * @return {RequestPromise}
     */
    patch(endpoint, body = {}) {
      if (!endpoint || typeof endpoint !== 'string' || endpoint.length === 0) {
        throw new Error('patch(): Parameter `endpoint` is required');
      }

      return this.request('patch', endpoint, {}, body);
    },

    /**
     * PATCH convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @param  {Object} [body={}] The HTTP request body
     * @return {RequestPromise}
     */
    put(endpoint, body = {}) {
      if (!endpoint || typeof endpoint !== 'string' || endpoint.length === 0) {
        throw new Error('put(): Parameter `endpoint` is required');
      }

      return this.request('put', endpoint, {}, body);
    },

    /**
     * PATCH convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @return {RequestPromise}
     */
    delete(endpoint) {
      if (!endpoint || typeof endpoint !== 'string' || endpoint.length === 0) {
        throw new Error('delete(): Parameter `endpoint` is required');
      }

      return this.request('delete', endpoint);
    },

    // AUTHENTICATION
    // -------------------------------------------------------------------------

    /**
     * Logging in promise
     * @promise LoginPromise
     * @fulfill {Object} Object containing URL, ENV, and TOKEN
     * @reject {Error}   Network error (if no connection to API)
     * @reject {Error}   Directus error (eg not logged in or 404)
     */

    /**
     * Login to the API.
     *
     * Gets a new token from the API and stores it in this.token
     * @param  {Object} credentials
     * @param  {String} credentials.email    The user's email address
     * @param  {String} credentials.password The user's password
     * @param  {String} [credentials.url]    The API to login to (overwrites this.url)
     * @param  {String} [credentials.env]    The API env to login to (overwrites this.env)
     * @return {LoginPromise}
     */
    login(credentials) {
      if (!credentials || typeof credentials !== 'object') {
        throw new Error('login(): Parameter `credentials` is required');
      }

      if (!credentials.email || typeof credentials.email !== 'string' || credentials.email.length === 0) {
        throw new Error('login(): Parameter `credentials.email` is required');
      }

      if (!credentials.password || typeof credentials.password !== 'string' || credentials.password.length === 0) {
        throw new Error('login(): Parameter `credentials.password` is required');
      }

      this.token = null;

      if (credentials.url && typeof credentials.url === 'string' && credentials.url.length > 0) {
        this.url = credentials.url;
      }

      if (credentials.env && typeof credentials.env === 'string' && credentials.env.length > 0) {
        this.env = credentials.env;
      }

      if (credentials.persist) {
        this.startInterval();
      }

      return new Promise((resolve, reject) => {
        this.post('/auth/authenticate', {
          email: credentials.email,
          password: credentials.password,
        })
          .then(res => res.data.token)
          .then((token) => {
            this.token = token;
            resolve({
              url: this.url,
              env: this.env,
              token: this.token,
            });
          })
          .catch(reject);
      });
    },

    /**
     * Logs the user out by "forgetting" the URL, ENV, and token, and clearing the refresh interval
     */
    logout() {
      this.token = null;
      this.env = null;
      this.url = null;

      if (this.refreshInterval) {
        this.stopInterval();
      }
    },

    /**
     * Starts an interval of 10 seconds that will check if the token needs refreshing
     */
    startInterval() {
      this.refreshInterval = setInterval(this.refreshIfNeeded.bind(this), 10000);
    },

    /**
     * Clears and nullifies the token refreshing interval
     */
    stopInterval() {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    },

    /**
     * Refresh the token if it is about to expire (within 30 seconds of expiry date)
     *
     * Calls onAutoRefreshError if refreshing the token fails for some reason
     */
    refreshIfNeeded() {
      if (
        (!this.token || typeof this.token !== 'string' || this.token.length === 0) ||
        (!this.url || typeof this.url !== 'string' || this.url.length === 0) ||
        (!this.env || typeof this.env !== 'string' || this.env.length === 0) ||
        (!this.payload || !this.payload.exp)
      ) return;

      const timeDiff = this.payload.exp.getTime() - Date.now();

      if (timeDiff < 30000) {
        this.refresh(this.token)
          .then((res) => {
            this.token = res.data.token;
          })
          .catch((error) => {
            if (typeof this.onAutoRefreshError === 'function') {
              this.onAutoRefreshError(error);
            }
          });
      }
    },

    /**
     * Use the passed token to request a new one
     * @param  {String} token Active & Valid token
     * @return {RequestPromise}
     */
    refresh(token) {
      if (!token || typeof token !== 'string' || token.length === 0) {
        throw new Error('refresh(): Parameter `token` is required');
      }

      return this.post('/auth/refresh', { token });
    },

    /**
     * Request to reset the password of the user with the given email address
     *
     * The API will send an email to the given email address with a link to generate a new
     * temporary password.
     * @param {String} email The user's email
     */
    requestPasswordReset(email) {
      if (!email || typeof email !== 'string' || email.length === 0) {
        throw new Error('requestPasswordReset(): Parameter `email` is required');
      }

      return this.post('/auth/reset-request', {
        email,
        instance: this.url,
      });
    },

    // COLLECTIONS
    // -------------------------------------------------------------------------

    /**
     * Get all available collections
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getCollections(params = {}) {
      if (params && typeof params !== 'object') {
        throw new Error(`getCollections(): Parameter \`params\` has to be of type object. [${typeof params}] given.`);
      }

      return this.get('/collections', params);
    },

    /**
     * Get collection info by name
     * @param  {String} collection  Collection name
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getCollection(collection, params = {}) {
      if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new Error('getCollection(): Parameter `collection` is required');
      }

      if (params && typeof params !== 'object') {
        throw new Error(`getCollection(): Parameter \`params\` has to be of type object. [${typeof params}] given.`);
      }

      return this.get(`/collections/${collection}`, params);
    },

    // ITEMS
    // -------------------------------------------------------------------------

    /**
     * Create a new item
     * @param  {String} collection The collection to add the item to
     * @param  {Object} body       The item's field values
     * @return {RequestPromise}
     */
    createItem(collection, body) {
      if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new Error('createItem(): Parameter `collection` is required');
      }

      if (!body || typeof body !== 'object') {
        throw new Error('createItem(): Parameter `body` is required');
      }

      return this.post(`/items/${collection}`, body);
    },

    /**
     * Get items from a given collection
     * @param  {String} collection The collection to add the item to
     * @param  {Object} [params={}]   Query parameters
     * @return {RequestPromise}
     */
    getItems(collection, params = {}) {
      if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new Error('getItems(): Parameter `collection` is required');
      }

      if (params && typeof params !== 'object') {
        throw new Error(`getItems(): Parameter \`params\` has to be of type object. [${typeof params}] given.`);
      }

      return this.get(`/items/${collection}`, params);
    },

    /**
     * Get a single item by primary key
     * @param  {String} collection  The collection to add the item to
     * @param  {[type]} primaryKey  [description]
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getItem(collection, primaryKey, params = {}) {
      if (!collection || typeof collection !== 'string' || collection.length === 0) {
        throw new Error('getItem(): Parameter `collection` is required');
      }

      if (!primaryKey || typeof primaryKey === 'object') {
        throw new Error('getItem(): Parameter `primaryKey` is required');
      }

      if (params && typeof params !== 'object') {
        throw new Error(`getItem(): Parameter \`params\` has to be of type object. [${typeof params}] given.`);
      }

      return this.get(`/items/${collection}/${primaryKey}`, params);
    },
  };
};
