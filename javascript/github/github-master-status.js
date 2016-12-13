(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitHubMasterStatus = FourthWall.GitHubStatus.extend({
    url: function () {
      return [
        this.get('baseUrl'),
        this.get('userName'),
        this.get('repo'),
        'statuses',
        'master'
      ].join('/');
    }
  });
}());
