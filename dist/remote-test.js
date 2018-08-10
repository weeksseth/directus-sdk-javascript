"use strict";
var _createClass = (function() {
  function a(b, c) {
    for (var e, d = 0; d < c.length; d++)
      (e = c[d]),
        (e.enumerable = e.enumerable || !1),
        (e.configurable = !0),
        "value" in e && (e.writable = !0),
        Object.defineProperty(b, e.key, e);
  }
  return function(b, c, d) {
    return c && a(b.prototype, c), d && a(b, d), b;
  };
})();
function _classCallCheck(a, b) {
  if (!(a instanceof b))
    throw new TypeError("Cannot call a class as a function");
}
var axios = require("axios"),
  qs = require("qs"),
  RemoteInstance = (function() {
    function a(b) {
      _classCallCheck(this, a);
      var c = b.accessToken,
        d = b.url,
        e = b.headers,
        f = b.accessTokenType,
        g = b.version;
      if (
        ((this.accessTokenType = f || "header"),
        (this.accessToken = c),
        (this.headers = e || {}),
        (this.version = g || "1.1"),
        !d)
      )
        throw new Error("No Directus URL provided");
      var h = d.replace("/api/1.1", "");
      (this.base = h.replace(/\/+$/, "")),
        (this.api = this.base + "/api/"),
        (this.url = this.api + this.version + "/");
    }
    return (
      _createClass(a, [
        {
          key: "_onCaughtError",
          value: function _onCaughtError(b, c, d) {
            return d.response && d.response.data ? c(d.response.data) : c(d);
          }
        },
        {
          key: "_get",
          value: function _get(b) {
            var g = this,
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              d =
                2 < arguments.length && void 0 !== arguments[2] && arguments[2],
              e = this._requestHeaders,
              f = d ? this.api : this.url;
            return (
              this.setAccessTokenParam(c),
              new Promise(function(h, j) {
                axios
                  .get(f + b, {
                    params: c,
                    headers: e,
                    paramsSerializer: function paramsSerializer(k) {
                      return qs.stringify(k, {
                        arrayFormat: "brackets",
                        encode: !1
                      });
                    }
                  })
                  .then(function(k) {
                    return h(k.data);
                  })
                  .catch(function(k) {
                    return g._onCaughtError(h, j, k);
                  });
              })
            );
          }
        },
        {
          key: "_post",
          value: function _post(b) {
            var c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              h = this,
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : {},
              e =
                3 < arguments.length && void 0 !== arguments[3] && arguments[3],
              f = this._requestHeaders,
              g = e ? this.api : this.url;
            return (
              this.setAccessTokenParam(d),
              new Promise(function(j, k) {
                axios
                  .post(g + b, c, { headers: f, params: d })
                  .then(function(l) {
                    return j(l.data);
                  })
                  .catch(function(l) {
                    return h._onCaughtError(j, k, l);
                  });
              })
            );
          }
        },
        {
          key: "_put",
          value: function _put(b) {
            var c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              h = this,
              d =
                2 < arguments.length && void 0 !== arguments[2] && arguments[2],
              e =
                3 < arguments.length && void 0 !== arguments[3]
                  ? arguments[3]
                  : {},
              f = this._requestHeaders,
              g = d ? this.api : this.url;
            return (
              this.setAccessTokenParam(e),
              new Promise(function(j, k) {
                axios
                  .put(g + b, c, { headers: f, params: e })
                  .then(function(l) {
                    return j(l.data);
                  })
                  .catch(function(l) {
                    return h._onCaughtError(j, k, l);
                  });
              })
            );
          }
        },
        {
          key: "_delete",
          value: function _delete(b) {
            var c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              h = this,
              d =
                2 < arguments.length && void 0 !== arguments[2] && arguments[2],
              e =
                3 < arguments.length && void 0 !== arguments[3]
                  ? arguments[3]
                  : {},
              f = this._requestHeaders,
              g = d ? this.api : this.url;
            return (
              this.setAccessTokenParam(e),
              new Promise(function(j, k) {
                axios
                  .delete(g + b, { headers: f, data: c, params: e })
                  .then(function(l) {
                    return j(l.data);
                  })
                  .catch(function(l) {
                    return h._onCaughtError(j, k, l);
                  });
              })
            );
          }
        },
        {
          key: "authenticate",
          value: function authenticate() {
            var d = this,
              b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("email"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("password");
            return new Promise(function(e, f) {
              d._post("auth/request-token", { email: b, password: c })
                .then(function(g) {
                  return g.success
                    ? ((d.accessToken = g.data.token), e(g))
                    : f(g);
                })
                .catch(function(g) {
                  return f(g);
                });
            });
          }
        },
        {
          key: "deauthenticate",
          value: function deauthenticate() {
            this.accessToken = null;
          }
        },
        {
          key: "createItem",
          value: function createItem() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : {};
            return this._post("tables/" + b + "/rows", c, d);
          }
        },
        {
          key: "getItems",
          value: function getItems() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._get("tables/" + b + "/rows", c);
          }
        },
        {
          key: "getItem",
          value: function getItem() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("id"),
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : {};
            return this._get("tables/" + b + "/rows/" + c, d);
          }
        },
        {
          key: "updateItem",
          value: function updateItem() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("id"),
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : requiredParam("data"),
              e =
                3 < arguments.length && void 0 !== arguments[3]
                  ? arguments[3]
                  : {};
            return this._put("tables/" + b + "/rows/" + c, d, e);
          }
        },
        {
          key: "deleteItem",
          value: function deleteItem() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("id"),
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : {};
            return this._delete("tables/" + b + "/rows/" + c, {}, d);
          }
        },
        {
          key: "createBulk",
          value: function createBulk() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            if (!1 === Array.isArray(c))
              throw new TypeError(
                "Parameter data should be an array of objects"
              );
            return this._post("tables/" + b + "/rows/bulk", { rows: c });
          }
        },
        {
          key: "updateBulk",
          value: function updateBulk() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            if (!1 === Array.isArray(c))
              throw new TypeError(
                "Parameter data should be an array of objects"
              );
            return this._put("tables/" + b + "/rows/bulk", { rows: c });
          }
        },
        {
          key: "deleteBulk",
          value: function deleteBulk() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            if (!1 === Array.isArray(c))
              throw new TypeError(
                "Parameter data should be an array of objects"
              );
            return this._delete("tables/" + b + "/rows/bulk", { rows: c });
          }
        },
        {
          key: "createFile",
          value: function createFile() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._post("files", b);
          }
        },
        {
          key: "getFiles",
          value: function getFiles() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._get("files", b);
          }
        },
        {
          key: "getFile",
          value: function getFile() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._get("files/" + b);
          }
        },
        {
          key: "updateFile",
          value: function updateFile() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("id"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            return this._put("files/" + b, c);
          }
        },
        {
          key: "deleteFile",
          value: function deleteFile() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._delete("files/" + b);
          }
        },
        {
          key: "createTable",
          value: function createTable() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("name");
            return this._post("tables", { name: b });
          }
        },
        {
          key: "getTables",
          value: function getTables() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._get("tables", b);
          }
        },
        {
          key: "getTable",
          value: function getTable() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._get("tables/" + b, c);
          }
        },
        {
          key: "createColumn",
          value: function createColumn() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._post("tables/" + b + "/columns", c);
          }
        },
        {
          key: "getColumns",
          value: function getColumns() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._get("tables/" + b + "/columns", c);
          }
        },
        {
          key: "getColumn",
          value: function getColumn() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("column");
            return this._get("tables/" + b + "/columns/" + c);
          }
        },
        {
          key: "updateColumn",
          value: function updateColumn() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("column"),
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : {};
            return this._put("tables/" + b + "/columns/" + c, d);
          }
        },
        {
          key: "deleteColumn",
          value: function deleteColumn() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("column");
            return this._delete("tables/" + b + "/columns/" + c);
          }
        },
        {
          key: "createGroup",
          value: function createGroup() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("name");
            return this._post("groups", { name: b });
          }
        },
        {
          key: "getGroups",
          value: function getGroups() {
            return this._get("groups");
          }
        },
        {
          key: "getGroup",
          value: function getGroup() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._get("groups/" + b);
          }
        },
        {
          key: "createPrivileges",
          value: function createPrivileges() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("id"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._post("privileges/" + b, c);
          }
        },
        {
          key: "getPrivileges",
          value: function getPrivileges() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._get("privileges/" + b);
          }
        },
        {
          key: "getTablePrivileges",
          value: function getTablePrivileges() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("id"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("table");
            return this._get("privileges/" + b + "/" + c);
          }
        },
        {
          key: "updatePrivileges",
          value: function updatePrivileges() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("id"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("table");
            return this._get("privileges/" + b + "/" + c);
          }
        },
        {
          key: "getPreferences",
          value: function getPreferences() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("table");
            return this._get("tables/" + b + "/preferences");
          }
        },
        {
          key: "updatePreference",
          value: function updatePreference() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("table"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._update("tables/" + b + "/preferences", c);
          }
        },
        {
          key: "getMessages",
          value: function getMessages() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._get("messages/rows", b);
          }
        },
        {
          key: "getMessage",
          value: function getMessage() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._get("messages/rows/" + b);
          }
        },
        {
          key: "sendMessage",
          value: function sendMessage() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("data");
            return this._post("messages/rows/", b);
          }
        },
        {
          key: "getActivity",
          value: function getActivity() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._get("activity", b);
          }
        },
        {
          key: "getBookmarks",
          value: function getBookmarks() {
            return this._get("bookmarks");
          }
        },
        {
          key: "getUserBookmarks",
          value: function getUserBookmarks() {
            return this._get("bookmarks/self");
          }
        },
        {
          key: "getBookmark",
          value: function getBookmark() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._get("bookmarks/" + b);
          }
        },
        {
          key: "createBookmark",
          value: function createBookmark() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("data");
            return this._post("bookmarks", b);
          }
        },
        {
          key: "deleteBookmark",
          value: function deleteBookmark() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._delete("bookmarks/" + b);
          }
        },
        {
          key: "getSettings",
          value: function getSettings() {
            return this._get("settings");
          }
        },
        {
          key: "getSettingsByCollection",
          value: function getSettingsByCollection() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("name");
            return this._get("settings/" + b);
          }
        },
        {
          key: "updateSettings",
          value: function updateSettings() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("name"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._put("settings/" + b, c);
          }
        },
        {
          key: "getUsers",
          value: function getUsers() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._get("users", b);
          }
        },
        {
          key: "getUser",
          value: function getUser() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("id");
            return this._get("users/" + b);
          }
        },
        {
          key: "getMe",
          value: function getMe() {
            return this._get("users/me");
          }
        },
        {
          key: "createUser",
          value: function createUser() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("user");
            return this._post("users", b);
          }
        },
        {
          key: "updateUser",
          value: function updateUser() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("id"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            return this._put("users/" + b, c);
          }
        },
        {
          key: "updateMe",
          value: function updateMe() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("data");
            return this._put("users/me", b);
          }
        },
        {
          key: "updatePassword",
          value: function updatePassword() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : requiredParam("password");
            return this._put("users/me", { password: b });
          }
        },
        {
          key: "getApi",
          value: function getApi() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("api_endpoint"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._get(b, c, !0);
          }
        },
        {
          key: "postApi",
          value: function postApi() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("api_endpoint"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data"),
              d =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : {};
            return this._post(b, c, d, !0);
          }
        },
        {
          key: "putApi",
          value: function putApi() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("api_endpoint"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            return this._put(b, c, !0);
          }
        },
        {
          key: "deleteApi",
          value: function deleteApi() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("api_endpoint"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : requiredParam("data");
            return this._delete(b, c, !0);
          }
        },
        {
          key: "getHash",
          value: function getHash() {
            var b =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : requiredParam("string"),
              c =
                1 < arguments.length && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            return this._post("hash", c);
          }
        },
        {
          key: "getRandom",
          value: function getRandom() {
            var b =
              0 < arguments.length && void 0 !== arguments[0]
                ? arguments[0]
                : {};
            return this._post("random", {}, b);
          }
        },
        {
          key: "setAccessTokenParam",
          value: function setAccessTokenParam(b) {
            this.accessToken &&
              "parameter" === this.accessTokenType &&
              (b.access_token = this.accessToken);
          }
        },
        {
          key: "_requestHeaders",
          get: function get() {
            var b = Object.assign({}, this.headers);
            return (
              this.accessToken &&
                "header" === this.accessTokenType &&
                (b.Authorization = "Bearer " + this.accessToken),
              b
            );
          }
        }
      ]),
      a
    );
  })();
function requiredParam(a) {
  throw new Error("Missing parameter [" + a + "]");
}
module.exports = RemoteInstance;
