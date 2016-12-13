(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabPulls = Backbone.Collection.extend({

    model: FourthWall.GitLabPull,

    initialize: function (models, options) {
      this.baseUrl = options.baseUrl;
      this.projectId = options.projectId;
    },

    url: function () {
      return [
        this.baseUrl,
        'projects',
        this.projectId,
        'merge_requests',
      ].join('/') + "?state=opened";
    },

    fetch: function() {
      return FourthWall.overrideFetch.call(this, this.baseUrl);
    }
  });
}());
