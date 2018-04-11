const chai = require('chai');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Items', function() {
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

    sinon.stub(client, 'get').resolves(responseJSON);
    sinon.stub(client, 'put').resolves(responseJSON);
    sinon.stub(client, 'patch').resolves(responseJSON);
    sinon.stub(client, 'post').resolves(responseJSON);
    sinon.stub(client, 'delete').resolves(responseJSON);
  });

  afterEach(function() {
    client.get.restore();
    client.put.restore();
    client.patch.restore();
    client.post.restore();
    client.delete.restore();
  });

  describe('#getMyBookmarks()', function() {
    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getMyListingPreferences('params')).to.throw();
    });

    it('Calls get() two times', function() {
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });
      client.getMyBookmarks();
      expect(client.get).to.have.been.calledTwice;
    });
  });
});
