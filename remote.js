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

  createItem(table, data) {
    if (!table) {
      throw new Error('Missing parameter [table]');
    }

    return this._post(`tables/${table}/rows`, data);
  }

  getActivity(params = {}) {
    return this._get('activity', params);
  }
}

module.exports = RemoteInstance;

