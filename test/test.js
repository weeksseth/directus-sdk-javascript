const expect = require('chai').expect;
const sdk = require('../remote');

describe('Methods', function() {
  let client;

  beforeEach(function() {
    client = new sdk();
  });

  describe('#get()', function() {
    it('errors on missing parameter path', function() {
      expect(client.get).to.throw(Error, 'get(): Parameter `path` is required');
    });

    it('errors if params isn\'t of the right type', function() {
      expect(() => client.get('/items', 'params')).to.throw(Error, 'get(): Parameter `params` has to be of type Object. [string] given.');
    });
  });
});
