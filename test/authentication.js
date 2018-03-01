const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../remote');

describe('Authentication', function() {
  describe('#login()', function() {
    beforeEach(function() {
      client = new SDK({
        url: 'https://demo-api.getdirectus.com'
      });
    });

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

    it('Calls Axios with the right parameters', function() {
      sinon.stub(client.axios, 'request');

      client.login({
        email: 'test@example.com',
        password: 'testPassword'
      });

      expect(client.axios.request).to.have.been.calledWith({

      });

      client.axios.request.restore();
    });
  });
});
