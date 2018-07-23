'use strict';

const octokit = require('@octokit/rest')({
  debug: true
})

octokit.authenticate({
  type: 'token',
  token: 'a71b80555f6227b9892e871ea630243e3b1f60da'
})


class GitWrap {
  static getUserRepos(username) {
    return octokit.repos.getForUser({ username });
  }

  static getUserRepoCommits(owner, repo) {
    return octokit.repos.getCommits({ owner, repo })
  }
}

module.exports = GitWrap;
