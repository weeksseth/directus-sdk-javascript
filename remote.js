const axios = require('axios');
const qs = require('qs');
const base64 = require('base-64');
const Emittery = require('emittery');

class SDK extends Emittery {
  constructor({ accessToken, url, database } = {}) {
    super();

    this.accessToken = accessToken || null;
    this.url = url || null;
    this.database = database || '_';
    this._headers = {};
    this._refreshInterval = setInterval(() => {
      if (!this.accessToken || !this.url) return;
      const timeDiff = this.payload.exp.getTime() - Date.now();

      if (timeDiff < 30000) {
        this.refresh(this.accessToken);
      }
    }, 10000);
  }

  get headers() {
    const headers = this._headers || {};

    if (this.accessToken) {
      headers.Authorization = 'Bearer ' + this.accessToken;
    }

    return headers;
  }

  set headers(value) {
    this._headers = value;
  }

  get payload() {
    if (this.accessToken === null) return null;

    const accessToken = this.accessToken;

    const payloadBase64 = accessToken.split('.')[1].replace('-', '+').replace('_', '/');
    const pd = JSON.parse(base64.decode(payloadBase64));

    const exp = new Date(pd.exp * 1000);

    return Object.assign({}, pd, { exp });
  }

  get loggedIn() {
    if (this.payload === null) return false;
    if (this.url === null) return false;

    if (this.accessToken && this.accessToken.length) {
      const accessTokenExpired = Date.now() > this.payload.exp.getTime();

      if (accessTokenExpired === false) return true;
    }

    return false;
  }

  request(method, path, requestData = {}) {
    if (this.url === null) throw 'No API URL set';

    if (path.startsWith('/') === false) path = '/' + path;

    const requestConfig = {
      url: path,
      method,
      params: method === 'get' ? requestData : {},
      data: method !== 'get' ? requestData : {},
      headers: this.headers,
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
  }

  login({ email, password, url, database }) {
    return new Promise((resolve, reject) => {
      this.emit('login');

      if (this.loggedIn) {
        return this.emit('login:success');
      }

      if (url) this.url = url;
      if (database) this.database = database;

      this.getToken({ email, password })
      .then(res => res.data)
      .then(data => {
        this.accessToken = data.token;


        this.emit('login:success');
        resolve();
      })
      .catch((error) => {
        this.emit('login:failed', error);
        reject(error);
      });
    });
  }

  logout() {
    this.emit('logout');

    this.accessToken = null;
    this.url = null;
    this.database = '_';
  }

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
      });
  }

  getToken(userCredentials = {}) {
    return this.request('post', '/auth/authenticate', userCredentials);
  }

  refreshToken(token) {
    return this.request('post', '/auth/refresh', { token });
  }

  getItems(collection, params = {}) {
    return this.request('get', `items/${collection}`, params);
  }

  getItem(collection, primaryKey, params = {}) {
    return this.request('get', `items/${collection}/${primaryKey}`, params);
  }

  updateItem(collection, primaryKey, data = {}) {
    return this.request('patch', `items/${collection}/${primaryKey}`, data);
  }

  createItem(collection, data = {}) {
    return this.request('post', `items/${collection}`, data);
  }

  deleteItem(collection, primaryKey) {
    return this.request('delete', `items/${collection}/${primaryKey}`);
  }

  getMe(params = {}) {
    return this.request('get', 'users/me', params);
  }

  getUser(primaryKey, params = {}) {
    return this.request('get', `users/${primaryKey}`, params);
  }

  getCollections(params = {}) {
    return this.request('get', 'collections', params);
  }

  getCollection(collection, params = {}) {
    return this.request('get', `collections/${collection}`, params);
  }

  getPreferences(collection, user, params = {}) {
    params = Object.assign(params, {
      'filter[title][null]': null,
      'filter[collection][eq]': collection,
      'filter[user][eq]': user,
    });

    return this.request('get', `collection_presets/${collection}`);
  }

  hash(string, hasher) {
    return this.request('post', 'utils/hash', { string, hasher });
  }
}

module.exports = SDK;
