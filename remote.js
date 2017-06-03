const axios = require('axios');

class RemoteInstance {
  constructor(options) {
    const {accessToken, url} = options;

    this.accessToken = accessToken;

    if (!url) {
      throw new Error('No Directus URL provided');
    }

    this.url = url;
  }

  get _requestHeaders() {
    const headers = {};

    if (this.accessToken) {
      headers.Authorization = 'Bearer ' + this.accessToken;
    }

    return headers;
  }

  _get(endpoint, params = {}) {
    const headers = this._requestHeaders;

    return new Promise((resolve, reject) => {
      axios.get(this.url + endpoint, {params, headers})
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
  // ----------------------------------------------------------------------------------
  createItem(table = requiredParam('table'), data = {}) {
    return this._post(`tables/${table}/rows`, data);
  }

  getItems(table = requiredParam('table'), params = {}) {
    return this._get(`tables/${table}/rows`, params);
  }

  getItem(table = requiredParam('table'), id = requiredParam('id')) {
    return this._get(`tables/${table}/rows/${id}`);
  }

  updateItem(table = requiredParam('table'), id = requiredParam('id'), data = requiredParam('data')) {
    return this._put(`tables/${table}/rows/${id}`, data);
  }

  deleteItem( table = requiredParam('table'), id = requiredParam('id')) {
    return this._delete(`tables/${table}/rows/${id}`);
  }

  // Files
  // ----------------------------------------------------------------------------------
  createFile(data = {}) {
    return this._post('files', data);
  }

  getFiles(params = {}) {
    return this._get('files', params);
  }

  getFile(id = requiredParam('id')) {
    return this._get(`files/${id}`);
  }

  updateFile(id = requiredParam('id'), data = requiredParam('data')) {
    return this._put(`files/${id}`, data);
  }

  // Tables
  // ----------------------------------------------------------------------------------
  createTable(name = requiredParam('name')) {
    return this._post('tables', {name});
  }

  getTables(params = {}) {
    return this._get('tables', params);
  }

  getTable(table = requiredParam('table'), params = {}) {
    return this._get(`tables/${table}`, params);
  }

  // Columns
  // ----------------------------------------------------------------------------------
  createColumn(table = requiredParam('table'), data = {}) {
    return this._post(`tables/${table}/columns`, data);
  }

  getColumns(table = requiredParam('table'), params = {}) {
    return this._get(`tables/${table}/columns`, params);
  }

  getColumn(table = requiredParam('table'), column = requiredParam('column')) {
    return this._get(`tables/${table}/columns/${column}`);
  }

  updateColumn(table = requiredParam('table'), column = requiredParam('column'), data = {}) {
    return this._put(`tables/${table}/columns/${column}`, data);
  }

  deleteColumn(table = requiredParam('table'), column = requiredParam('column')) {
    return this._delete(`tables/${table}/columns/${column}`);
  }

  getActivity(params = {}) {
    return this._get('activity', params);
  }
}

function requiredParam(name) {
  throw new Error(`Missing parameter [${name}]`);
}

module.exports = RemoteInstance;

