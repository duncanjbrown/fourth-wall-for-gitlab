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
        projectId: this.get('projectId'),
        sha: 'master'
      });

      this.master.on('change:failed', function () {
        this.trigger('change');
      }, this);
      //
      // this.pulls = new FourthWall.GitHubPulls([], {
      //   baseUrl: this.get('baseUrl'),
      //   userName: this.get('userName'),
      //   repo: this.get('repo'),
      //   important: this.get('important')
      // });
      //
      // this.pulls.on('reset add remove', function () {
      //   this.trigger('change');
      // }, this);
    },

    fetch: function () {
      // this.pulls.fetch();
      this.master.fetch();
    }

  });
}());
