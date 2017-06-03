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

  _get(endpoint, params = {}) {
    const headers = {};

    if (this.accessToken) {
      headers.Authorization = 'Bearer ' + this.accessToken;
    }

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

  getActivity(params = {}) {
    return this._get('activity', params);
  }
}

module.exports = RemoteInstance;

