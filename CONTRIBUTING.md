# Contributing


## Issue contributions

When opening new issues or commenting on existing issues make sure discussions
are related to concrete technical issues.


## Code contributions

This project has an open governance model for Turner developers and welcomes new
contributors.  Individuals making significant and valuable contributions may be
made _Collaborators_ and given commit-access to the project.  See the
[GOVERNANCE.md](./GOVERNANCE.md) document for more information about how this
works.

This document will guide you though the contribution process.


### Step 1: fork

Fork the project and check out your copy locally.

```shell
$ git clone git@github.com:ORG_NAME/REPO_NAME.git
$ cd REPO_NAME
$ git remote add upstream git@github.com:ORG_NAME/REPO_NAME.git
```


#### Which branch?

For developing new features and bug fixes, the `develop` branch should be pulled
and built upon.


### Step 2: Branch

Create a feature branch and start making changes.  The name of the feature
branch should be the GitHub issue number, like `issue-1`.

```shell
$ git checkout -b issue-1
```


### Step 3: Commit

Make sure git knows your _correct_ name and email address:

```shell
$ git config --global user.name "Your Name"
$ git config --global user.email "your.email@somewhere.com"
```

A commit log should describe what changed and why.  Follow these guidelines when
writing one:

Each commit message consists of a **header**, a **body** and a **footer**.  The
header has a special format that includes a **subsystem** and a
**short-description**:

```
<subsystem>: <short-description>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters.  Make sure in
commit messages you:

- use the imperative, present tense: "change" not "changed" nor "changes"

- don't capitalize first letter

- no dot (.) at the end

A good commit log can look something like this:

```text
subsystem: succinct description of the change

Body of commit message explaining things in more details and giving background
about the issue being fixed as needed.

The body can be several paragraphs.  Try to limit the line length to around 72
characters or so.

Fixes: #12
Reviewed-By: Your Name <your.email@somewhere.com>
```


### Step 4: Rebase

Use `git rebase` (not `git merge`) to sync your work very frequently.

```shell
$ git pull --rebase upstream develop
```


### Step 5: Test

Bug fixes and features **should come with tests**.  Add your tests in the
`test/` directory.  Look at other tests to see how they should be structured.

Run all existing tests for the project.  See the project README.md for details
on how to run the tests.


### Step 6: Push

```shell
$ git push origin my-feature-branch
```

Go to https://github.com/yourusername/hapi-boilerplate and select your feature
branch.  Click the 'Pull Request' button and fill out the form.

Pull requests are usually reviewed within a few days.  If there are comments to
address, apply your changes in a separate commit and push that to your feature
branch.  Post a comment in the pull request afterwards; GitHub does not send out
notifications when you add commits.


### Summary of Git commands

```text
.                     + merge into develop
       +---+          |
       | R +------+---+------+------+------+  develop
       +---+      |          |      ^
                 A|          |     D|
Fork   +---+      |          |      |
of R   | F +------+---+--------------------+  develop
       +---+          |      |      |
                     B|     C|      |
                      |      V      |
                      +------+------+  issue-1
```

- A - when on F:develop - `git pull upstream develop`
- B - when on F:develop - `git checkout -b issue-1 -t origin/develop`
- C - when on F:issue-1 - `git pull --rebase upstream develop`
- D - Create a Pull Request on GitHub
