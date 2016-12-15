(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.PullView = Backbone.View.extend({
    tagName: 'li',

    initialize: function () {
      this.model.on('change', this.render, this);
    },

    render: function () {
      this.$el.removeClass();

      if (!this.model.getAuthorName()) {
        // FIXME: Should never get here but does after master was
        // failing
        // ^ This comment was added for github api. I'm leaving
        // it for now because I don't understand it
        return;
      }

      this.$el.addClass(this.ageClass(this.model.get('elapsed_time')));

      var suffix = "";

      if (this.model.isMergeable()){
        var statusString = '<p class="status success">OK to merge</p>';
      } else if(this.model.isUnchecked()) {
        var statusString = '<p class="status">Status pending</p>';
      } else {
        var statusString = '<p class="status failure">Cannot merge</p>';
      }

      var commentCount = this.model.getCommentCount();

      var assignee = "";
      if (this.model.get('assignee')) {
        assignee = ' under review by ' + this.model.get('assignee').login;
        this.$el.addClass("under-review");
      }

      this.$el.html([
        '<img class="avatar" src="', this.model.getAuthorAvatar(), '" />',
        statusString,
        '<h2>', this.model.getRepoName(), '</h2>',
        '<div class="elapsed-time" data-created-at="',
        this.model.get('created_at'),
        '">',
        this.secondsToTime(this.model.get('elapsed_time')),
        '</div>',
        '<p><a href="', this.model.getWebUrl(), '">',
        '<span class="username">',this.model.getAuthorUsername(),'</span>',
        ': ',
        this.escape(this.model.get('title')),
        ' (#',
        this.model.getNumber(),
        ')',
        '</a>' + assignee + '</p>',
        '<p class="comments"> ' + commentCount + " comment" + suffix + '</p>',
      ].join(''));
    },

    escape: function (string) {
      return $('<div>').text(string).html();
    },

    ageClass: function (seconds) {
      var hours = 3600;
      if (seconds > (6 * hours)) {
        return "age-old";
      } else if (seconds > (2 * hours)) {
        return "age-aging";
      } else {
        return "age-fresh";
      }
    },

    secondsToTime: function (seconds) {
      var days    = Math.floor(seconds / 86400);
      var hours   = Math.floor((seconds - (days * 86400)) / 3600);
      var minutes = Math.floor((seconds - (days * 86400) - (hours * 3600)) / 60);

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (days == 1) {
        days = days + " day";
      } else if (days > 1) {
        days = days + " days";
      } else {
        days = "";
      }
      return days + ' ' + hours + 'h ' + minutes + 'm';
    }
  });

}());
