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

  describe('#getMyListingPreferences()', function() {
    it('Errors on missing `collection` parameter', function() {
      expect(client.getMyListingPreferences).to.throw();
    });

    it('Errors if parameter `params` is of a wrong type', function() {
      expect(() => client.getMyListingPreferences('projects', 'params')).to.throw();
    });

    it('Calls get() three times', function() {
      client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });
      client.getMyListingPreferences('projects');
      expect(client.get).to.have.been.calledThrice;
    });

    it('Returns the user preferences if there saved user preferences', async function() {
      client.token = jwt.sign({ group: 5, id: 1 }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][null]': 1,
        'filter[user][null]': 1,
      }).resolves({
        "data": [{
          request: 'collection'
        }]
      });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][eq]': 5,
        'filter[user][null]': 1,
      }).resolves({
        "data": [{
          request: 'group'
        }]
      });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][eq]': 5,
        'filter[user][eq]': 1,
      }).resolves({
        "data": [{
          request: 'user'
        }]
      });

      const result = await client.getMyListingPreferences('faq');

      expect(result).to.deep.equal({
        request: 'user',
      });
    });

    it('Returns the group preferences if there are no saved user preferences', async function() {
      client.token = jwt.sign({ group: 5, id: 1 }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][null]': 1,
        'filter[user][null]': 1,
      }).resolves({
        "data": [{
          request: 'collection'
        }]
      });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][eq]': 5,
        'filter[user][null]': 1,
      }).resolves({
        "data": [{
          request: 'group'
        }]
      });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][eq]': 5,
        'filter[user][eq]': 1,
      }).resolves({
        "data": []
      });

      const result = await client.getMyListingPreferences('faq');

      expect(result).to.deep.equal({
        request: 'group',
      });
    });

    it('Returns the collection preferences if there are no saved user or preferences', async function() {
      client.token = jwt.sign({ group: 5, id: 1 }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][null]': 1,
        'filter[user][null]': 1,
      }).resolves({
        "data": [{
          request: 'collection'
        }]
      });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][eq]': 5,
        'filter[user][null]': 1,
      }).resolves({
        "data": []
      });

      client.get.withArgs(`/collection_presets`, {
        'filter[title][null]': 1,
        'filter[collection][eq]': 'faq',
        'filter[group][eq]': 5,
        'filter[user][eq]': 1,
      }).resolves({
        "data": []
      });

      const result = await client.getMyListingPreferences('faq');

      expect(result).to.deep.equal({
        request: 'collection',
      });
    });
  });
});
