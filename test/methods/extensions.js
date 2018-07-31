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

    sinon.stub(client, 'request').resolves(responseJSON);
  });

  afterEach(function() {
    client.request.restore();
  });

  describe('#getInterfaces()', function() {
    it('Calls request() for the right endpoint', function() {
      client.getInterfaces();
      expect(client.request).to.have.been.calledWith('get', '/interfaces', {}, {}, true);
    });
  });

  describe('#getLayouts()', function() {
    it('Calls request() for the right endpoint', function() {
      client.getLayouts();
      expect(client.request).to.have.been.calledWith('get', '/layouts', {}, {}, true);
    });
  });

  describe('#getPages()', function() {
    it('Calls request() for the right endpoint', function() {
      client.getPages();
      expect(client.request).to.have.been.calledWith('get', '/pages', {}, {}, true);
    });
  });
});
