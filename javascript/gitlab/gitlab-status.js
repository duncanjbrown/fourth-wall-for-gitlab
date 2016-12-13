(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabStatus = Backbone.Model.extend({

    initialize: function () {
      this.on('change:sha', function () {
        this.fetch();
      }, this);
    },

    url: function () {
      return [
        this.get('baseUrl'),
        'projects',
        this.get('projectId'),
        'repository',
        'commits',
        this.get('sha'),
        'builds'
      ].join('/');
    },

    fetch: function() {
      return FourthWall.overrideFetch.call(this, this.get('baseUrl'));
    },

    parse: function (response) {
      if (!response.length) {
        return;
      }
      var data = response[0];
      data.created_at = moment(data.created_at);
      data.failed = data.status !== 'success' && data.status !== 'pending' && data.status !== 'running';
      return data;
    }
  });
}());
