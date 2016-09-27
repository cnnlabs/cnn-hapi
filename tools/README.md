## Creating a Release

After the PR process is complete and the changes have been merged into develop.
Use [Semver][semver] for versioning a release. For more details on creating a release
please see [Release Creation][release].

### Use the create-release.sh script

#### Dry run to do a test run of creating a release
```
$ npm run create-release-dry
```

#### Run this cmd to create the actual release
```
$ npm run create-release
```

### OR execute the following commands

```
$ git fetch -p
$ git checkout master
$ git pull origin master
$ git checkout develop
$ git pull origin develop
$ grep version package.json
  "version": "1.18.0",                  <--- Previous version
$ git checkout -b release/1.19.0        <--- Branch name is new version
$ vim package.json
$ git commit -am '1.19.0'               <--- Commit message with the new version
$ git checkout master
$ git merge --no-ff release/1.19.0
$ git push origin master
$ git tag 1.19.0                        <--- Tag with the new version
$ git push origin 1.19.0
$ git checkout develop
$ git merge --no-ff master
$ git push origin develop
$ git branch -d release/1.19.0
```

[release]: https://gist.github.com/jamsyoung/6af435ff4c42e41f1b1e
[semver]: http://semver.org/
