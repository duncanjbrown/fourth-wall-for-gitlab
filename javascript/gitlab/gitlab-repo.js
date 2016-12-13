(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabRepo = Backbone.Model.extend({
    defaults: {
      'baseUrl': FourthWall.getRepositoryEndpoint()
    },

    initialize: function () {
      this.master = new FourthWall.GitLabStatus({
        baseUrl: this.get('baseUrl'),
        repo: this.get('repo'),
        sha: 'master'
      });

      this.master.on('change:failed', function () {
        this.trigger('change');
      }, this);

      this.pulls = new FourthWall.GitLabPulls([], {
        baseUrl: this.get('baseUrl'),
        repo: this.get('repo')
      });

      this.pulls.on('reset add remove', function () {
        this.trigger('change');
      }, this);
    },

    fetch: function () {
      this.pulls.fetch();
      this.master.fetch();
    }

  });
}());
