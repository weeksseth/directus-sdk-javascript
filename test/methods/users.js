const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Users', function() {
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
    sinon.stub(client, 'updateItem').resolves(responseJSON);
  });

  afterEach(function() {
    client.get.restore();
    client.put.restore();
    client.patch.restore();
    client.post.restore();
    client.delete.restore();
    client.updateItem.restore();
  });

  describe('#getUsers()', function() {
    it('Defaults to an empty object if no parameters are passed', function() {
      client.getUsers();
      expect(client.get).to.have.been.calledWith('/users', {});
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getUsers('params')).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getUsers({ limit: 50 });
      expect(client.get).to.have.been.calledWith('/users', { limit: 50 });
    });
  });

  describe('#getUser()', function() {
    it('Errors on missing `primaryKey` parameter', function() {
      expect(client.getUser).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getUser('projects', 140)).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getUser(15, { fields: 'first_name' });
      expect(client.get).to.have.been.calledWith('/users/15', { fields: 'first_name' });
    });
  });

  describe('#getMe()', function() {
    it('Defaults to an empty object if no parameters are passed', function() {
      client.getMe();
      expect(client.get).to.have.been.calledWith('/users/me', {});
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getMe(140)).to.throw();
    });

    it('Calls get() for the right endpoint', function() {
      client.getMe({ fields: 'first_name' });
      expect(client.get).to.have.been.calledWith('/users/me', { fields: 'first_name' });
    });
  });

  describe('#updateUser()', function() {
    it('Errors on missing `primaryKey` parameter', function() {
      expect(client.updateUser).to.throw();
    });

    it('Errors on missing `body` parameter', function() {
      expect(() => client.updateUser(15)).to.throw();
    });

    it('Calls #updateItem()', function() {
      client.updateUser(15, { last_page: '/activity' });
      expect(client.updateItem).to.have.been.calledWith('directus_users', 15, { last_page: '/activity' });
    });
  });
});
