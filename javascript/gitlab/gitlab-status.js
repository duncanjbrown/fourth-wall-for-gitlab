(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabStatus = Backbone.Model.extend({

    initialize: function () {
      this.on('change:sha', function () {
        this.fetch();
      }, this);
      if(this.get('inspect')) {
        window.x = this;
      }
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
      response.failed = response.state && response.state !== 'success' && response.state !== 'pending' && response.state !== 'running';
      response.master = ('master' === this.get('sha'));
      return response;
    },

    isMaster: function() {
      return this.get('master');
    },

    getRepoName: function() {
      return decodeURIComponent(this.get('repo'));
    }
  });
}());
