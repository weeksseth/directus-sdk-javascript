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

  describe('#getPermissions()', function() {
    it('Defaults to an empty object if no parameters are passed', function() {
      client.getPermissions();
      expect(client.get).to.have.been.calledWith('/permissions', {});
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getPermissions('params')).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getPermissions({ limit: 50 });
      expect(client.get).to.have.been.calledWith('/permissions', { limit: 50 });
    });
  });

  describe('#updatePermissions()', function() {
    it('Errors on missing `data` parameter', function() {
      expect(client.updatePermissions).to.throw();
    });

    it('Errors on wrong `data` parameter', function() {
      expect(() => client.createPermissions('projects')).to.throw();
    });

    it('Calls post() for the right endpoint', function() {
      client.createPermissions([{ read: 'none', collection: 'projects' }]);
      expect(client.post).to.have.been.calledWith('/permissions', [{ read: 'none', collection: 'projects' }]);
    });
  });

  describe('#updatePermissions()', function() {
    it('Errors on missing `data` parameter', function() {
      expect(client.updatePermissions).to.throw();
    });

    it('Errors on wrong `data` parameter', function() {
      expect(() => client.updatePermissions('projects')).to.throw();
    });

    it('Calls post() for the right endpoint', function() {
      client.updatePermissions([{ read: 'none', collection: 'projects' }]);
      expect(client.patch).to.have.been.calledWith('/permissions', [{ read: 'none', collection: 'projects' }]);
    });
  });
});
