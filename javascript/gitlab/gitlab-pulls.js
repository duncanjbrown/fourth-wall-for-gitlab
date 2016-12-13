(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabPulls = Backbone.Collection.extend({

    model: FourthWall.GitLabPull,

    initialize: function (models, options) {
      this.baseUrl = options.baseUrl;
      this.repo = options.repo;
    },

    url: function () {
      return [
        this.baseUrl,
        this.repo,
        'merge_requests',
      ].join('/') + "?state=opened";
    },

    fetch: function() {
      return FourthWall.overrideFetch.call(this, this.baseUrl);
    }
  });
}());
