(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitHubRepo = Backbone.Model.extend({
    defaults: {
      'baseUrl': 'https://api.github.com/repos'
    },

    initialize: function () {
      this.master = new FourthWall.GitHubMasterStatus({
        baseUrl: this.get('baseUrl'),
        userName: this.get('userName'),
        repo: this.get('repo')
      });

      this.master.on('change:failed', function () {
        this.trigger('change');
      }, this);

      this.pulls = new FourthWall.GitHubPulls([], {
        baseUrl: this.get('baseUrl'),
        projectId: this.get('projectId')
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
