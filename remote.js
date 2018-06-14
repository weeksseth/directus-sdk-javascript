const axios = require('axios');
const base64 = require('base-64');
const qs = require('qs');
const AV = require('argument-validator');

/**
 * Retrieves the payload from a JWT
 * @param  {String} token The JWT to retrieve the payload from
 * @return {Object}       The JWT payload
 */
function getPayload(token) {
  const payloadBase64 = token
    .split('.')[1]
    .replace('-', '+')
    .replace('_', '/');
  const payloadDecoded = base64.decode(payloadBase64);
  const payloadObject = JSON.parse(payloadDecoded);

  if (AV.isNumber(payloadObject.exp)) {
    payloadObject.exp = new Date(payloadObject.exp * 1000);
  }

  return payloadObject;
}

/**
 * Create a new SDK instance
 * @param       {object} [options]
 * @param       {string} [options.url]   The API url to connect to
 * @param       {string} [options.env]   The API environment to connect to
 * @param       {string} [options.token] The access token to use for requests
 * @constructor
 */
function SDK(options = {}) {
  return {
    url: options.url,
    token: options.token,
    env: options.env || '_',
    axios: axios.create({
      paramsSerializer: qs.stringify,
      timeout: 60000,
    }),
    refreshInterval: null,
    onAutoRefreshError: null,
    onAutoRefreshSuccess: null,

    get payload() {
      if (!AV.isString(this.token)) return null;
      return getPayload(this.token);
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
     * @param  {Boolean} noEnv      Don't use the env in the path
     * @return {RequestPromise}
     */
    request(method, endpoint, params = {}, data = {}, noEnv = false) {
      AV.string(method, 'method');
      AV.string(endpoint, 'endpoint');
      AV.objectOrEmpty(params, 'params');
      AV.objectOrEmpty(data, 'data');

      AV.string(this.url, 'this.url');

      let baseURL = `${this.url}/`;

      if (noEnv === false) {
        baseURL += `${this.env}/`;
      }

      const requestOptions = {
        url: endpoint,
        method,
        baseURL,
        params,
        data,
      };

      if (this.token && typeof this.token === 'string' && this.token.length > 0) {
        requestOptions.headers = {};
        requestOptions.headers.Authorization = `Bearer ${this.token}`;
      }

      return this.axios
        .request(requestOptions)
        .then(res => res.data)
        .catch((error) => {
          if (error.response) {
            throw error.response.data.error;
          } else {
            throw {
              // eslint-disable-line
              code: -1,
              message: 'Network Error',
              error,
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
     * @param {Boolean} fireImmediately Fire the refreshIfNeeded method directly
     */
    startInterval(fireImmediately) {
      if (fireImmediately) this.refreshIfNeeded();
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

      if (timeDiff <= 0) {
        if (AV.isFunction(this.onAutoRefreshError)) {
          this.onAutoRefreshError({
            message: 'auth_expired_token',
            code: 102,
          });
        }
        return;
      }

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

    // ACTIVITY
    // -------------------------------------------------------------------------

    /**
     * Get activity
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getActivity(params = {}) {
      AV.objectOrEmpty(params, 'params');
      return this.get('/activity', params);
    },

    // BOOKMARKS
    // -------------------------------------------------------------------------

    /**
     * Get the bookmarks of the current user
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getMyBookmarks(params = {}) {
      AV.string(this.token, 'this.token');
      AV.objectOrEmpty(params);
      return Promise.all([
        this.get('/collection_presets', {
          'filter[title][nnull]': 1,
          'filter[user][eq]': this.payload.id,
        }),
        this.get('/collection_presets', {
          'filter[title][nnull]': 1,
          'filter[group][eq]': this.payload.group,
          'filter[user][null]': 1,
        }),
      ]).then((values) => {
        const [user, group] = values; // eslint-disable-line no-shadow
        return [...user.data, ...group.data];
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

    /**
     * Create a collection
     * @param {Object} data Collection information
     * @return {RequestPromise}
     */
    createCollection(data) {
      AV.object(data, 'data');
      return this.post('/collections', data);
    },

    /**
     * @param  {String} The collection to update
     * @param  {Object} The fields to update
     * @return {RequestPromise}
     */
    updateCollection(collection, data) {
      AV.string(collection, 'collection');
      AV.object(data, 'data');
      return this.patch(`/collections/${collection}`, data);
    },

    /**
     * @param  {String} collection The primary key of the collection to remove
     * @return {RequestPromise}
     */
    deleteCollection(collection) {
      AV.string(collection, 'collection');
      return this.delete(`/collections/${collection}`);
    },

    // COLLECTION PRESETS
    // -------------------------------------------------------------------------

    /**
     * Create a new collection preset (bookmark / listing preferences)
     * @param  {Object} data The bookmark info
     * @return {RequestPromise}
     */
    createCollectionPreset(data) {
      AV.object(data);
      return this.post('/collection_presets', data);
    },

    /**
     * Update collection preset (bookmark / listing preference)
     * @param {String|Number} primaryKey
     * @param {RequestPromise} data
     */
    updateCollectionPreset(primaryKey, data) {
      AV.notNull(primaryKey, 'primaryKey');
      AV.object(data, 'data');

      return this.patch(`/collection_presets/${primaryKey}`, data);
    },

    /**
     * Delete collection preset by primarykey
     * @param {String|Number} primaryKey The primaryKey of the preset to delete
     */
    deleteCollectionPreset(primaryKey) {
      AV.notNull(primaryKey, 'primaryKey');
      return this.delete(`/collection_presets/${primaryKey}`);
    },

    // EXTENSIONS
    // -------------------------------------------------------------------------

    /**
     * Get the meta information of all installed interfaces
     * @return {RequestPromise}
     */
    getInterfaces() {
      return this.request('get', '/interfaces', {}, {}, true);
    },

    /**
     * Get the meta information of all installed listings
     * @return {RequestPromise}
     */
    getListings() {
      return this.request('get', '/listings', {}, {}, true);
    },

    /**
     * Get the meta information of all installed pages
     * @return {RequestPromise}
     */
    getPages() {
      return this.request('get', '/pages', {}, {}, true);
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

    /**
     * Create a field in the given collection
     * @param  {String} collection Collection to add the field in
     * @param  {Object} fieldInfo  The fields info to save
     * @return {RequestPromise}
     */
    createField(collection, fieldInfo) {
      AV.string(collection, 'collection');
      AV.object(fieldInfo, 'fieldInfo');
      return this.post(`/fields/${collection}`, fieldInfo);
    },

    /**
     * Update a given field in a given collection
     * @param  {String} collection Field's parent collection
     * @param  {String} fieldName  Name of the field to update
     * @param  {Object} fieldInfo  Fields to update
     * @return {RequestPromise}
     */
    updateField(collection, fieldName, fieldInfo) {
      AV.string(collection, 'collection');
      AV.string(fieldName, 'fieldName');
      AV.object(fieldInfo, 'fieldInfo');
      return this.patch(`/fields/${collection}/${fieldName}`, fieldInfo);
    },

    // ITEMS
    // -------------------------------------------------------------------------

    /**
     * Update an existing item
     * @param  {String} collection The collection to add the item to
     * @param  {String|Number} primaryKey Primary key of the item
     * @param  {Object} body       The item's field values
     * @return {RequestPromise}
     */
    updateItem(collection, primaryKey, body) {
      AV.string(collection, 'collection');
      AV.notNull(primaryKey, 'primaryKey');
      AV.object(body, 'body');

      if (collection.startsWith('directus_')) {
        return this.patch(`/${collection.substring(9)}/${primaryKey}`, body);
      }

      return this.patch(`/items/${collection}/${primaryKey}`, body);
    },

    /**
     * Create a new item
     * @param  {String} collection The collection to add the item to
     * @param  {Object} body       The item's field values
     * @return {RequestPromise}
     */
    createItem(collection, body) {
      AV.string(collection, 'collection');
      AV.object(body, 'body');

      if (collection.startsWith('directus_')) {
        return this.post(`/${collection.substring(9)}`, body);
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
      AV.string(collection, 'collection');
      AV.objectOrEmpty(params, 'params');

      if (collection.startsWith('directus_')) {
        return this.get(`/${collection.substring(9)}`, params);
      }

      return this.get(`/items/${collection}`, params);
    },

    /**
     * Get a single item by primary key
     * @param  {String} collection  The collection to add the item to
     * @param  {String|Number} primaryKey Primary key of the item
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getItem(collection, primaryKey, params = {}) {
      AV.string(collection, 'collection');
      AV.notNull(primaryKey, 'primaryKey');
      AV.objectOrEmpty(params, 'params');

      if (collection.startsWith('directus_')) {
        return this.get(`/${collection.substring(9)}/${primaryKey}`, params);
      }

      return this.get(`/items/${collection}/${primaryKey}`, params);
    },

    /**
     * Delete a single item by primary key
     * @param  {String} collection  The collection to delete the item from
     * @param  {String|Number} primaryKey Primary key of the item
     * @return {RequestPromise}
     */
    deleteItem(collection, primaryKey) {
      AV.string(collection, 'collection');
      AV.notNull(primaryKey, 'primaryKey');

      if (collection.startsWith('directus_')) {
        return this.delete(`/${collection.substring(9)}/${primaryKey}`);
      }

      return this.delete(`/items/${collection}/${primaryKey}`);
    },

    /**
     * Delete multiple items by primary key
     * @param  {String} collection  The collection to delete the item from
     * @param  {Array} primaryKey Primary key of the item
     * @return {RequestPromise}
     */
    deleteItems(collection, primaryKeys) {
      AV.string(collection, 'collection');
      AV.array(primaryKeys, 'primaryKeys');

      if (collection.startsWith('directus_')) {
        return this.delete(`/${collection.substring(9)}/${primaryKeys.join()}`);
      }

      return this.delete(`/items/${collection}/${primaryKeys.join()}`);
    },

    // LISTING PREFERENCES
    // -------------------------------------------------------------------------

    /**
     * Get the collection presets of the current user for a single collection
     * @param  {String} collection  Collection to fetch the preferences for
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getMyListingPreferences(collection, params = {}) {
      AV.string(this.token, 'this.token');
      AV.objectOrEmpty(params);
      return Promise.all([
        this.get('/collection_presets', {
          'filter[title][null]': 1,
          'filter[collection][eq]': collection,
          'filter[group][null]': 1,
          'filter[user][null]': 1,
        }),
        this.get('/collection_presets', {
          'filter[title][null]': 1,
          'filter[collection][eq]': collection,
          'filter[group][eq]': this.payload.group,
          'filter[user][null]': 1,
        }),
        this.get('/collection_presets', {
          'filter[title][null]': 1,
          'filter[collection][eq]': collection,
          'filter[group][eq]': this.payload.group,
          'filter[user][eq]': this.payload.id,
        }),
      ]).then((values) => {
        const [collection, group, user] = values; // eslint-disable-line no-shadow
        if (user.data && user.data.length > 0) {
          return user.data[0];
        }
        if (group.data && group.data.length > 0) {
          return group.data[0];
        }
        if (collection.data && collection.data.length > 0) {
          return collection.data[0];
        }
        return {};
      });
    },

    // RELATIONS
    // -------------------------------------------------------------------------

    /**
     * Get the relationship information for the given collection
     * @param  {String} collection The collection name
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getCollectionRelations(collection, params = {}) {
      AV.string(collection, 'collection');
      AV.objectOrEmpty(params);

      return Promise.all([
        this.get('/relations', { 'filter[collection_a][eq]': collection }),
        this.get('/relations', { 'filter[collection_b][eq]': collection }),
      ]);
    },

    // REVISIONS
    // -------------------------------------------------------------------------

    /**
     * Get a single item's revisions by primary key
     * @param  {String} collection  The collection to fetch the revisions from
     * @param  {String|Number} primaryKey Primary key of the item
     * @param  {Object} [params={}] Query parameters
     * @return {RequestPromise}
     */
    getItemRevisions(collection, primaryKey, params = {}) {
      AV.string(collection, 'collection');
      AV.notNull(primaryKey, 'primaryKey');
      AV.objectOrEmpty(params, 'params');

      if (collection.startsWith('directus_')) {
        return this.get(`/${collection.substring(9)}/${primaryKey}/revisions`, params);
      }

      return this.get(`/items/${collection}/${primaryKey}/revisions`, params);
    },

    /**
     * revert an item to a previous state
     * @param  {String} collection  The collection to fetch the revisions from
     * @param  {String|Number} primaryKey Primary key of the item
     * @param  {Number} revisionID The ID of the revision to revert to
     * @return {RequestPromise}
     */
    revert(collection, primaryKey, revisionID) {
      AV.string(collection, 'collection');
      AV.notNull(primaryKey, 'primaryKey');
      AV.number(revisionID, 'revisionID');

      if (collection.startsWith('directus_')) {
        return this.patch(`/${collection.substring(9)}/${primaryKey}/revert/${revisionID}`);
      }

      return this.patch(`/items/${collection}/${primaryKey}/revert/${revisionID}`);
    },

    // SETTINGS
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

    /**
     * Update a single user based on primaryKey
     * @param  {String|Number} primaryKey The primary key of the user
     * @param  {Object} body              The fields to update
     * @return {RequestPromise}
     */
    updateUser(primaryKey, body) {
      AV.notNull(primaryKey, 'primaryKey');
      AV.object(body, 'body');
      return this.updateItem('directus_users', primaryKey, body);
    },

    // UTILS
    // -------------------------------------------------------------------------

    /**
     * Ping the API to check if it exists / is up and running
     * @return {RequestPromise}
     */
    ping() {
      return this.request('get', '/server/ping', {}, {}, true);
    },

    /**
     * Get all the setup third party auth providers
     * @return {RequestPromise}
     */
    getThirdPartyAuthProviders() {
      return this.get('/auth/sso');
    },
  };
}

// CONVENIENCE METHODS
// -------------------------------------------------------------------------------------------------

SDK.getPayload = getPayload;
module.exports = SDK;
