const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const SDK = require('../../remote');

describe('Fields', function() {
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

  describe('#getFields()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getFields).to.throw(Error, 'getFields(): Parameter `collection` is required');
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getFields('projects', 'params')).to.throw(Error, 'getFields(): Parameter `params` has to be of type object. [string] given.');
    });

    it('Calls get() for the right endpoint', function() {
      client.getFields('projects', { limit: 50 });
      expect(client.get).to.have.been.calledWith('/fields/projects', { limit: 50 });
    });
  });

  describe('#getField()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getField).to.throw(Error, 'getField(): Parameter `collection` is required');
    });

    it('Errors on missing `fieldName` parameter', function() {
      expect(() => client.getField('projects')).to.throw(Error, 'getField(): Parameter `fieldName` is required');
    });

    it('Calls get() for the right endpoint', function() {
      client.getField('projects', 'title', { fields: 'interface' });
      expect(client.get).to.have.been.calledWith('/fields/projects/title', { fields: 'interface' });
    });
  });
});
