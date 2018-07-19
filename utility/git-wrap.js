'use strict';

const octokit = require('@octokit/rest')({
  debug: true
})

octokit.authenticate({
  type: 'token',
  token: 'b9e8375f0955ad1c43dfb367592de7f5d9618877'
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
