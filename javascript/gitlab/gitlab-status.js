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
        this.get('repo'),
        'repository',
        'commits',
        this.get('sha')
      ].join('/');
    },

    fetch: function() {
      return FourthWall.overrideFetch.call(this, this.get('baseUrl'));
    },

    parse: function (response) {
      if(!response) {
        return;
      }
      response.created_at = moment(response.created_at);
      response.failed = response.status !== 'success' && response.status !== 'pending' && response.status !== 'running';
      return response;
    }
  });
}());
