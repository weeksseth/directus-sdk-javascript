module.exports = {
  /**
   * Create a new table
   * @param {String} tableName
   * @return {Promise} resolves something
   */
  createTable(tableName) {
    return new Promise((reject, resolve) => {
      // Create new table
      this.knex.schema.createTable(tableName, table => {
        table.increments();
        table.integer('active');
      })
        .then(table => resolve(table))
        .catch(err => reject(err));

      // Add default privilege to directus_privileges
      this.knex('directus_privileges')
        .insert({
          table_name: tableName,
          allow_view: 2,
          allow_add: 1,
          allow_edit: 2,
          allow_delete: 2,
          allow_alter: 1,
          group_id: 1,
          nav_listed: 1,
          status_id: null
        });
    });
  },

  /**
   * Get all table names
   * @param {Object} params options
   */
  getTables(params = {}) {
    return new Promise((reject, resolve) => {
      /**
       * Knex can't access information_schema since it's bound to the
       *   directus table
       */
      this.knex('directus_privileges')
        .select('table_name')
        .then(res => res.map(row => row.table_name))
        .then(res => {
          return params.include_system ? res : res.filter(row => !row.startsWith('directus_'));
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Get table info
   * (just returns columns for now)
   * TODO: improve when information_schema can be accessed
   * @param {String} tableName
   * @return {Promise} resolves info object
   */
  getTable(tableName) {
    return new Promise((reject, resolve) => {
      this.knex(tableName)
        .columnInfo()
        .then(info => resolve(info))
        .catch(err => reject(err));
    });
  }
};
