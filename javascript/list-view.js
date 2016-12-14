(function () {
  "use strict";
  window.FourthWall = window.FourthWall || {};

  FourthWall.ListView = Backbone.View.extend({
    initialize: function () {
      this.collection.on('sort reset add remove', this.render, this);
    },

    render: function () {
      this.$el.empty();
      this.lis = [];
      this.collection.each(function (model) {
        var View;
        if (model.get('master')) {
          View = FourthWall.MasterView;
        } else if (model instanceof FourthWall.GitLabPull) {
          View = FourthWall.PullView;
        }
        if (!View) {
          return;
        }

        var view = new View({
          model: model,
          list: this
        });
        view.render();
        view.$el.appendTo(this.$el);
        this.lis.push(view);
      }, this);
      if (this.lis.length) {
        $('#all-quiet').hide();
      } else {
        $('#all-quiet').show();
      }
    }
  });
}());
