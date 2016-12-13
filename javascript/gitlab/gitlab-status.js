(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitLabStatus = Backbone.Model.extend({

    initialize: function () {
      this.on('change:buildId', function () {
        this.fetch();
      }, this);
    },

    url: function () {
      return [
        this.get('baseUrl'),
        this.get('projectId'),
        'builds',
        this.get('buildId')
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
