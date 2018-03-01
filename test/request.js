const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../remote');

describe('Request', function() {
  let client;

  beforeEach(function() {
    client = new SDK({
      url: 'https://demo-api.getdirectus.com'
    });
  });

  describe('#request()', function() {
    beforeEach(function() {
      sinon.stub(client.axios, 'request');
    });

    afterEach(function() {
      client.axios.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.request).to.throw(Error, 'request(): Parameter `method` is required');
    });

    it('Errors on missing parameter endpoint', function() {
      expect(() => client.request('get')).to.throw(Error, 'request(): Parameter `endpoint` is required');
    });

    it('Errors if params isn\'t of the right type', function() {
      expect(() => client.request('get', '/items', 'wrong-params')).to.throw(Error, 'request(): Parameter `params` has to be of type Object. [string] given.');
    });

    it('Errors if data isn\'t of the right type', function() {
      expect(() => client.request('get', '/items', {}, 'wrong-data')).to.throw(Error, 'request(): Parameter `data` has to be of type Object. [string] given.');
    });

    it('Errors when there is no API URL set', function() {
      client.url = null;
      expect(() => client.request('get', '/items')).to.throw(Error, 'request(): No API URL set');
    });

    it('Calls Axios with the right config', function() {
      client.axios.request.returns(Promise.resolve({
        response: {
          data: {
            "error": {
              "code": 1,
              "message": "Not Found"
            }
          }
        }
      }));

      client.request('get', '/ping');

      expect(client.axios.request).to.have.been.calledWith({
        url: '/ping',
        method: 'get',
        baseURL: 'https://demo-api.getdirectus.com/_/',
        params: {},
        data: {},
      });
    });

    it('Calls Axios with the right config (body)', function() {
      client.axios.request.returns(Promise.resolve({
        response: {
          data: {
            "error": {
              "code": 1,
              "message": "Not Found"
            }
          }
        }
      }));

      client.request('post', '/utils/random_string', {}, {
        testing: true
      });

      expect(client.axios.request).to.have.been.calledWith({
        url: '/utils/random_string',
        method: 'post',
        baseURL: 'https://demo-api.getdirectus.com/_/',
        params: {},
        data: {
          testing: true
        },
      });
    });

    it('Calls Axios with the right config (params)', function() {
      client.axios.request.returns(Promise.resolve({
        response: {
          data: {
            "error": {
              "code": 1,
              "message": "Not Found"
            }
          }
        }
      }));

      client.request('get', '/utils/random_string', { queryParam: true });

      expect(client.axios.request).to.have.been.calledWith({
        url: '/utils/random_string',
        method: 'get',
        baseURL: 'https://demo-api.getdirectus.com/_/',
        params: {
          queryParam: true
        },
        data: {}
      });
    });

    it('Returns network error if the API didn\'t respond', async function() {
      client.axios.request.returns(Promise.reject({ request: {} }));

      let error;

      try {
        await client.request('get', '/ping');
      } catch(err) {
        error = err;
      }

      expect(error).to.deep.equal({
        code: -1,
        message: 'Network Error'
      });
    });

    it('Returns API error if available', async function() {
      client.axios.request.returns(Promise.reject({
        response: {
          data: {
            "error": {
              "code": 1,
              "message": "Not Found"
            }
          }
        }
      }));

      let error;

      try {
        await client.request('get', '/ping');
      } catch(err) {
        error = err;
      }

      expect(error).to.deep.equal({
        code: 1,
        message: 'Not Found'
      });
    });

    it('Strips out Axios metadata from response', async function() {
      client.axios.request.resolves({
        status: 200,
        request: {},
        data: {
          meta: {},
          data: {}
        }
      });

      const result = await client.request('get', '/ping');

      expect(result).to.deep.equal({
        meta: {},
        data: {}
      });
    });
  });

  describe('#get()', function() {
    beforeEach(function() {
      sinon.stub(client, 'request');
    });

    afterEach(function() {
      client.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.get).to.throw(Error, 'get(): Parameter `endpoint` is required');
    });

    it('Calls request() with the right parameters', function() {
      client.get('/items/projects', {
        limit: 20
      });

      expect(client.request).to.have.been.calledWith('get', '/items/projects', { limit: 20 });
    });
  });

  describe('#post()', function() {
    beforeEach(function() {
      sinon.stub(client, 'request');
    });

    afterEach(function() {
      client.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.post).to.throw(Error, 'post(): Parameter `endpoint` is required');
    });

    it('Calls request() with the right parameters', function() {
      client.post('/items/projects', {
        title: 'New Project'
      });

      expect(client.request).to.have.been.calledWith('post', '/items/projects', {}, {
        title: 'New Project'
      });
    });
  });
});
