const axios = require('axios');
const base64 = require('base-64');
const qs = require('qs');
const AV = require('argument-validator');

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
    onAutoRefreshSuccess: null,

    get payload() {
      if (!AV.isString(this.token)) return null;
      return this.getPayload(this.token);
    },

    get loggedIn() {
      if (
        AV.isString(this.token) &&
        AV.isString(this.url) &&
        AV.isString(this.env) &&
        AV.isObject(this.payload)
      ) {
        if (this.payload.exp.getTime() > Date.now()) {
          return true;
        }
      }
      return false;
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

      if (AV.isNumber(payloadObject.exp)) {
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
      AV.string(method, 'method');
      AV.string(endpoint, 'endpoint');
      AV.objectOrEmpty(params, 'params');
      AV.objectOrEmpty(data, 'data');

      AV.string(this.url, 'this.url');

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
      AV.string(endpoint, 'endpoint');
      AV.objectOrEmpty(params, 'params');

      return this.request('get', endpoint, params);
    },

    /**
     * POST convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @param  {Object} [body={}] The HTTP request body
     * @return {RequestPromise}
     */
    post(endpoint, body = {}) {
      AV.string(endpoint, 'endpoint');
      AV.objectOrEmpty(body, 'body');

      return this.request('post', endpoint, {}, body);
    },

    /**
     * PATCH convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @param  {Object} [body={}] The HTTP request body
     * @return {RequestPromise}
     */
    patch(endpoint, body = {}) {
      AV.string(endpoint, 'endpoint');
      AV.objectOrEmpty(body, 'body');

      return this.request('patch', endpoint, {}, body);
    },

    /**
     * PATCH convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @param  {Object} [body={}] The HTTP request body
     * @return {RequestPromise}
     */
    put(endpoint, body = {}) {
      AV.string(endpoint, 'endpoint');
      AV.objectOrEmpty(body, 'body');

      return this.request('put', endpoint, {}, body);
    },

    /**
     * PATCH convenience method. Calls the request method for you
     * @param  {string} endpoint  The endpoint to get
     * @return {RequestPromise}
     */
    delete(endpoint) {
      AV.string(endpoint, 'endpoint');

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
      AV.object(credentials, 'credentials');
      AV.keysWithString(credentials, ['email', 'password'], 'credentials');

      this.token = null;

      if (AV.hasKeysWithString(credentials, ['url'])) {
        this.url = credentials.url;
      }

      if (AV.hasKeysWithString(credentials, ['env'])) {
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
      this.env = '_';
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
     * Calls onAutoRefreshSuccess with the new token if the refreshing is successful
     * Calls onAutoRefreshError if refreshing the token fails for some reason
     */
    refreshIfNeeded() {
      if (!AV.hasStringKeys(this, ['token', 'url', 'env'])) return;
      if (!this.payload || !this.payload.exp) return;

      const timeDiff = this.payload.exp.getTime() - Date.now();

      if (timeDiff < 30000) {
        this.refresh(this.token)
          .then((res) => {
            this.token = res.data.token;
            if (AV.isFunction(this.onAutoRefreshSuccess)) {
              this.onAutoRefreshSuccess({
                url: this.url,
                env: this.env,
                token: this.token,
              });
            }
          })
          .catch((error) => {
            if (AV.isFunction(this.onAutoRefreshError)) {
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
      AV.string(token, 'token');
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
      AV.string(email, 'email');
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
      AV.objectOrEmpty(params, 'params');
      return this.get('/collections', params);
    },

    /**
     * Get collection info by name
     * @param  {String} collection  Collection name
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getCollection(collection, params = {}) {
      AV.string(collection, 'collection');
      AV.objectOrEmpty(params, 'params');
      return this.get(`/collections/${collection}`, params);
    },

    // FIELDS
    // ------------------------------------------------------------------------

    /**
     * Get the fields that have been setup for a given collection
     * @param  {String} collection  Collection name
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getFields(collection, params = {}) {
      AV.string(collection, 'collection');
      AV.objectOrEmpty(params, 'params');
      return this.get(`/fields/${collection}`, params);
    },

    /**
     * Get the field information for a single given field
     * @param  {String} collection  Collection name
     * @param  {String} fieldName   Field name
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getField(collection, fieldName, params = {}) {
      AV.string(collection, 'collection');
      AV.string(fieldName, 'fieldName');
      AV.objectOrEmpty(params, 'params');
      return this.get(`/fields/${collection}/${fieldName}`, params);
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
      AV.string(collection, 'collection');
      AV.object(body, 'body');
      return this.post(`/items/${collection}`, body);
    },

    /**
     * Get items from a given collection
     * @param  {String} collection The collection to add the item to
     * @param  {Object} [params={}]   Query parameters
     * @return {RequestPromise}
     */
    getItems(collection, params = {}) {
      AV.string(collection, 'collection');
      AV.objectOrEmpty(params, 'params');
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
      AV.string(collection, 'collection');
      AV.notNull(primaryKey, 'primaryKey');
      AV.objectOrEmpty(params, 'params');
      return this.get(`/items/${collection}/${primaryKey}`, params);
    },

    // LIST VIEW PREFERENCES
    // -------------------------------------------------------------------------
    getMyListViewPreferences(collection, params = {}) {
      AV.string(this.token, 'this.token');
      AV.objectOrEmpty(params);
      return Promise.all([
        this.get(`/collection_presets`, {
          'filter[title][null]': 1,
          'filter[collection][eq]': collection,
          'filter[group][null]': 1,
          'filter[user][null]': 1,
        }),
        this.get(`/collection_presets`, {
          'filter[title][null]': 1,
          'filter[collection][eq]': collection,
          'filter[group][eq]': this.payload.group,
          'filter[user][null]': 1,
        }),
        this.get(`/collection_presets`, {
          'filter[title][null]': 1,
          'filter[collection][eq]': collection,
          'filter[group][eq]': this.payload.group,
          'filter[user][eq]': this.payload.id,
        }),
      ])
        .then((values) => {
          const [collection, group, user] = values; // eslint-disable-line no-shadow
          if (user.data && user.data.length > 0) return user;
          if (group.data && group.data.length > 0) return group;
          return collection;
        });
    },

    // LIST VIEW PREFERENCES
    // -------------------------------------------------------------------------

    /**
     * Get Directus' global settings
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getSettings(params = {}) {
      AV.objectOrEmpty(params, 'params');
      return this.get('/settings', params);
    },

    // USERS
    // -------------------------------------------------------------------------

    /**
     * Get a list of available users in Directus
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getUsers(params = {}) {
      AV.objectOrEmpty(params, 'params');
      return this.get('/users', params);
    },

    /**
     * Get a single Directus user
     * @param  {String} primaryKey  The unique identifier of the user
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getUser(primaryKey, params = {}) {
      AV.notNull(primaryKey, 'primaryKey');
      AV.objectOrEmpty(params, 'params');
      return this.get(`/users/${primaryKey}`, params);
    },

    /**
     * Get the user info of the currently logged in user
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getMe(params = {}) {
      AV.objectOrEmpty(params, 'params');
      return this.get('/users/me', params);
    },
  };
};
