const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Methods', function() {
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

  describe('#getCollections()', function() {
    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getCollections('params')).to.throw(Error, 'getCollections(): Parameter `params` has to be of type object. [string] given.');
    });

    it('Calls get() for the right endpoint', function() {
      client.getCollections({ limit: 50 });
      expect(client.get).to.have.been.calledWith('/collections', { limit: 50 });
    });
  });

  describe('#getCollection()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getCollection).to.throw(Error, 'getCollection(): Parameter `collection` is required');
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getCollection('projects', 'params')).to.throw(Error, 'getCollection(): Parameter `params` has to be of type object. [string] given.');
    });

    it('Calls get() for the right endpoint', function() {
      client.getCollection('projects', { limit: 50 });
      expect(client.get).to.have.been.calledWith('/collections/projects', { limit: 50 });
    });
  });
});
