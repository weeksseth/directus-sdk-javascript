/**
 * TODO: Find a knex-way of accessing information_schema for extra (/correct)
 *   data in getTable() and getTables()
 */

const { createItem, getItems, getItem, updateItem, deleteItem } = require('./items');
const { createTable, getTables, getTable } = require('./tables');

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,

  createTable,
  getTables,
  getTable
}
