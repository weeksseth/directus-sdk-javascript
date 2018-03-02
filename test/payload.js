const chai = require('chai');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
chai.use(require('chai-datetime'));

const SDK = require('../remote');

describe('JWT Payload', function() {
  let client;

  beforeEach(function() {
    client = new SDK();
  });

  it('Returns null when there is no token set', function() {
    expect(client.payload).to.be.null;
  });

  it('Returns the correct payload from the set token', function() {
    client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true });
    expect(client.payload).to.deep.equal({ foo: 'bar' });
  });

  it('Converts the optional exp in payload to the correct JS Date', function() {
    // JWT Expires in 1h
    client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });

    const date = new Date();
    date.setHours(date.getHours() + 1);

    expect(client.payload.exp).to.equalDate(date);
  });

  it('Reports a loggedIn flag when token, url, env are set and token hasn\'t expired', function() {
    client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '-1h' });
    client.url = 'https://demo-api.getdirectus.com';
    expect(client.loggedIn).to.equal(false);

    client.token = jwt.sign({ foo: 'bar' }, 'secret-string', { noTimestamp: true, expiresIn: '1h' });
    expect(client.loggedIn).to.equal(true);
  });
});
