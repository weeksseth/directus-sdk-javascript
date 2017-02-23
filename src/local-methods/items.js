module.exports = {
  /**
   * Creates item in given table
   * @param {String} tableName
   * @param {Object} data data to be inserted. Must match mysql field names
   * @return {Promise} resolves ID of inserted item
   */
  createItem(tableName, data) {
     return new Promise((reject, resolve) => {
       this.knex(tableName)
        .insert(data)
        .then(id => resolve(id))
        .catch(err => reject(err));
     });
  },

  /**
   * Get items from given table
   * @param {String} tableName
   * @param {Object} params Select options
   * @return {Promise} resolves Array of found items
   */
  getItems(tableName, params = {}) {
    return new Promise((reject, resolve) => {
      const query = this.knex(tableName);

      // Set query defaults
      query.select()
        .limit(params.limit || 200)
        .offset(params.offset || 0)
        .orderBy(params.orderBy || 'id', params.order || 'asc');

      // Status param
      if(typeof params.status === 'number') {
        query.where('active', params.status);
      } else if(Array.isArray(params.status)) {
        params.status.forEach(status => query.orWhere('active', status));
      }

      if(params.columns) {
        query.columns(...params.columns);
      }

      // Fire query
      query
        .then(rows => resolve(rows))
        .catch(err => reject(err));
    });
  },

  /**
   * Get single item based by ID
   * @param {String} tableName
   * @param {Number} id
   * @return {Promise} resolves requested item
   */
  getItem(tableName, id) {
    return new Promise((reject, resolve) => {
      this.knex(tableName)
        .where({ id })
        .select()
        .then(rows => resolve(rows[0]))
        .catch(err => reject(err));
    });
  },

  /**
   * Update single item by id
   * @param {String} tableName
   * @param {Number} id
   * @param {Object} data data to be updated. Must match mysql field names
   * @return {Promise} resolves true
   */
  updateItem(tableName, id, data) {
    return new Promise((reject, resolve) => {
      this.knex(tableName)
        .where({ id })
        .update(data)
        .then(() => resolve(true))
        .catch(err => reject(err));
    });
  },

  /**
   * Delete item based on id
   * @param {String} tableName
   * @param {Number} id
   * @param {Boolean} deleteFromDB Delete from DB || set active to 0
   * @return {Promise} resolves true
   */
  deleteItem(tableName, id, deleteFromDB = false) {
    return new Promise((reject, resolve) => {
      if(deleteFromDB) {
        this.knex(tableName)
          .where({ id })
          .delete()
          .then(() => resolve(true))
          .catch(err => reject(err));
      } else {
        this.knex(tableName)
          .where({ id })
          .update({ active: 0 })
          .then(() => resolve(true))
          .catch(err => reject(err));
      }
    });
  }
};
