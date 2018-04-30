const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Revisions', function() {
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

  describe('#getItemRevisions()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getItemRevisions).to.throw();
    });

    it('Errors on missing `primaryKey` parameter', function() {
      expect(() => client.getItemRevisions('projects')).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getItemRevisions('projects', 15, 140)).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getItemRevisions('projects', 15, { fields: ['title', 'author'] });
      expect(client.get).to.have.been.calledWith('/items/projects/15/revisions', { fields: ['title', 'author'] });
    });

    it('Calls get() for the system endpoint if a directus_* table is requested', function() {
      client.getItemRevisions('directus_users', 15, { fields: ['title', 'author'] });
      expect(client.get).to.have.been.calledWith('/users/15/revisions', { fields: ['title', 'author'] });
    });
  });

  describe('#revert()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.revert).to.throw();
    });

    it('Errors on missing `primaryKey` parameter', function() {
      expect(() => client.revert('projects')).to.throw();
    });

    it('Errors on missing `revisionID` parameter', function() {
      expect(() => client.revert('projects', 15)).to.throw();
    });

    it('Calls patch() for the right endpoint', function() {
      client.revert('projects', 15, 130);
      expect(client.patch).to.have.been.calledWith('/items/projects/15/revert/130');
    });

    it('Calls patch() for the system endpoint if a directus_* table is requested', function() {
      client.revert('directus_users', 15, 130);
      expect(client.patch).to.have.been.calledWith('/users/15/revert/130');
    });
  });
});
