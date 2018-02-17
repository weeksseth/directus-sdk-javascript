const axios = require('axios');
const qs = require('qs');
const base64 = require('base-64');
const emittery = require('emittery');

const SDK = {
  accessToken: null,
  url: null,
  database: '_',
  _headers: {},
  _refreshInterval: null,

  get headers() {
    const headers = this._headers || {};

    if (this.accessToken) {
      headers.Authorization = 'Bearer ' + this.accessToken;
    }

    return headers;
  },

  set headers(value) {
    this._headers = value;
  },

  get payload() {
    if (this.accessToken === null) return null;

    const accessToken = state.data.accessToken;

    if (accessToken && accessToken.length > 0) {
      const payloadBase64 = accessToken.split('.')[1].replace('-', '+').replace('_', '/');
      const pd = JSON.parse(base64.decode(payloadBase64));

      const exp = new Date(pd.exp * 1000);

      return Object.assign({}, pd, { exp });
    }

    return null;
  },

  get loggedIn() {
    if (this.payload === null) return false;
    if (this.url === null) return false;

    if (this.accessToken && this.accessToken.length) {
      const accessTokenExpired = Date.now() > this.payload.exp.getTime();

      if (accessTokenExpired) return false;
    }

    return true;
  },

  request(method, path, requestData = {}) {
    if (this.url === null) throw 'No API URL set';

    if (path.startsWith('/') === false) path = '/' + path;

    const requestConfig = {
      url: path,
      method,
      params: method === 'get' ? requestData : {},
      data: method !== 'get' ? requestData : {},
      headers: this._createHeaders(),
      baseURL: this.url + this.database,

      paramsSerializer: params => qs.stringify(params)
    };

    this.emit('request', { method, path, requestData });

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
  login({ email, password, url, database }) {
    this.emit('login');

    if (this.loggedIn) {
      this.emit('login:success');
    }

    if (url) this.url = url;
    if (database) this.database = database;

    this.getToken({ email, password })
      .then(res => res.data)
      .then(data => {
        this.accessToken = data.token;

        this.refreshInterval = setInterval(() => {
          const timeDiff = this.payload.exp.getTime() - Date.now();

          if (timeDiff < 30000 && state.loading === false) {
            this.refresh(this.accessToken);
          }
        })

        this.emit('login:success');
      })
      .catch(error => this.emit('login:failed', error));
  },

  logout() {
    this.emit('logout');

    this.accessToken = null;
    this.url = null;
    this.database = '_';

    clearInterval(this._refreshInterval);
  },

  refresh(token) {
    this.accessToken = token;

    this.emit('refresh');

    this.refreshToken(token)
      .then(res => res.data.token)
      .then(token => {
        this.accessToken = token;
        this.emit('refresh:success');
      })
      .catch(error => {
        this.emit('refresh:failed', error);
        this.logout();
      })
  },

  getToken(userCredentials = {}) {
    return this.request('post', '/auth/authenticate', userCredentials);
  },

  refreshToken(token) {
    return this.request('post', '/auth/refresh', { token });
  },

  // Items
  // ---------------------------------------------------------------------------
  getItems(collection, params = {}) {
    return this.request('get', `items/${collection}`, params);
  },

  getItem(collection, primaryKey, params = {}) {
    return this.request('get', `items/${collection}/${primaryKey}`, params);
  },

  updateItem(collection, primaryKey, data = {}) {
    return this.request('patch', `items/${collection}/${primaryKey}`, data);
  },

  createItem(collection, data = {}) {
    return this.request('post', `items/${collection}`, data);
  },

  deleteItem(collection, primaryKey) {
    return this.request('delete', `items/${collection}/${primaryKey}`);
  },

  // Users
  // ---------------------------------------------------------------------------
  getMe(params = {}) {
    return this.request('get', 'users/me', params);
  },

  getUser(primaryKey, params = {}) {
    return this.request('get', `users/${primaryKey}`, params);
  },

  // Collections
  // ---------------------------------------------------------------------------
  getCollections(params = {}) {
    return this.request('get', 'collections', params);
  },

  getCollection(collection, params = {}) {
    return this.request('get', `collections/${collection}`, params);
  },

  getPreferences(collection, user, params = {}) {
    params = Object.assign(params, {
      'filter[title][null]': null,
      'filter[collection][eq]': collection,
      'filter[user][eq]': user,
    });

    return this.request('get', `collection_presets/${collection}`);
  },

  // Utils
  // ---------------------------------------------------------------------------
  hash(string, hasher) {
    return this.request('post', 'utils/hash', { string, hasher });
  }
};

// Add emitter into object
Object.assign(SDK, emittery);

module.exports = SDK;
