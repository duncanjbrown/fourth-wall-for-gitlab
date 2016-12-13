(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitHubStatus = Backbone.Model.extend({

    initialize: function () {
      this.on('change:sha', function () {
        this.fetch();
      }, this);
    },

    url: function () {
      return [
        this.get('baseUrl'),
        this.get('userName'),
        this.get('repo'),
        'statuses',
        this.get('sha')
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
      data.failed = data.state !== 'success' && data.state !== 'pending';
      return data;
    }
  });
}());
