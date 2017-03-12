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
      this.knex('directus_privileges')
        .select('table_name')
        .then(res => res.map(row => row.table_name))
        .then(res => {
          return params.includeSystem ? res : res.filter(row => !row.startsWith('directus_'));
        })
        .then(res => ({
          meta: {
            type: 'collection',
            table: 'directus_tables'
          },
          data: res.map(name => ({ name }))
        }))
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Get table info
   * @param {String} tableName
   * @return {Promise} resolves info object
   */
  getTable(tableName) {
    /**
     * Build JSON output from results of three DB queries
     * @param  {Array} resultsArray Array of results of db queries
     * @return {Object} Formatted JSON of all data to be outputted
     *
     * results[0]: information_schema
     * results[1]: directus_columns
     * results[2]: directus_preferences
     * results[3]: directus_tables
     */
    function buildJSON(results) {
      const informationSchema = results[0];
      const directusColumns = results[1];
      const directusPreferences = results[2];
      const directusTables = results[3];

      return {
        meta: {
          type: 'item',
          table: 'directus_tables',
        },
        data: {
          id: tableName,
          table_name: tableName,
          date_created: informationSchema.CREATE_TIME,
          comment: informationSchema.TABLE_COMMENT || '',
          hidden: !!directusTables.hidden,
          single: !!directusTables.single,
          is_junction_table: '?', // TODO
          user_create_column: directusTables.user_create_column || null,
          user_update_column: directusTables.user_update_column || null,
          date_create_column: directusTables.date_create_column || null,
          date_update_column: directusTables.date_update_column || null,
        },
        footer: !!directusTables.footer,
        columns: Object.keys(directusColumns).map(key => {
          return {
            id: key,
            column_name: key,
            type: directusColumns[key].type,
            is_nullable: !directusColumns[key].required,
            comment: directusColumns[key].comment,
            sort: directusColumns[key].sort,
            system: '?', // TODO
            master: '?', // TODO
            hidden_list: !!directusColumns[key].hidden_list,
            hidden_input: !!directusColumns[key].hidden_input,
            required: !!directusColumns[key].required,
            column_type: directusColumns[key].data_type,
            is_writable: '?', // TODO,
            ui: directusColumns[key].ui,
            hidden: '?', // TODO,
            options: '?', // TODO
          };
        }),
        preferences: directusPreferences
      };
    }

    return new Promise((reject, resolve) => {
      const informationSchema = this.knex
        .select()
        .from('information_schema.tables')
        .where('table_name', tableName)
        .where('table_schema', 'directus');

      const directusColumns = this.knex('directus_columns')
        .select()
        .where('table_name', tableName);

      const directusPreferences = this.knex('directus_preferences')
        .select()
        .where('table_name', tableName);

      const directusTables = this.knex('directus_tables')
        .select()
        .where('table_name', tableName);

      Promise.all([
        informationSchema,
        directusColumns,
        directusPreferences,
        directusTables
      ])
      .then(results => resolve(buildJSON(results)))

      // To test raw data output: un-comment the following:
      // .then(res => console.log({
      //   informationSchema: res[0],
      //   directusColumns: res[1],
      //   directusPreferences: res[2],
      //   directusTables: res[3]
      // }))

      .catch(err => reject(err));
    });
  }
};
