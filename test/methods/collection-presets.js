const chai = require('chai');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
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

  describe('#createCollectionPreset', function() {
    it('Errors when the data parameter is missing', function() {
      expect(client.createCollectionPreset).to.throw();
    });

    it('Calls post with the right parameters', async function() {
      await client.createCollectionPreset({
        view_type: 'tiles',
      });
      expect(client.post).to.have.been.calledWith('/collection_presets', {
        view_type: 'tiles',
      });
    });
  });

  describe('#updateCollectionPreset', function() {
    it('Errors when the primaryKey parameter is missing', function() {
      expect(client.updateCollectionPreset).to.throw();
    });

    it('Errors when the data parameter is missing', function() {
      expect(() => client.updateCollectionPreset(15)).to.throw();
    });

    it('Calls patch with the right parameters', async function() {
      await client.updateCollectionPreset(15, {
        view_type: 'tiles',
      });
      expect(client.patch).to.have.been.calledWith('/collection_presets/15', {
        view_type: 'tiles',
      });
    });
  });

  describe('#updateCollectionPreset', function() {
    it('Errors when the primaryKey parameter is missing', function() {
      expect(client.updateCollectionPreset).to.throw();
    });

    it('Calls delete with the right parameters', async function() {
      await client.deleteCollectionPreset(15);
      expect(client.delete).to.have.been.calledWith('/collection_presets/15');
    });
  });
});
