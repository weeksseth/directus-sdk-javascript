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

  describe('#createItem', function() {
    it('Errors on missing `id` parameter', function() {
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
});
