(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.GitHubComment = Backbone.Model.extend({
    parse: function (response) {
      var thumbsup = response.some(function(comment) {
        var checkFor = ["👍", ":+1:", ":thumbsup:"];
        return checkFor.some(function(check) {
          return comment.body.indexOf(check) != -1;
        });
      });
      return {
        thumbsup: thumbsup,
        numComments: response.length
      };
    },
    fetch: function() {
      return FourthWall.overrideFetch.call(this, this.url);
    }
  });
}());
