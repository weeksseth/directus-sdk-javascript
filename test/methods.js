const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../remote');

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

  describe('#createItem()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.createItem).to.throw(Error, 'createItem(): Parameter `collection` is required');
    });

    it('Errors on missing `body` parameter', function() {
      expect(() => client.createItem('projects')).to.throw(Error, 'createItem(): Parameter `body` is required');
    });

    it('Calls post() for the right endpoint', function() {
      client.createItem('projects', { title: 'Groetjes uit NYC' });
      expect(client.post).to.have.been.calledWith('/items/projects', { title: 'Groetjes uit NYC' });
    });
  });

  describe('#getItems()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getItems).to.throw(Error, 'getItems(): Parameter `collection` is required');
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getItems('projects', 'params')).to.throw(Error, 'getItems(): Parameter `params` has to be of type object. [string] given.');
    });

    it('Calls get() for the right endpoint', function() {
      client.getItems('projects', { limit: 50 });
      expect(client.get).to.have.been.calledWith('/items/projects', { limit: 50 });
    });
  });

  describe('#getItem()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getItem).to.throw(Error, 'getItem(): Parameter `collection` is required');
    });

    it('Errors on missing `collection` parameter', function() {
      expect(() => client.getItem('projects')).to.throw(Error, 'getItem(): Parameter `primaryKey` is required');
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getItem('projects', 15, 140)).to.throw(Error, 'getItem(): Parameter `params` has to be of type object. [number] given.');
    });

    it('Calls get() for the right endpoint', function() {
      client.getItem('projects', 15, { fields: ['title', 'author'] });
      expect(client.get).to.have.been.calledWith('/items/projects/15', { fields: ['title', 'author'] });
    });
  });
});
