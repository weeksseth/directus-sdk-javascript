const axios = require('axios');
const qs = require('qs');

class RemoteInstance {
  constructor(options = {}) {
    const {accessToken, url, headers} = options;

    this.accessToken = accessToken;
    this.headers = headers;
    this.url = url;
  }

  get _requestHeaders() {
    const headers = this.headers || {};

    if (this.accessToken) {
      headers.Authorization = 'Bearer ' + this.accessToken;
    }

    return headers;
  }

  _get(endpoint, params = {}) {
    const headers = this._requestHeaders;

    return new Promise((resolve, reject) => {
      axios.get(this.url + endpoint, {
        params,
        headers,
        paramsSerializer: params => qs.stringify(params, {arrayFormat: 'brackets'})
      })
        .then(res => resolve(res.data))
        .catch(err => {
          if (err.response && err.response.data) {
            return reject(err.response.data);
          }

          return reject(err);
        });
    });
  }

  _post(endpoint, data = {}) {
    const headers = this._requestHeaders;

    return new Promise((resolve, reject) => {
      axios.post(this.url + endpoint, data, {headers})
        .then(res => resolve(res.data))
        .catch(err => {
          if (err.response && err.response.data) {
            return reject(err.response.data);
          }

          return reject(err);
        });
    });
  }

  _put(endpoint, data = {}) {
    const headers = this._requestHeaders;

    return new Promise((resolve, reject) => {
      axios.put(this.url + endpoint, data, {headers})
        .then(res => resolve(res.data))
        .catch(err => {
          if (err.response && err.response.data) {
            return reject(err.response.data);
          }

          return reject(err);
        });
    });
  }

  _delete(endpoint) {
    const headers = this._requestHeaders;

    return new Promise((resolve, reject) => {
      axios.delete(this.url + endpoint, {headers})
        .then(res => resolve(res.data))
        .catch(err => {
          if (err.response && err.response.data) {
            return reject(err.response.data);
          }

          return reject(err);
        });
    });
  }

  // Items
  // ---------------------------------------------------------------------------
  getItems(table = requiredParam('table'), params = {}) {
    return this._get(`items/${table}/`, params);
  }

  getItem(table = requiredParam('table'), primaryKey = requiredParam('primaryKey'), params = {}) {
    return this._get(`items/${table}/${primaryKey}`, params);
  }

  // Tables
  // ---------------------------------------------------------------------------
  getTables(params = {}) {
    return this._post('tables', params);
  }
}

function requiredParam(name) {
  throw new Error(`Missing parameter [${name}]`);
}

module.exports = RemoteInstance;
