const expect = require('chai').expect;
const SDK = require('../remote');

describe('General', function() {
  it('Creates a new instance without errors', function() {
    expect(() => new SDK()).not.to.throw();
  });

  it('Allows you to set and retrieve the api url', function() {
    const client = new SDK();
    client.url = 'https://demo-api.getdirectus.com/';
    expect(client.url).to.equal('https://demo-api.getdirectus.com/');
  });

  it('Allows you to set the url on creation', function() {
    const client = new SDK({
      url: 'https://demo-api.getdirectus.com/'
    });
    expect(client.url).to.equal('https://demo-api.getdirectus.com/');
  });

  it('Allows you to set and retrieve the access token', function() {
    const client = new SDK();
    client.token = 'abcdef123456';
    expect(client.token).to.equal('abcdef123456');
  });

  it('Allows you to set the access token on creation', function() {
    const client = new SDK({
      token: 'abcdef123456'
    });
    expect(client.token).to.equal('abcdef123456');
  });

  it('Allows you to set and retrieve the environment in use', function() {
    const client = new SDK();
    client.env = 'staging';
    expect(client.env).to.equal('staging');
  });

  it('Allows you to set the environment on creation', function() {
    const client = new SDK({
      env: 'staging'
    });
    expect(client.env).to.equal('staging');
  });

  it('Defaults the environment to underscore (_)', function() {
    const client = new SDK();
    expect(client.env).to.equal('_');
  });
});
