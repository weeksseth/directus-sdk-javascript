const chai = require('chai');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
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
      sinon.stub(client.axios, 'request').resolves();
    });

    afterEach(function() {
      client.axios.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.request).to.throw();
    });

    it('Errors on missing parameter endpoint', function() {
      expect(() => client.request('get')).to.throw();
    });

    it('Errors if params isn\'t of the right type', function() {
      expect(() => client.request('get', '/items', 'wrong-params')).to.throw();
    });

    describe('Allows arrays and objects for data', function() {
      it('Errors on a non-array/non-object type', function() {
        expect(() => client.request('post', '/items', {}, 'data')).to.throw();
      });

      it('Doesn\'t error when body is an array or object', function() {
        expect(() => client.request('post', '/items', {}, [])).to.not.throw();
        expect(() => client.request('post', '/items', {}, {})).to.not.throw();
      });
    });

    it('Errors when there is no API URL set', function() {
      client.url = null;
      expect(() => client.request('get', '/items')).to.throw();
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

    it('Adds Bearer header if access token is set', function() {
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

      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });

      client.request('get', '/utils/random_string', { queryParam: true });

      expect(client.axios.request).to.have.been.calledWith({
        url: '/utils/random_string',
        method: 'get',
        baseURL: 'https://demo-api.getdirectus.com/_/',
        params: {
          queryParam: true
        },
        data: {},
        headers: {
          Authorization: `Bearer ${client.token}`
        }
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
        error: {
          request: {}
        },
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

    it('Supports an optional fifth parameter to make the request without the env', async function() {
      client.axios.request.resolves({
        response: {
          data: {
            "error": {
              "code": 1,
              "message": "Not Found"
            }
          }
        }
      });

      await client.request('get', '/interfaces', {}, {});

      expect(client.axios.request).to.have.been.calledWith({
        url: '/interfaces',
        method: 'get',
        baseURL: 'https://demo-api.getdirectus.com/_/',
        params: {},
        data: {},
      });

      await client.request('get', '/interfaces', {}, {}, true);

      expect(client.axios.request).to.have.been.calledWith({
        url: '/interfaces',
        method: 'get',
        baseURL: 'https://demo-api.getdirectus.com/',
        params: {},
        data: {},
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
      expect(client.get).to.throw();
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
      expect(client.post).to.throw();
    });

    describe('Allows arrays and objects for body', function() {
      it('Errors on a non-array/non-object type', function() {
        expect(() => client.post('projects', 'body')).to.throw();
      });

      it('Doesn\'t error when body is an array or object', function() {
        expect(() => client.post('projects', [])).to.not.throw();
        expect(() => client.post('projects', {})).to.not.throw();
      });
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

  describe('#patch()', function() {
    beforeEach(function() {
      sinon.stub(client, 'request');
    });

    afterEach(function() {
      client.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.patch).to.throw();
    });

    describe('Allows arrays and objects for body', function() {
      it('Errors on a non-array/non-object type', function() {
        expect(() => client.patch('projects', 'body')).to.throw();
      });

      it('Doesn\'t error when body is an array or object', function() {
        expect(() => client.patch('projects', [])).to.not.throw();
        expect(() => client.patch('projects', {})).to.not.throw();
      });
    });

    it('Calls request() with the right parameters', function() {
      client.patch('/items/projects/1', {
        title: 'New Project'
      });

      expect(client.request).to.have.been.calledWith('patch', '/items/projects/1', {}, {
        title: 'New Project'
      });
    });
  });

  describe('#put()', function() {
    beforeEach(function() {
      sinon.stub(client, 'request');
    });

    afterEach(function() {
      client.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.put).to.throw();
    });

    describe('Allows arrays and objects for body', function() {
      it('Errors on a non-array/non-object type', function() {
        expect(() => client.put('projects', 'body')).to.throw();
      });

      it('Doesn\'t error when body is an array or object', function() {
        expect(() => client.put('projects', [])).to.not.throw();
        expect(() => client.put('projects', {})).to.not.throw();
      });
    });

    it('Calls request() with the right parameters', function() {
      client.put('/items/projects/1', {
        title: 'New Project'
      });

      expect(client.request).to.have.been.calledWith('put', '/items/projects/1', {}, {
        title: 'New Project'
      });
    });
  });

  describe('#delete()', function() {
    beforeEach(function() {
      sinon.stub(client, 'request');
    });

    afterEach(function() {
      client.request.restore();
    });

    it('Errors on missing parameter method', function() {
      expect(client.delete).to.throw();
    });

    it('Calls request() with the right parameters', function() {
      client.delete('/items/projects/1');

      expect(client.request).to.have.been.calledWith('delete', '/items/projects/1');
    });
  });
});
