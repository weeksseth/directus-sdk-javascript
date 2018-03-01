const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../remote');

describe('Authentication', function() {
  let client;

  beforeEach(function() {
    client = new SDK({
      url: 'https://demo-api.getdirectus.com'
    });

    sinon.stub(client.axios, 'request').resolves({
      data: {
        data: {
          token: 'abcdef',
        },
      },
    });
  });

  afterEach(function() {
    client.axios.request.restore();
  });

  describe('#login()', function() {
    it('Errors on missing parameter credentials', function() {
      expect(client.login).to.throw(Error, 'login(): Parameter `credentials` is required');
    });

    it('Errors on missing parameter credentials.email', function() {
      expect(() => client.login({})).to.throw(Error, 'login(): Parameter `credentials.email` is required');
    });

    it('Errors on missing parameter credentials.password', function() {
      expect(() => client.login({ email: 'test@example.com' })).to.throw(Error, 'login(): Parameter `credentials.password` is required');
    });

    it('Sets the url in use when passed in credentials', async function() {
      await client.login({
        email: 'test@example.com',
        password: 'testPassword',
        url: 'https://testing.getdirectus.com'
      });

      expect(client.url).to.equal('https://testing.getdirectus.com');
    });

    it('Calls Axios with the right parameters', async function() {
      await client.login({
        email: 'test@example.com',
        password: 'testPassword'
      });

      expect(client.axios.request).to.have.been.calledWith({
        baseURL: 'https://demo-api.getdirectus.com/_/',
        data: {
          email: 'test@example.com',
          password: 'testPassword',
        },
        method: 'post',
        params: {},
        url: '/auth/authenticate',
      });
    });

    it('Replaces the stored token', async function() {
      await client.login({
        email: 'text@example.com',
        password: 'testPassword',
      });

      expect(client.token).to.equal('abcdef');
    });

    it('Replaces env and url if passed', async function() {
      await client.login({
        email: 'text@example.com',
        password: 'testPassword',
        url: 'https://example.com',
        env: 'testEnv',
      });

      expect(client.url).to.equal('https://example.com');
      expect(client.env).to.equal('testEnv');
    });

    it('Resolves with the currently logged in token, url, and env', async function() {
      const result = await client.login({
        email: 'text@example.com',
        password: 'testPassword',
        url: 'https://example.com',
        env: 'testEnv',
      });

      expect(result).to.deep.equal({
        url: 'https://example.com',
        env: 'testEnv',
        token: 'abcdef',
      });
    });
  });

  describe('#logout()', function() {
    it('Nullifies the token, url, and env', function() {
      client.logout();
      expect(client.token).to.be.null;
      expect(client.url).to.be.null;
      expect(client.env).to.be.null;
    });
  });
});
