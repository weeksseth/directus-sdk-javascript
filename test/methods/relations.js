const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Relations', function() {
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

  describe('#getCollectionRelations()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getCollectionRelations).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getCollectionRelations('projects', 'params')).to.throw();
    });

    it('Calls get() twice', async function() {
      client.getCollectionRelations('projects', { limit: 50 });
      expect(client.get).to.have.been.calledTwice;
    });
  });
});
