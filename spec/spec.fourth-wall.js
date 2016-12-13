function setupMoment(date, anObject) {
  spyOn(anObject, "moment");
  anObject.moment.plan = function () {
    var realMoment = anObject.moment.originalValue;
    // set "now" to a fixed date to enable static expectations
    if (!arguments.length) {
      return realMoment(date);
    }
    return realMoment.apply(null, arguments);
  }
}

describe("Fourth Wall", function () {

  describe("getQueryVariables", function () {
    it("should convert a query string into a params object", function () {
      var query_params = FourthWall.getQueryVariables("?ref=gh-pages&token=nonsense");
      expect(query_params).toEqual({'ref': 'gh-pages', 'token': 'nonsense'});
    });
    it("should return current location params object if no query string is provided", function() {
      spyOn(FourthWall, '_getLocationSearch').andReturn('?foo=bar&me=you');
      var query_params = FourthWall.getQueryVariables();
      expect(query_params).toEqual({foo: 'bar', me: 'you'});
    });
    it("should handle array parameters with [] keys", function () {
      var query_params = FourthWall.getQueryVariables("?ref=gh-pages&token[]=nonsense&token[]=foo");
      expect(query_params).toEqual({'ref': 'gh-pages', 'token': ['nonsense', 'foo']});
    });
  });
  describe("getQueryVariable", function () {
    it("should get a query parameter from the provided query string", function () {
      spyOn(FourthWall, '_getLocationSearch').andReturn('?foo=bar');
      var value = FourthWall.getQueryVariable('foo', '?foo=everything');
      expect(value).toEqual('everything');
    });
    it("should get a query parameter from the current location", function () {
      spyOn(FourthWall, '_getLocationSearch').andReturn('?foo=bar');
      var value = FourthWall.getQueryVariable('foo');
      expect(value).toEqual('bar');
    });
  });
  describe("buildQueryString", function () {
    it("should convert a query string into a params object", function () {
      var query_string = FourthWall.buildQueryString({'ref': 'gh-pages', 'token': 'nonsense'});
      expect(query_string).toEqual("?ref=gh-pages&token=nonsense");
    });
    it("should handle an empty object", function () {
      var query_string = FourthWall.buildQueryString({});
      expect(query_string).toEqual("");
    });
  });

  describe("getGitLabApiUrl", function () {
    beforeEach(function() {
      spyOn(FourthWall, '_getLocationSearch').andReturn('?gitlab_host=my.gitlab.server');
    });
    it('returns the token param from the query string', function() {
      expect(FourthWall.getGitLabApiUrl()).toEqual("https://my.gitlab.server/api/v3");
    });
  });

  describe("getToken", function () {
    beforeEach(function() {
      spyOn(FourthWall, '_getLocationSearch').andReturn('?token=foo');
    });
    it('returns the token param from the query string', function() {
      expect(FourthWall.getToken()).toEqual("foo");
    });
  });

  describe("FetchRepos", function () {
    beforeEach(function() {
      spyOn(FourthWall, 'getRepositoryEndpoint').andReturn('https://foo.bar');
    });
    describe("mergeRepoArrays", function () {
      it("should merge two repo arrays", function () {
        var repos1 = [{userName: "example", repo: "example"}],
            repos2 = [{userName: "example", repo: "another"}];

        var result = FourthWall.FetchRepos.mergeRepoArrays(repos1, repos2);

        var expected = [
          {userName: "example", repo: "example"},
          {userName: "example", repo: "another"},
        ];
        expect(_.isEqual(result, expected)).toEqual(true);
      });

      it("should not duplicate repos", function () {
        var repos1 = [{userName: "example", repo: "example"}],
            repos2 = [{userName: "example", repo: "example"}];

        var result = FourthWall.FetchRepos.mergeRepoArrays(repos1, repos2);

        var expected = [
          {userName: "example", repo: "example"},
        ];
        expect(_.isEqual(result, expected)).toEqual(true);
      });
    });
  });

  describe("Repos", function () {
    describe("schedule", function () {

      var repos;
      beforeEach(function() {
        spyOn(FourthWall, "getQueryVariable");
        spyOn(window, "setInterval");
        spyOn(FourthWall.Repos.prototype, "fetch");
        spyOn(FourthWall.Repos.prototype, "updateList");
        repos = new FourthWall.Repos();
      });

      it("updates the repo list every 15 minutes by default", function () {
        repos.schedule();
        expect(repos.updateList.callCount).toEqual(1);
        expect(setInterval.argsForCall[0][1]).toEqual(900000);
        var callback = setInterval.argsForCall[0][0];
        callback();
        expect(repos.updateList.callCount).toEqual(2);
      });

      it("updates the repo list at a configurable interval", function () {
        FourthWall.getQueryVariable.andReturn(120);
        repos.schedule();
        expect(setInterval.argsForCall[0][1]).toEqual(120000);
        var callback = setInterval.argsForCall[0][0];
        callback();
        expect(repos.updateList).toHaveBeenCalled();
      });

      it("updates the status every 60 seconds by default", function () {
        repos.schedule();
        expect(setInterval.argsForCall[1][1]).toEqual(60000);
        var callback = setInterval.argsForCall[1][0];
        callback();
        expect(repos.fetch).toHaveBeenCalled();
      });

      it("updates the status at a configurable interval", function () {
        FourthWall.getQueryVariable.andReturn(10);
        repos.schedule();
        expect(setInterval.argsForCall[1][1]).toEqual(10000);
        var callback = setInterval.argsForCall[1][0];
        callback();
        expect(repos.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Repo", function () {
    describe("initialize", function () {
      it("instantiates an internal Master model", function () {
        var repo = new FourthWall.GitHubRepo();
        expect(repo.master instanceof FourthWall.GitHubMasterStatus).toBe(true);
      });

      it("instantiates an internal list of pull requests", function () {
        var repo = new FourthWall.GitHubRepo();
        expect(repo.pulls instanceof FourthWall.GitHubPulls).toBe(true);
      });

      it("triggers a change when the master status changes", function () {
        var repo = new FourthWall.GitHubRepo();
        var changed = false;
        repo.on('change', function () {
          changed = true;
        });
        repo.master.set('failed', 'true');
        expect(changed).toBe(true);
      });

    });

    describe("fetch", function () {
      it("fetches new master and pulls data", function () {
        spyOn(FourthWall.GitHubMasterStatus.prototype, "fetch");
        spyOn(FourthWall.GitHubPulls.prototype, "fetch");
        var repo = new FourthWall.GitHubRepo();
        repo.fetch();
        expect(repo.master.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("GitLabRepo", function() {
    it("behaves just like a GitHubRepo in all other respects", function() {});
  });

  describe("GitLabPulls", function () {
    describe("fetch", function () {
      it("calls out to the appropriate URL", function () {
        var pulls = new FourthWall.GitLabPulls([], {
          repo: 'dxw/my-repo',
          baseUrl: 'https://my.gitlab.com/api/v3/projects'
        });
        expect(pulls.url()).toBe('https://my.gitlab.com/api/v3/projects/dxw/my-repo/merge_requests?state=opened')
      });
    });
  });

  describe("GitLabPull", function() {
    xdescribe("callbacks", function() {
      it("behaves just like a GitHubPull", function() {});
    });

    describe("getAuthor*", function() {
      it("returns the author name", function() {
        TODO
      });
      it("returns the author avatar", function() {
        TODO
      });
    });
  });

  describe("GitLabStatus", function () {
    describe("fetch", function () {
      it("calls out to the appropriate URL", function () {
        var status = new FourthWall.GitLabStatus({
          baseUrl: 'https://my.gitlab.com/api/v3/projects',
          sha: 'abc123',
          repo: 'dxw/my-repo'
        });
        expect(status.url()).toBe('https://my.gitlab.com/api/v3/projects/dxw/my-repo/repository/commits/abc123');
      });
    });

    describe('getRepoName', function() {
      it('returns the name formatted user/repo', function() {
        var status = new FourthWall.GitLabStatus({
          repo: 'dxw%2Fmy-repo'
        });
        expect(status.getRepoName()).toBe('dxw/my-repo');
      });
    });

    describe("parse", function() {
      it("marks anything but success, pending and running as failure", function() {
        var status = new FourthWall.GitLabStatus();
        var parsed = status.parse({status: 'nonsense'});
        expect(parsed.failed).toBe(true);
      });
    });

  });

  describe("GitHubPull", function () {
    describe("initialize", function () {

      var pull;
      beforeEach(function() {
        spyOn(FourthWall.GitHubComment.prototype, "fetch");
        spyOn(FourthWall.GitHubStatus.prototype, "fetch");
        spyOn(FourthWall.GitHubInfo.prototype, "fetch");
        pull = new FourthWall.GitHubPull({
          head: {sha: 'foo'}
        }, {
          collection: {}
        });
      });

      it("instantiates an internal Comment model", function () {
        expect(pull.comment instanceof FourthWall.GitHubComment).toBe(true);
      });

      it("triggers a change when the comment changes", function () {
        var changed = false;
        pull.on('change', function () {
          changed = true;
        });
        pull.comment.set('foo', 'bar');
        expect(changed).toBe(true);
      });

      it("fetches new comment data when the comment URL changes", function () {
        pull.set('comments_url', 'foo');
        expect(pull.comment.url).toEqual('foo');
        expect(pull.comment.fetch).toHaveBeenCalled();
      });

      it("fetches new comment data when pull data has been fetched", function () {
        pull.fetch()
        expect(pull.comment.fetch).toHaveBeenCalled();
      });

      it("instantiates an internal Status model", function () {
        expect(pull.status instanceof FourthWall.GitHubStatus).toBe(true);
      });

      it("fetches new status data when the head changes", function () {
        pull.set('head', 'foo');
        expect(pull.status.fetch).toHaveBeenCalled();
      });

      it("triggers a change when the status changes", function () {
        var changed = false;
        pull.on('change', function () {
          changed = true;
        });
        pull.status.set('foo', 'bar');
        expect(changed).toBe(true);
      });
      it("instantiates an internal Info model", function () {
        expect(pull.info instanceof FourthWall.GitHubInfo).toBe(true);
      });

      it("fetches new info data when the head changes", function () {
        pull.set('head', 'foo');
        expect(pull.info.fetch).toHaveBeenCalled();
      });

      it("triggers a change when the info changes", function () {
        var changed = false;
        pull.on('change', function () {
          changed = true;
        });
        pull.info.set('foo', 'bar');
        expect(changed).toBe(true);
      });
    });

    describe("getAuthor*", function() {
      it("returns the author name", function() {
        TODO
      });
      it("returns the author avatar", function() {
        TODO
      });
    });

    describe("parse", function () {
      it("calculates seconds since pull request creation date", function () {
        spyOn(FourthWall.GitHubPull.prototype, "elapsedSeconds").andReturn(60);
        spyOn(FourthWall.GitHubComment.prototype, "fetch");
        spyOn(FourthWall.GitHubStatus.prototype, "fetch");
        var pull = new FourthWall.GitHubPull({
          head: {sha: 'foo'}
        }, {
          collection: {}
        });
        var result = pull.parse({ created_at: "2013-09-02T10:00:00+01:00" });
        expect(pull.elapsedSeconds).toHaveBeenCalledWith("2013-09-02T10:00:00+01:00");
        expect(result.elapsed_time).toEqual(60);
      });
    });

    describe("elapsedSeconds", function () {
      it("calculates seconds since creation date", function () {
        setupMoment("2013-09-09T10:01:00+01:00", window)
        spyOn(FourthWall.GitHubComment.prototype, "fetch");
        spyOn(FourthWall.GitHubStatus.prototype, "fetch");
        var pull = new FourthWall.GitHubPull({
          head: {sha: 'foo'}
        }, {
          collection: {}
        });
        var result = pull.parse({ created_at: "2013-09-02T10:00:00+01:00" });
        var fullDay = 24 * 60 * 60;
        var expected = 7 * fullDay + 60;

        expect(result.elapsed_time).toBe(expected);
      });
    });
  });

  describe("Pulls", function () {
    describe("url", function () {
      it("constructs a URL from user name and repo name", function () {
        var pulls = new FourthWall.GitHubPulls([], {
          baseUrl: 'https://api.base.url/repos',
          userName: 'foo',
          repo: 'bar'
        });
        expect(pulls.url()).toEqual('https://api.base.url/repos/foo/bar/pulls');
      });
    });
  });

  describe("ListItems", function () {
    describe("fetch", function () {
      it("collects open pull requests from repos", function () {
        var repo = new FourthWall.GitHubRepo({
          userName: 'foo',
          repo: 'bar'
        });
        repo.pulls.reset();
        var items = new FourthWall.ListItems([], {
          repos: new FourthWall.Repos([
            
          ])
        });
      });
    });
  });

  describe("Status", function () {
    describe("parse", function () {
      it("does nothing when there are no statuses", function () {
        expect(FourthWall.GitHubStatus.prototype.parse([])).toBeFalsy();
      });

      it("marks as failed when the latest status is not success and not pending", function () {
        var res = FourthWall.GitHubStatus.prototype.parse([
          { state: 'error' }
        ]);
        expect(res.failed).toBeTruthy();
      });

      it("doesn't mark as failed when the latest status is success or pending", function () {
        var res = FourthWall.GitHubStatus.prototype.parse([
          { state: 'pending' }
        ]);
        expect(res.failed).toBeFalsy();

        res = FourthWall.GitHubStatus.prototype.parse([
          { state: 'success' }
        ]);
        expect(res.failed).toBeFalsy();
      });

      it("doesn't mark as failed when a previous status failed", function () {
        var res = FourthWall.GitHubStatus.prototype.parse([
          { state: 'pending' },
          { state: 'error' }
        ]);
        expect(res.failed).toBeFalsy();
      });
    });
  });
});
