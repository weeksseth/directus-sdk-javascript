const { buildPath, performRequest } = require('./base');
const { createItem, getItems, getItem, updateItem, deleteItem } = require('./items');
const { createFile, getFiles, getFile, updateFile } = require('./files');
const { getTables, getTable, createTable } = require('./tables');
const { createColumn, getColumns, getColumn, updateColumn, deleteColumn } = require('./columns');
const { createPrivilege, getGroupPrivilege, getTablePrivilege, updatePrivilege } = require('./privileges');
const { getPreference, updatePreference } = require('./preferences');
const { getMessages, getMessage } = require('./messages');
const { getActivity } = require('./activity');
const { getBookmarks, getUserBookmarks, getBookmark, createBookmark, deleteBookmark } = require('./bookmarks');
const { getSettings, getSettingsByCollection, updateSettings } = require('./settings');

module.exports = {
  buildPath,
  performRequest,

  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,

  createFile,
  getFiles,
  getFile,
  updateFile,

  getTables,
  getTable,
  createTable,

  createColumn,
  getColumns,
  getColumn,
  updateColumn,
  deleteColumn,

  createPrivilege,
  getGroupPrivilege,
  getTablePrivilege,
  updatePrivilege,

  getPreference,
  updatePreference,

  getMessages,
  getMessage,

  getActivity,              // ^1.1

  getBookmarks,
  getUserBookmarks,         // ^1.1
  getBookmark,
  createBookmark,           // ^1.1
  deleteBookmark,           // ^1.1

  getSettings,
  getSettingsByCollection,
  updateSettings
};
