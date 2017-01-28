/**
 * Directus JavaScript SDK
 *
 * Constructor function
 */

function SDK(config = {}, apiVersion = 1.1) {
  if(config.accessToken && config.url) { // use remote connection

    const { accessToken, url } = config;

    // Add config options to this
    Object.assign(this, { accessToken, url });

    // Add remote endpoints to thiss
    this.endpoints = require('./endpoints');

    // Set base url
    this.baseEndpoint = this.url + '/' + config.apiVersion || 1.1 + '/';

    // Add methods to this
    Object.assign(this, require('./remote-methods/index'));

  } else if(config.database) { // use local connection

    // Check if all the required config options are given
    if(
      !config.database.user ||
      !config.database.password ||
      !config.database.database
    ) throw Error('Not all required database config options given');

    // Setup knex
    this.knex = require('knex')({
      client: 'mysql',
      connection: Object.assign({}, config.database)
    });

    // Add methods
    Object.assign(this, require('./local-methods/'));
  }
}

module.exports = SDK;
