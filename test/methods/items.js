const chai = require('chai');
const expect = chai.expect;
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

  describe('#createItem()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.createItem).to.throw();
    });

    it('Errors on missing `body` parameter', function() {
      expect(() => client.createItem('projects')).to.throw();
    });

    it('Calls post() for the right endpoint', function() {
      client.createItem('projects', { title: 'Groetjes uit NYC' });
      expect(client.post).to.have.been.calledWith('/items/projects', { title: 'Groetjes uit NYC' });
    });
  });

  describe('#updateItem()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.updateItem).to.throw();
    });

    it('Errors on missing `primaryKey` parameter', function() {
      expect(() => client.updateItem('projects')).to.throw();
    });

    it('Errors on missing `body` parameter', function() {
      expect(() => client.updateItem('projects', '15')).to.throw();
    });

    it('Calls patch() for the right endpoint', function() {
      client.updateItem('projects', '15', { title: 'Groetjes uit NYC' });
      expect(client.patch).to.have.been.calledWith('/items/projects/15', { title: 'Groetjes uit NYC' });
    });
  });

  describe('#getItems()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getItems).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getItems('projects', 'params')).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getItems('projects', { limit: 50 });
      expect(client.get).to.have.been.calledWith('/items/projects', { limit: 50 });
    });

    it('Calls get() for the system endpoint if a directus_* table is requested', function() {
      client.getItems('directus_users', { limit: 50 });
      expect(client.get).to.have.been.calledWith('/users', { limit: 50 });
    });
  });

  describe('#getItem()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getItem).to.throw();
    });

    it('Errors on missing `primaryKey` parameter', function() {
      expect(() => client.getItem('projects')).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getItem('projects', 15, 140)).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getItem('projects', 15, { fields: ['title', 'author'] });
      expect(client.get).to.have.been.calledWith('/items/projects/15', { fields: ['title', 'author'] });
    });
  });

  describe('#deleteItem()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.deleteItem).to.throw();
    });

    it('Errors on missing `primaryKey` parameter', function() {
      expect(() => client.deleteItem('projects')).to.throw();
    });

    it('Calls delete() for the right endpoint', function() {
      client.deleteItem('projects', 15);
      expect(client.delete).to.have.been.calledWith('/items/projects/15');
    });
  });
});
