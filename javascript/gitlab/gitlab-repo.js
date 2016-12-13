(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabRepo = Backbone.Model.extend({
    defaults: {
      'baseUrl': FourthWall.getRepositoryEndpoint()
    },

    initialize: function () {
      var repoIdentifier = this.get('userName') + '%2F' + this.get('repo');
      this.master = new FourthWall.GitLabStatus({
        baseUrl: this.get('baseUrl'),
        repo: repoIdentifier,
        sha: 'master'
      });

      this.master.on('change:failed', function () {
        this.trigger('change');
      }, this);

      this.pulls = new FourthWall.GitLabPulls([], {
        baseUrl: this.get('baseUrl'),
        repo: repoIdentifier,
      });

      this.pulls.on('reset add remove', function () {
        this.trigger('change');
      }, this);
    },

    fetch: function () {
      this.pulls.fetch();
      this.master.fetch();
    },

  });
}());
