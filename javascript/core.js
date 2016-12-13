(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};
  
  FourthWall.getQueryVariables = function(search) {
    search = search || FourthWall._getLocationSearch();
    return search
      .replace(/(^\?)/,'')
      .split("&")
      .reduce( function(params, n) {
        n = n.split("=");
        var arrayKey = /^(.*)\[\]$/.exec(n[0]);
        if (arrayKey) {
          if (params[arrayKey[1]] instanceof Array) {
            params[arrayKey[1]].push(n[1]);
          } else {
            params[arrayKey[1]] = [n[1]];
          }
        } else {
          params[n[0]] = n[1];
        }
        return params;
      }, {});
  };

  FourthWall.getQueryVariable = function (name, search) {
    return FourthWall.getQueryVariables(search)[name];
  };

  FourthWall._getLocationSearch = function() {
    return window.location.search;
  };

  FourthWall.buildQueryString = function(params) {
    var param_string = $.param(params);
    if(param_string.length > 0) {
      param_string = "?" + param_string;
    }
    return param_string;
  };

  FourthWall.getToken = function() {
    return FourthWall.getQueryVariable('token');
  };

  FourthWall.fetchDefer = function(options) {
    var d = $.Deferred();
    $.ajax({
      type: "GET",
      beforeSend: setupAuthentication(options.url),
      url: options.url,
      data: options.data
    }).done(function(result) {
      d.resolve(options.done(result));
    }).fail(d.reject);

    return d.promise();
  };

  FourthWall.overrideFetch = function(url) {
    return Backbone.Model.prototype.fetch.apply(this, [{
      beforeSend: setupAuthentication(url)
    }]);
  };

  var setupAuthentication = function (baseUrl) {
    return function(xhr) {
      var token = FourthWall.getToken();
      if (token !== false && token !== '') {
        xhr.setRequestHeader('Authorization', 'token ' + token);
        xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
      }
    };
  };

  // hack for SimpleHTTPServer appending a slash
  var stripSlash = function(string){
    if (string) {
      return string.replace(/\/$/, '');
    }
  };

  FourthWall.gistId = stripSlash(
    FourthWall.getQueryVariable('gist')
  );
})();
