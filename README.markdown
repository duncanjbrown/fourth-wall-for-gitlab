# Fourth Wall for GitLab

### This is a fork of the excellent AlphaGov project Fourth Wall, ported to GitLab

It does not work with GitHub any more.

[![Build Status](https://travis-ci.org/alphagov/fourth-wall.png)](https://travis-ci.org/alphagov/fourth-wall)

Pure client-side pull request and build status monitor for GitLab repositories

![Screenshot of Fourth Wall](https://cloud.githubusercontent.com/assets/355033/6211416/6341db4e-b5d1-11e4-99d2-57b80a400a41.png)

## How to use

Clone the repository and start an HTTP server of your choice, for example

```
python -m SimpleHTTPServer
```

You will need:
 - The hostname of your GitLab instance
 - A personal access token (https://docs.gitlab.com/ee/api/README.html#personal-access-tokens)
 - A private Gist containing a list of repositories you are interested in

Open your browser and point it at the app, including the following two pieces of information and at least one of `gist` or `json`.

 - `token`: Your GitLab access token
 - `gitlab_host`: Your GitLab hostname

Visiting `/config.html` will allow you to set default values for `token` and `gitlab_host` in the browser's local storage.

Other optional query parameters:

 - `listinterval`: Update interval for the list of monitored repos in seconds (default: 900)
 - `interval`: Update interval for monitored repos in seconds (default: 60)
 - `filterusers`: Only show PRs from specific users, if set in config (default: false)
 - `gist`: the id of a gist containing one or more JSON files and at most one CSS file
 - _new_ `css`: include a CSS file from the named URL
 - _new_ `json`: read a list of repositories from a json file at the named URL

The original project included support for filtering by teams and users, and marking repos as important.

All of these features have been dropped.

JSON files should be provided in the following format:
```json
[
  {
    "userName": "<username of the repo owner>",
    "repo": "<repository name>"
  }
]
```

Note that JSON files included in Gists must have their language set to JSON or they will not be included.

Including a CSS file in a Gist, or placing the URL of one in the `css` parameter, will cause the styles to be injected
into a `<style>` block in the document head.

### Developing Fourth Wall for GitLab

This port is not backwards-compatible because the GitHub and GitLab APIs differ in subtle ways,
and I don't have the Backbone chops to make it all work together with adapters and abstractions
and things like that.

Things it would be nice to have

- a better test suite with end-to-end tests
- Update the specs to work with Jasmine 2.5 and phantomJS
- proper dependency management via `npm` or `yarn`
- deeper integration with the GitLab API around comments
