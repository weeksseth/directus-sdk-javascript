const chai = require('chai');
const jwt = require('jsonwebtoken');
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
      expect(client.login).to.throw();
    });

    it('Errors on missing parameter credentials.email', function() {
      expect(() => client.login({})).to.throw();
    });

    it('Errors on missing parameter credentials.password', function() {
      expect(() => client.login({ email: 'test@example.com' })).to.throw();
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
      expect(client.env).to.equal('_');
    });
  });

  describe('#refresh()', function() {
    it('Errors on missing parameter token', function() {
      expect(client.refresh).to.throw();
    });

    it('Resolves with the new token', async function() {
      const result = await client.refresh('oldToken');
      expect(result).to.deep.equal({
        data: {
          token: 'abcdef'
        }
      });
    });
  });

  describe('#refreshIfNeeded()', function() {
    it('Does nothing when token, url, env, or payload.exp is missing', function() {
      // Nothing
      client.url = null;
      client.env = null;
      expect(client.refreshIfNeeded()).to.be.undefined;
      // URL
      client.url = 'https://demo-api.getdirectus.com';
      expect(client.refreshIfNeeded()).to.be.undefined;
      // URL + ENV
      client.env = '_';
      expect(client.refreshIfNeeded()).to.be.undefined;
      // URL + ENV + TOKEN (no exp in payload)
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true });
      expect(client.refreshIfNeeded()).to.be.undefined;
    });

    it('Overwrites the saved token with the new one', async function() {
      sinon.stub(client, 'refresh').resolves({
        data: {
          token: 'abcdef'
        }
      });
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });
      await client.refreshIfNeeded();
      expect(client.token).to.equal('abcdef');
      client.refresh.restore();
    });

    it('Calls refresh() if expiry date is within 30 seconds of now', function() {
      sinon.stub(client, 'refresh').resolves();
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });
      expect(client.refreshIfNeeded()).to.be.undefined;
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });
      client.refreshIfNeeded();
      expect(client.refresh).to.have.been.calledWith(client.token);
      client.refresh.restore();
    });

    it('Calls the optional onAutoRefreshSuccess() callback when the request succeeds', function(done) {
      sinon.stub(client, 'refresh').resolves({
        data: {
          token: 'abcdef'
        }
      });

      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });

      client.onAutoRefreshSuccess = function(info) {
        expect(info).to.deep.equal({
          url: 'https://demo-api.getdirectus.com',
          env: '_',
          token: 'abcdef'
        });
        done();
      };

      client.refreshIfNeeded();

      client.refresh.restore();
    });

    it('Calls the optional onAutoRefreshError() callback when request fails', function(done) {
      sinon.stub(client, 'refresh').rejects({
        code: -1,
        message: 'Network Error'
      });

      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });

      client.onAutoRefreshError = function(error) {
        expect(error).to.deep.equal({
          code: -1,
          message: 'Network Error'
        });
        done();
      };

      client.refreshIfNeeded();

      client.refresh.restore();
    });

    it('Does nothing if the token is expired and no onAutoRefreshError() callback has been given', function() {
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '-20s' });
      expect(client.refreshIfNeeded()).to.be.undefined;
    });

    it('Calls the optional onAutoRefreshError() callback when trying to refresh an expired token', function(done) {
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '-20s' });

      client.onAutoRefreshError = function(error) {
        expect(error).to.deep.equal({
          code: 102,
          message: 'auth_expired_token',
        });
        done();
      };

      client.refreshIfNeeded();
    });
  });

  describe('Interval', function() {
    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
      sinon.stub(client, 'refreshIfNeeded');
    });

    afterEach(function() {
      this.clock.restore();
      client.refreshIfNeeded.restore();
    });

    describe('#startInterval()', function() {
      it('Starts the interval', function() {
        client.startInterval();
        expect(client.refreshInterval).to.be.not.null;
      });

      it('Fires immediately if true has been passed as parameter', function() {
        client.startInterval(true);
        expect(client.refreshIfNeeded).to.have.been.calledOnce;
      });
    });

    describe('#stopInterval()', function() {
      it('Stops (deletes) the interval', function() {
        client.startInterval();
        client.stopInterval();
        expect(client.refreshInterval).to.be.null;
      });
    });

    describe('#login()', function() {
      it('Starts the interval if persist key has been passed', function() {
        client.login({
          url: 'https://demo-api.getdirectus.com',
          email: 'testing@example.com',
          password: 'testPassword',
          persist: true,
        });

        expect(client.refreshInterval).to.be.not.null;

        // cleanup
        client.logout();
      });

      it('Doesn\'t start the interval without the persist key', function() {
        client.login({
          url: 'https://demo-api.getdirectus.com',
          email: 'testing@example.com',
          password: 'testPassword'
        });

        expect(client.refreshInterval).to.be.null;
      });
    });

    describe('#logout()', function() {
      it('Removes any interval on logout', function() {
        client.login({
          url: 'https://demo-api.getdirectus.com',
          email: 'testing@example.com',
          password: 'testPassword',
          persist: true,
        });

        client.logout();

        expect(client.refreshInterval).to.be.null;
      });
    });

    describe('#requestPasswordReset()', function() {
      beforeEach(function() {
        sinon.stub(client, 'post');
      });

      afterEach(function() {
        client.post.restore();
      });

      it('Errors when email parameter is missing', function() {
        expect(client.requestPasswordReset).to.throw();
      });

      it('Calls post sending the required body', function() {
        client.requestPasswordReset('test@example.com');
        expect(client.post).to.have.been.calledWith('/auth/reset-request', {
          email: 'test@example.com',
          instance: 'https://demo-api.getdirectus.com'
        });
      });
    });

    it('Fires refreshIfNeeded() every 10 seconds', function() {
      client.login({
        url: 'https://demo-api.getdirectus.com',
        email: 'testing@example.com',
        password: 'testPassword',
        persist: true,
      });

      expect(client.refreshIfNeeded).to.have.not.been.called;

      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });

      this.clock.tick(11000);

      expect(client.refreshIfNeeded).to.have.been.calledOnce;

      this.clock.tick(11000);

      expect(client.refreshIfNeeded).to.have.been.calledTwice;
    });
  });

  describe('#loggedIn', function() {
    it('Returns true if the client has a valid accesstoken, url, env, and isn\'t expired', function() {
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });
      expect(client.loggedIn).to.equal(true);
    });

    it('Returns false if the accesstoken, url, or env is missing', function() {
      client.url = null;
      expect(client.loggedIn).to.equal(false);
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '20s' });
      expect(client.loggedIn).to.equal(false);
      client.url = 'https://demo-api.getdirectus.com';
      expect(client.loggedIn).to.equal(true);
    });
  });
});
