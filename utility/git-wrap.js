'use strict';

const octokit = require('@octokit/rest')({
  debug: true
})

octokit.authenticate({
  type: 'token',
  token: '7a1a7da7008ff8968c34498b1142553d7d5065ef'
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
