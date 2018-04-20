const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Utils', function() {
  let client;

  beforeEach(function() {
    client = new SDK({
      url: 'https://demo-api.getdirectus.com'
    });

    const responseJSON = {
      data: {
        data: {}
      }
    };

    sinon.stub(client, 'request').resolves(responseJSON);
    sinon.stub(client, 'get').resolves(responseJSON);
    sinon.stub(client, 'put').resolves(responseJSON);
    sinon.stub(client, 'patch').resolves(responseJSON);
    sinon.stub(client, 'post').resolves(responseJSON);
    sinon.stub(client, 'delete').resolves(responseJSON);
  });

  afterEach(function() {
    client.request.restore();
    client.get.restore();
    client.put.restore();
    client.patch.restore();
    client.post.restore();
    client.delete.restore();
  });

  describe('#ping()', function() {
    it('It calls get for the ping endpoint', function() {
      client.ping();
      expect(client.request).to.have.been.calledWith('get', '/server/ping', {}, {}, true);
    });
  });

  describe('#getThirdPartyAuthProviders()', function() {
    it('It calls get for the sso endpoint', function() {
      client.getThirdPartyAuthProviders();
      expect(client.get).to.have.been.calledWith('/auth/sso');
    });
  });
});
