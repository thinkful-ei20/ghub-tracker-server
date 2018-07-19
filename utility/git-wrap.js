'use strict';

const octokit = require('@octokit/rest')({
  debug: true
})

class GitWrap {
  static getUserRepos(username) {
    return octokit.repos.getForUser({ username });
  }

  static getUserRepoCommits(owner, repo) {
    console.log('Owner: ', owner);
    console.log('Repo: ', repo);
    return octokit.repos.getCommits({ owner, repo })
  }
}

module.exports = GitWrap;
