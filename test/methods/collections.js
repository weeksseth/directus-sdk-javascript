const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Collections', function() {
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
    it('Defaults to an empty object if no parameters are passed', function() {
      client.getCollections();
      expect(client.get).to.have.been.calledWith('/collections', {});
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getCollections('params')).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getCollections({ limit: 50 });
      expect(client.get).to.have.been.calledWith('/collections', { limit: 50 });
    });
  });

  describe('#getCollection()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getCollection).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getCollection('projects', 'params')).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getCollection('projects', { limit: 50 });
      expect(client.get).to.have.been.calledWith('/collections/projects', { limit: 50 });
    });
  });

  describe('#createCollection()', function() {
    it('Errors on missing `data` parameter', function() {
      expect(client.createCollection).to.throw();
    });

    it('Calls post() for the right endpoint', function() {
      client.createCollection({ collection: 'test' });
      expect(client.post).to.have.been.calledWith('/collections', { collection: 'test' });
    });
  });

  describe('#updateCollection()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.updateCollection).to.throw();
    });

    it('Errors on missing `data` parameter', function() {
      expect(() => client.updateCollection('test')).to.throw();
    });

    it('Calls patch() for the right endpoint', function() {
      client.updateCollection('test', { note: 'test note' });
      expect(client.patch).to.have.been.calledWith('/collections/test', { note: 'test note' });
    });
  });

  describe('#deleteCollection()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(() => client.deleteCollection()).to.throw();
    });

    it('Calls delete() for the right endpoint', function() {
      client.deleteCollection('test');
      expect(client.delete).to.have.been.calledWith('/collections/test');
    });
  });
});
