# Collaborator Guide

**Contents**

- [Issues and Pull Requests](#issues-and-pull-requests)
- [Accepting Modifications](#accepting-modifications)
  - [Involving the PO/TC](#involving-the-potc)
- [Landing Pull Requests](#landing-pull-requests)
  - [Summarized Technical HOWTO](#summarized-technical-howto)
  - [Detailed Technical HOWTO](#detailed-technical-howto)
  - [I've made a huge mistake](#ive-made-a-huge-mistake)
- [Creating a Release](#creating-a-release)

This document contains information for Collaborators of this project regarding
maintaining the code, documentation and issues.  This is almost exactly the same
as the [Node.js Collaborator Guide](https://github.com/nodejs/node/blob/master/COLLABORATOR_GUIDE.md)
with changes to better fit our needs.

Collaborators should be familiar with the guidelines for new contributors in
[CONTRIBUTING.md](./CONTRIBUTING.md) and also understand the project governance
model as outlined in [GOVERNANCE.md](./GOVERNANCE.md).

Collaborators are users with write access to this repository and work directly
in the main repository.  Collaborators are responsible for merging in pull
requests and making releases.

Contributors are users with read access to this repository and work in their
individual forks of the main repository.


## Issues and Pull Requests

Courtesy should always be shown to individuals submitting issues and pull
requests to this project.

Collaborators should feel free to take full responsibility for managing issues
and pull requests they feel qualified to handle, as long as this is done while
being mindful of these guidelines, the opinions of other Collaborators and
guidance of the PO or TC as defined by the Governance model.

Collaborators may **close** any issue or pull request they believe is not
relevant for the future of this project.  Where this is unclear, the issue
should be left open for several days to allow for additional discussion.  Where
this does not yield input from project Collaborators or additional evidence that
the issue has relevance, the issue may be closed.  Remember that issues can
always be re-opened if necessary.


## Accepting Modifications

All modifications to project code and documentation should be performed via pull
requests, including modifications by Collaborators, PO, and TC members.

For small projects with a single Collaborator (aka, the PO), all modifications
are under the full responsibility of the PO.

All pull requests must be reviewed and accepted by a Collaborator with
sufficient expertise who is able to take full responsibility for the change.  In
the case of pull requests proposed by an existing Collaborator, an additional
Collaborator is required for sign-off.

In some cases, it may be necessary to summon a qualified Collaborator to a pull
request for review by @-mention.

If you are unsure about the modification and are not prepared to take full
responsibility for the change, defer to another Collaborator.

Before landing pull requests, sufficient time should be left for input from
other Collaborators.  Trivial changes may be landed after a shorter delay.

Where this is no disagreement amongst Collaborators, a pull request may be
landed given appropriate review.  Where there is discussion amongst
Collaborators, consensus should be sought if possible.  The lack of consensus
may indicate the need to elevate discussion to the PO or TC for resolution (see
below).

All bug fixes require a test case with demonstrates the defect.  The test should
*fail* before the change, and *pass* after the change.

All pull requests that modify executable code should be subjected to continuous
integration tests on the project CI server.


### Involving the PO/TC

Collaborators may opt to elevate pull requests or issues to the PO/TC for
discussion by assigning the ***tc-agenda***  or ***po-review*** tag.  This
should be done where a pull request:

- has a significant impact on the codebase,

- is inherently controversial; or

- has failed to reach consensus amongst the Collaborators who are actively
  participating in the discussion.

The PO/TC should server as the final arbiter where required.


## Landing Pull Requests

Always modify the original commit message to include additional meta information
regarding the change process:

- A `Reviewed-By: Name <email>` line for yourself and any other Collaborators
  who have reviewed the change.

- A `PR-URL:` line that references the full URL of the original pull request
  being merged so it's easy to trace a commit back to the conversation that led
  up to that change.

- A `Fixes: X` line, where _X_ is either the full URL for an issue, and/or the
  hash and commit message if the commit fixes a bug in a previous commit.
  Multiple `Fixes:` lines may be added if appropriate.

See the commit log for examples if unsure exactly how to format your commit
messages.

Additionally:

- Double check PRs to make sure the person's _full name_ and email address are
  correct before merging.

- Except when updating dependencies, all commits should be self contained
  (meaning every commit should pass all tests).  This makes it much easier when
  bisecting to find a breaking change.


### Summarized Technical HOWTO

The Detailed Technical HOWTO above covers all the bases.  You rarely need to do
many of those steps though.  Here is a summary for the typical landing of a PR.

```shell
$ git checkout develop
$ git fetch -p; git pull origin develop
$ curl -L $ curl -L https://patch-diff.githubusercontent.com/raw/ORG_NAME/REPO_NAME/pull/171.patch?token=VALID_TOKEN | git am -3
$ git rebase -i origin/develop

... squash all commits except for the first one ...

$ git push origin develop
```

If you run into any problem, do a `git rebase --abort` and click the _**Merge**_
button on the PR.


### Detailed Technical HOWTO

Ensure that you are not in a borked `am`/`rebase` state.

```shell
$ git am --abort
$ git rebase --abort
```

Checkout proper target branch

```shell
$ git checkout develop
```

Update the tree

```shell
$ git fetch origin
$ git merge --ff-only origin/develop
```

Apply external patches.  Go to the pull request that is about to get landed and
add `.patch` to the end of the URL and hit return.  It will redirect to a patch
of the changes.  Copy that URL and use it below.

```shell
$ curl -L https://patch-diff.githubusercontent.com/raw/ORG_NAME/REPO_NAME/pull/PR_NUMBER.patch?token=VALID_TOKEN | git am -3
```

Check and re-review the changes, they should match exactly what is in the pull
request.

```shell
git diff origin/develop
```

Check number of commits and commit messages, they should match exactly what is
in the pull request.

```shell
$ git log origin/develop...develop
```

Next, reword the commit to add in the `PR-URL` and `Reveiwed-By` details.  If
there are multiple commits that relate to the same feature or one with a feature
and separate with a test for that feature, you'll need to use `squash` or
`fixup`:

```shell
$ git rebase -i origin/develop
```

This will open a screen like this (in the default shell editor):

```text
pick 6928fc1 crypto: add feature A
pick 8120c4c add test for feature A
pick 51759dc feature B
pick 7d6f433 test for feature B

# Rebase f9456a2..7d6f433 onto f9456a2
#
# Commands:
#  p, pick = use commit
#  r, reword = use commit, but edit the commit message
#  e, edit = use commit, but stop for amending
#  s, squash = use commit, but meld into previous commit
#  f, fixup = like "squash", but discard this commit's log message
#  x, exec = run command (the rest of the line) using shell
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

Replace a couple of `pick`s with `fixup` to squash them into a previous commit:

```text
pick 6928fc1 crypto: add feature A
fixup 8120c4c add test for feature A
pick 51759dc feature B
fixup 7d6f433 test for feature B
```

Replace `pick` with `reword` to change the commit message:

```text
reword 6928fc1 crypto: add feature A
fixup 8120c4c add test for feature A
reword 51759dc feature B
fixup 7d6f433 test for feature B
```

Save the file and close the editor.  You'll be asked to enter a new commit
message for that commit.  This is a good moment to fix incorrect commit logs,
ensure that they are properly formatted, and add `Reviewed-By` lines.

Time to push it:

```shell
$ git push origin develop
```

Now add a comment to the pull request with the commit sha that the Pull Request
landed into develop in.  You can get this from the commits page for the develop
branch. Next close the pull request and delete the branch.


### I've made a huge mistake

With `git` there's a way to override remote trees by force pushing
(`git push -f`).  This should generally be seen as forbidden (since you're
rewriting history on a repository other people are working against) but its
allowed for simpler slip-ups such as typos in commit messages.  However, you are
only allowed to force push to any projects branch within 10 minutes from your
original push.  If someone else pushes to the branch or the 10 minute period
passes, consider the commit final.


## Creating a Release

Creating a release basically means bumping the package.json version number,
generating the changelog, and merging the code into the master branch, which
will generate a build that can be deployed to any environment, including
production.

```shell
$ git checkout develop
$ git fetch -p; git pull origin develop
$ jq .version package.json
0.29.0
$ git checkout -b release/0.30.0
$ vim package.json

... update the version from 0.29.0 to 0.30.0 in package.json ...

$ npm run generate-changelog

> REPO_NAME@0.29.0 generate-changelog /Users/jyoung/dev/REPO_NAME
> changelog-maker --group

* [[`47d94cbca5`](https://github.com/ORG_NAME/REPO_NAME/commit/47d94cbca5)] - update candidate info (AUTHOR)

... copy the commit lines, they start with * ...

$ vim CHANGELOG.md

... update the changelog, follow the conventions of previous entries, including spacing and capitalization ...

$ git commit -am 0.30.0
$ git checkout master
$ git merge release/0.30.0
$ git push origin master
$ git tag v0.30.0
$ git push origin v0.30.0
$ git checkout develop
$ git merge master
$ git push origin develop
```

Copy the CHANGELOG.md entry you made earlier.  Add the release notes to GitHub.
Goto https://github.com/ORG_NAME/REPO_NAME/tags and click
_**Add Release Notes**_ next to the tag that was pushed up earlier.

Publish the released version to npm.
