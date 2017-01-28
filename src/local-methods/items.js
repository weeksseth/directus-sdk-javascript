module.exports = {
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
  }
};
