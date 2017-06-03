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

  createItem(table = requiredParam('table'), data = {}) {
    return this._post(`tables/${table}/rows`, data);
  }

  getItems(table = requiredParam('table'), params = {}) {
    return this._get(`tables/${table}/rows`, params);
  }

  getActivity(params = {}) {
    return this._get('activity', params);
  }
}

function requiredParam(name) {
  throw new Error(`Missing parameter [${name}]`);
}

module.exports = RemoteInstance;

