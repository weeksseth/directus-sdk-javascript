module.exports = function(e) {
    function t(i) {
        if (r[i]) return r[i].exports;
        var n = r[i] = {
            exports: {},
            id: i,
            loaded: !1
        };
        return e[i].call(n.exports, n, n.exports, t), n.loaded = !0, n.exports;
    }
    var r = {};
    return t.m = e, t.c = r, t.p = "", t(0);
}([ function(e, t, r) {
    e.exports = r(1);
}, function(e, t, r) {
    "use strict";
    function i() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1.1;
        if (e.accessToken && e.url) {
            var t = e.accessToken, i = e.url;
            Object.assign(this, {
                accessToken: t,
                url: i
            }), this.endpoints = r(2), this.baseEndpoint = this.url + "/" + e.apiVersion || "1.1/", 
            Object.assign(this, r(3));
        } else if (e.database) {
            if (!e.database.user || !e.database.password || !e.database.database) throw Error("Not all required database config options given");
            this.knex = r(19)({
                client: "mysql",
                connection: Object.assign({}, e.database)
            }), Object.assign(this, r(20));
        }
    }
    e.exports = i;
}, function(e, t) {
    "use strict";
    e.exports = {
        tableEntries: "tables/%s/rows",
        tableEntry: "tables/%s/rows/%s",
        tableList: "tables",
        tableInformation: "tables/%s",
        tablePreferences: "tables/%s/preferences",
        columnList: "tables/%s/columns",
        columnInformation: "tables/%s/columns/%s",
        groupList: "groups",
        groupInformation: "groups/%s",
        groupPrivileges: "privileges/%s",
        tablePrivileges: "privileges/%s/%s",
        fileList: "files",
        fileInformation: "files/%s",
        settingList: "settings",
        settingCollection: "settings/%s",
        messageList: "messages/rows",
        messageInformation: "messages/rows/%s",
        activity: "activity",
        bookmarkList: "bookmarks",
        bookmarkSelf: "bookmarks/self",
        bookmarkInformation: "bookmarks/%s",
        settings: "settings",
        settingsType: "settings/%s"
    };
}, function(e, t, r) {
    "use strict";
    var i = r(4), n = i.buildPath, a = i.performRequest, o = r(8), s = o.createItem, l = o.getItems, c = o.getItem, u = o.updateItem, d = o.deleteItem, f = r(10), p = f.createFile, m = f.getFiles, b = f.getFile, h = f.updateFile, T = r(11), k = T.getTables, v = T.getTable, g = T.createTable, O = r(12), I = O.createColumn, N = O.getColumns, R = O.getColumn, q = O.updateColumn, C = O.deleteColumn, y = r(13), E = y.createPrivilege, F = y.getGroupPrivilege, P = y.getTablePrivilege, B = y.updatePrivilege, G = r(14), U = G.getPreference, S = G.updatePreference, j = r(15), x = j.getMessages, w = j.getMessage, _ = r(16), J = _.getActivity, L = r(17), A = L.getBookmarks, V = L.getUserBookmarks, D = L.getBookmark, M = L.createBookmark, z = L.deleteBookmark, H = r(18), W = H.getSettings, Y = H.getSettingsByCollection, K = H.updateSettings;
    e.exports = {
        buildPath: n,
        performRequest: a,
        createItem: s,
        getItems: l,
        getItem: c,
        updateItem: u,
        deleteItem: d,
        createFile: p,
        getFiles: m,
        getFile: b,
        updateFile: h,
        getTables: k,
        getTable: v,
        createTable: g,
        createColumn: I,
        getColumns: N,
        getColumn: R,
        updateColumn: q,
        deleteColumn: C,
        createPrivilege: E,
        getGroupPrivilege: F,
        getTablePrivilege: P,
        updatePrivilege: B,
        getPreference: U,
        updatePreference: S,
        getMessages: x,
        getMessage: w,
        getActivity: J,
        getBookmarks: A,
        getUserBookmarks: V,
        getBookmark: D,
        createBookmark: M,
        deleteBookmark: z,
        getSettings: W,
        getSettingsByCollection: Y,
        updateSettings: K
    };
}, function(e, t, r) {
    "use strict";
    var i = r(5).vsprintf, n = r(6), a = r(7);
    e.exports = {
        buildPath: function(e, t) {
            return i(e, t);
        },
        performRequest: function() {
            var e = a([ {
                method: a.STRING | a.Required
            }, {
                pathFormat: a.STRING | a.Required
            }, {
                variables: a.ARRAY | a.Optional,
                _default: []
            }, {
                paramsOrBody: a.OBJECT | a.Optional,
                _default: {}
            }, {
                callback: a.FUNCTION | a.Required
            } ], arguments), t = e.pathFormat.indexOf("%s") === -1 ? this.baseEndpoint + e.pathFormat : this.baseEndpoint + this.buildPath(e.pathFormat, e.variables), r = function(r, i, n) {
                if (r) throw new Error(r);
                r || 200 != i.statusCode ? 500 == i.statusCode ? e.callback(t + " returned internal server error (500)") : 404 == i.statusCode ? e.callback(t + " returned not found (404)") : 403 == i.statusCode ? e.callback(t + " returned not authorized (403)") : 401 == i.statusCode && e.callback(t + " returned not logged in (401)") : e.callback(null, JSON.parse(n));
            };
            switch (e.method) {
              case "GET":
                n.get({
                    auth: {
                        bearer: this.accessToken
                    },
                    qs: e.paramsOrBody,
                    url: t
                }, r);
                break;

              case "POST":
                n.post({
                    auth: {
                        bearer: this.accessToken
                    },
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(e.paramsOrBody),
                    url: t
                }, r);
                break;

              case "PATCH":
                n.patch({
                    auth: {
                        bearer: this.accessToken
                    },
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(e.paramsOrBody),
                    url: t
                }, r);
                break;

              case "PUT":
                n.put({
                    auth: {
                        bearer: this.accessToken
                    },
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(e.paramsOrBody),
                    url: t
                }, r);
                break;

              case "DELETE":
                n.delete({
                    auth: {
                        bearer: this.accessToken
                    },
                    url: t
                }, r);
            }
        }
    };
}, function(e, t) {
    e.exports = require("sprintf-js");
}, function(e, t) {
    e.exports = require("request");
}, function(e, t) {
    e.exports = require("args-js");
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        createItem: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("POST", this.endpoints.tableEntries, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getItems: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("GET", this.endpoints.tableEntries, r, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getItem: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                id: i.INT | i.Required
            }, {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table, e.id ];
            return this.performRequest("GET", this.endpoints.tableEntry, r, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        updateItem: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                id: i.INT | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table, e.id ];
            return this.performRequest("PUT", this.endpoints.tableEntry, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        deleteItem: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                id: i.INT | i.Required
            }, {
                deleteFromDB: i.BOOL | i.Optional,
                _default: !1
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table, e.id ];
            return e.deleteFromDB ? this.performRequest("DELETE", this.endpoints.tableEntry, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }) : this.performRequest("PUT", this.endpoints.tableEntry, r, {
                active: 0
            }, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t) {
    e.exports = require("q");
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        createFile: function() {
            var e = i([ {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments);
            this.createItem("directus_files", e.data, e.callback);
        },
        getFiles: function() {
            var e = i([ {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.fileList, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getFile: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id ];
            return this.performRequest("GET", this.endpoints.fileInformation, r, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        updateFile: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments);
            this.updateItem("directus_files", e.id, e.data, e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        createTable: function() {
            if (this.apiVersion < 1.1) throw Error("This method can't be used with api version " + this.apiVersion + " use version ^1.1 instead");
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("POST", this.endpoints.tableList, {
                name: e.table
            }, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getTables: function() {
            var e = i([ {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.tableList, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getTable: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("GET", this.endpoints.tableInformation, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        createColumn: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("POST", this.endpoints.columnList, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getColumns: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("GET", this.endpoints.columnList, r, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getColumn: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                column: i.STRING | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table, e.column ];
            return this.performRequest("GET", this.endpoints.columnInformation, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        updateColumn: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                column: i.STRING | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table, e.column ];
            return this.performRequest("PUT", this.endpoints.columnInformation, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        deleteColumn: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                column: i.STRING | i.Required
            }, {
                deleteFromDB: i.BOOL | i.Optional,
                _default: !1
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table, e.column ];
            return this.performRequest("DELETE", this.endpoints.columnInformation, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        createPrivileges: function() {
            var e = i([ {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id ];
            return this.performRequest("POST", this.endpoints.groupPrivileges, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getGroupPrivileges: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id ];
            return this.performRequest("GET", this.endpoints.groupPrivileges, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getTablePrivileges: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                table: i.STRING | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id, e.table ];
            return this.performRequest("GET", this.endpoints.tablePrivileges, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        updatePrivileges: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                privId: i.INT | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id, e.privId ];
            return this.performRequest("PUT", this.endpoints.tablePrivileges, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        getPreferences: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("GET", this.endpoints.tablePreferences, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        updatePreferences: function() {
            var e = i([ {
                table: i.STRING | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.table ];
            return this.performRequest("PUT", this.endpoints.tablePreferences, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        getMessages: function() {
            var e = i([ {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.messageList, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getMessage: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id ];
            return this.performRequest("GET", this.endpoints.messageInformation, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        getActivity: function() {
            if (this.apiVersion < 1.1) throw Error("This method can't be used with api version " + this.apiVersion + " use version ^1.1 instead");
            var e = i([ {
                params: i.OBJECT | i.Optional,
                _default: {}
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.activity, e.params, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        getBookmarks: function() {
            var e = i([ {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.bookmarkList, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getUserBookmarks: function() {
            if (this.apiVersion < 1.1) throw Error("This method can't be used with api version " + this.apiVersion + " use version ^1.1 instead");
            var e = i([ {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.bookmarkSelf, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getBookmark: function() {
            var e = i([ {
                id: i.INT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id ];
            return this.performRequest("GET", this.endpoints.bookmarkInformation, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        createBookmark: function() {
            if (this.apiVersion < 1.1) throw Error("This method can't be used with api version " + this.apiVersion + " use version ^1.1 instead");
            var e = i([ {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("POST", this.endpoints.bookmarkList, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        deleteBookmark: function() {
            if (this.apiVersion < 1.1) throw Error("This method can't be used with api version " + this.apiVersion + " use version ^1.1 instead");
            var e = i([ {
                id: i.INT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.id ];
            return this.performRequest("DELETE", this.endpoints.bookmarkInformation, r, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t, r) {
    "use strict";
    var i = r(7), n = r(9);
    e.exports = {
        getSettings: function() {
            var e = i([ {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer();
            return this.performRequest("GET", this.endpoints.settings, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        getSettingsByCollection: function() {
            var e = i([ {
                collection: i.STRING | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.collection ];
            return this.performRequest("GET", this.endpoints.settingsType, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        },
        updateSettings: function() {
            var e = i([ {
                collection: i.STRING | i.Required
            }, {
                data: i.OBJECT | i.Required
            }, {
                callback: i.FUNCTION | i.Optional
            } ], arguments), t = n.defer(), r = [ e.collection ];
            return this.performRequest("PUT", this.endpoints.settingsType, r, e.data, function(e, r) {
                e && t.reject(e), t.resolve(r);
            }), t.promise.nodeify(e.callback);
        }
    };
}, function(e, t) {
    e.exports = require("knex");
}, function(e, t, r) {
    "use strict";
    var i = r(21), n = i.createItem, a = i.getItems, o = i.getItem, s = i.updateItem, l = i.deleteItem, c = r(22), u = c.createTable, d = c.getTables;
    e.exports = {
        createItem: n,
        getItems: a,
        getItem: o,
        updateItem: s,
        deleteItem: l,
        createTable: u,
        getTables: d
    };
}, function(e, t) {
    "use strict";
    function r(e) {
        if (Array.isArray(e)) {
            for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
            return r;
        }
        return Array.from(e);
    }
    e.exports = {
        createItem: function(e, t) {
            var r = this;
            return new Promise(function(i, n) {
                r.knex(e).insert(t).then(function(e) {
                    return n(e);
                }).catch(function(e) {
                    return i(e);
                });
            });
        },
        getItems: function(e) {
            var t = this, i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            return new Promise(function(n, a) {
                var o = t.knex(e);
                o.select().limit(i.limit || 200).offset(i.offset || 0).orderBy(i.orderBy || "id", i.order || "asc"), 
                "number" == typeof i.status ? o.where("active", i.status) : Array.isArray(i.status) && i.status.forEach(function(e) {
                    return o.orWhere("active", e);
                }), i.columns && o.columns.apply(o, r(i.columns)), o.then(function(e) {
                    return a(e);
                }).catch(function(e) {
                    return n(e);
                });
            });
        },
        getItem: function(e, t) {
            var r = this;
            return new Promise(function(i, n) {
                r.knex(e).where({
                    id: t
                }).select().then(function(e) {
                    return n(e[0]);
                }).catch(function(e) {
                    return i(e);
                });
            });
        },
        updateItem: function(e, t, r) {
            var i = this;
            return new Promise(function(n, a) {
                i.knex(e).where({
                    id: t
                }).update(r).then(function() {
                    return a(!0);
                }).catch(function(e) {
                    return n(e);
                });
            });
        },
        deleteItem: function(e, t) {
            var r = this, i = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
            return new Promise(function(n, a) {
                i ? r.knex(e).where({
                    id: t
                }).delete().then(function() {
                    return a(!0);
                }).catch(function(e) {
                    return n(e);
                }) : r.knex(e).where({
                    id: t
                }).update({
                    active: 0
                }).then(function() {
                    return a(!0);
                }).catch(function(e) {
                    return n(e);
                });
            });
        }
    };
}, function(e, t) {
    "use strict";
    e.exports = {
        createTable: function(e) {
            var t = this;
            return new Promise(function(r, i) {
                t.knex.schema.createTable(e, function(e) {
                    e.increments(), e.integer("active");
                }).then(function(e) {
                    return i(e);
                }).catch(function(e) {
                    return r(e);
                }), t.knex("directus_privileges").insert({
                    table_name: e,
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
        getTables: function() {
            var e = this;
            return new Promise(function(t, r) {
                e.knex.raw("SELECT * FROM information_schema").then(function(e) {
                    return r(e);
                }).catch(function(e) {
                    return t(e);
                });
            });
        }
    };
} ]);