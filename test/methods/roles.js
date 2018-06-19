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

  describe('#getRoles()', function() {
    it('Defaults to an empty object if no parameters are passed', function() {
      client.getRoles();
      expect(client.get).to.have.been.calledWith('/roles', {});
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getRoles('params')).to.throw();
    });

    it('Calls get() for the right endpoint', async function() {
      client.getRoles({ limit: 50 });
      expect(client.get).to.have.been.calledWith('/roles', { limit: 50 });
    });
  });

  describe('#getRole()', function() {
    it('Errors if parameter `primaryKey` doesn\'t exist', function() {
      expect(client.getRole).to.throw();
    });

    it('Errors if parameter `primaryKey` is of a wrong type', function() {
      expect(() => client.getRole({})).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getRole(4, 'params')).to.throw();
    });

    it('Calls get() for the right endpoint', async function() {
      client.getRole(4, { fields: 'name,id' });
      expect(client.get).to.have.been.calledWith('/roles/4', { fields: 'name,id' });
    });
  });

  describe('#updateRole()', function() {
    it('Errors on missing `primaryKey` parameter', function() {
      expect(client.updateRole).to.throw();
    });

    it('Errors on missing `body` parameter', function() {
      expect(() => client.updateRole(15)).to.throw();
    });

    it('Calls patch() for the right endpoint', function() {
      client.updateRole(15, { name: 'Intern' });
      expect(client.patch).to.have.been.calledWith('/roles/15', { name: 'Intern' });
    });
  });

  describe('#createRole()', function() {
    it('Errors on missing `body` parameter', function() {
      expect(client.createRole).to.throw();
    });

    it('Errors on wrong `body` parameter type', function() {
      expect(() => client.createRole(15)).to.throw();
    });

    it('Calls post() for the right endpoint', function() {
      client.createRole({ name: 'Intern' });
      expect(client.post).to.have.been.calledWith('/roles', { name: 'Intern' });
    });
  });

  describe('#deleteRole()', function() {
    it('Errors on missing `primaryKey` parameter', function() {
      expect(client.deleteRole).to.throw();
    });

    it('Calls delete() for the right endpoint', function() {
      client.deleteRole(15);
      expect(client.delete).to.have.been.calledWith('/roles/15');
    });
  });
});
