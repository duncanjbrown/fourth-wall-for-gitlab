(function() {
  "use strict"
  window.FourthWall = window.FourthWall || {};

  FourthWall.FetchRepos = {};

  var FetchRepos = FourthWall.FetchRepos;

  FourthWall.FetchRepos.fetchFromEverywhere = function () {
    var promises = [];

    if (FourthWall.gistId) {
      promises.push(fetchReposFromGist());
    }

    var d = $.Deferred();
    $.when.apply(null, promises).done(function() {
      var allRepos = [].reduce.call(arguments, FetchRepos.mergeRepoArrays, []);
      d.resolve(allRepos);
    });
    return d;
  };

  // exposed so that it can be tested
  FourthWall.FetchRepos.mergeRepoArrays = function(repos1, repos2) {
    var result = _.clone(repos1);
    if (repos2) {
      repos2.forEach(function(repo) {
        var found = result.some(function(testRepo) {
          return _.isEqual(
            { userName: repo.userName, repo: repo.repo, baseUrl: repo.baseUrl || FourthWall.getRepositoryEndpoint()},
            { userName: testRepo.userName, repo: testRepo.repo, baseUrl: testRepo.baseUrl || FourthWall.getRepositoryEndpoint()}
          );
        });
        if (!found) {
          result.push(repo);
        }
      });
    }
    return result;
  };

  var fetchReposFromGist = function () {
    return FourthWall.fetchDefer({
      url: "https://api.github.com/gists/" + FourthWall.gistId,
      done: function(result) {
        var repos = [];
        Object.keys(result.files).forEach(function(file) {
          var fileData = result.files[file],
              language = fileData.language;
          if ($.inArray(language, ['JavaScript', 'JSON', null]) !== -1) {
            repos = JSON.parse(fileData.content);
          } else if (language === "CSS") {
            var $custom_css = $('<style>');
            $custom_css.text( fileData.content );
            $('head').append( $custom_css );
          }
        });
        return repos;
      }
    });
  };
}());
