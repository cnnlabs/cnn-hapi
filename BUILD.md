# Build / Deployment Details
Builds are done on Codeship when commits are made to any branch.
Production deployments are done when builds are completed on the master branch.
Test deployments are done when builds are completed on the develop branch.


## Links
- Codeship - https://codeship.com/projects/[PROJECT_ID]
- Codeship Setup/Test - https://codeship.com/projects/[PROJECT_ID]/configure_tests
- Codeship Deployment - https://codeship.com/projects/[PROJECT_ID]/deployment_branches
- Bamboo - http://dmtbuild.turner.com/browse/MADOPS-MSSDOCKERBUILDER
- Argo Shipments
  - REF: http://deployit.services.dmtio.net/#shipments/hapi-boilerplate/ref
- Healthchecks
  - REF: http://hapi-boilerplate.ref.services.ec2.dmtio.net/healthcheck


## Codeship scripts
These scripts are copies of what is on Codeship.


#### Setup
```shell
## A copy of this script is in the repository in BUILD.md.
## If you make changes directly on Codeship, make sure to check in the changes
## to the repository.  It is actually best to update the one in source control
## and copy/paste the script into the Codeship page.

#### SETUP ####

## Install node engine
nvm install "$(jq -r '.engines.node' package.json)"

## Install npm engine - Only use this if you need a non-standard npm version
## that does not ship with node.
# npm install --global npm@"$(jq -r '.engines.npm' package.json)"

## Clean npm cache
npm cache clean
rm -rf ~/clone/node_modules

## Install Grunt
npm install --global grunt-cli

## Install Package
npm install
```


#### Test Pipeline 1
```shell
#### Pipeline - Test Commands ####

## Run Tests
grunt test


## Generate Documentation
npm run generate-docs


## Copy documentation out for uploading to documentation server later
cp -r docs ~/


## Generate Dockerfile
npm run generate-dockerfile
```


#### Deploy Step 1
```shell
## A copy of this script is in the repository in BUILD.md.
## If you make changes directly on Codeship, make sure to
## check in the changes to the repository.  It is actually
## best to update the one in source control and copy/paste
## the script into the Codeship page.

## Variables
NOW=$(date +"%Y%m%d%H%M%S")
PACKAGE_NAME=$(jq -r '.name' package.json)
PACKAGE_VERSION=$(jq -r '.version' package.json)
QA_TAG=$([ "${CI_BRANCH}" == master ] && echo "" || echo ".${CI_BRANCH}")
SEMVER=${PACKAGE_VERSION}-${CI_BUILD_NUMBER}${QA_TAG}
ARTIFACT_PACKAGE_NAME="${PACKAGE_NAME}"
TARBALL_FILENAME=${PACKAGE_NAME}-${SEMVER}.${NOW}.tar.gz
export S3_ARTIFACT_BUCKET_NAME=cnn/${ARTIFACT_PACKAGE_NAME}


## Update version in package.json
jq ".version = \"${SEMVER}\"" package.json > modified && mv modified package.json


## Change directory to home
cd ~


## Create the tarball
tar czf "${TARBALL_FILENAME}" -X clone/.dockerignore -C clone .

## Create the artifact directory, this is required due to the
## way the Codeship S3 deployment mechanism works.
mkdir artifact


## Move the artifact to the artifact directory, this is
## required due to the way the Codeship S3 deployment
## mechanism works.
mv "${TARBALL_FILENAME}" "artifact/${TARBALL_FILENAME}"
```


#### Deploy Step 2
This is encrypted.  Speak with James Young for the key to decrypt it.

```
U2FsdGVkX184v59huqdBz3exV66jSWiH/XINfWNLuKumEsQ/xMzTFu5gibXxEuqT
ZzGTIomEweLxTGOTJ7CAaz2CPH2ZDRm2tOicaUpg+TKEvFZKjHiTdjJSvExqo7yP
aj/CaxilIQ1EXbQpYkqgi0PyHTMiMUFDJfm3evCSU2w7w0EFDjgfHIqJ+gLS87nP
W51wxw0dAzcG/CoWzF5/M9xt8n5T+ZPeD66+O3QsUioI/FCLnDuvdDeJw4deSVE/
RIr1zeCHf3wl50ppQPctLMO+NimpFPOAKxqhg+EgQRUvQ8ePfKquq8Nsp3Akltok
OwPEJRr3qhZptzUFtBK4cdQTf96ZA4whkR6Sdutp6CEOOqRgVJVzRH0oxdvyYBo9
pLuHlvjpueRaPUCsHIf7mTkXQW4BW3Ls3n5HzyhdAf/A4FPKjHdYV5Ob9N1iG5yo
B0CvNupYqHY8yMHPGyIpRVoW0FO6bg2f5cU4kDxyFpKriVg/xXARBqTcPTCX5ves
rg52dsINt4KUeTr1lmU3aPpIZ3KTcM+DIa5kOii+0LqSvDx23nbPiGihLVQ/LB69
uFhHc3Hu4D+gJn78dkvxgmkAj4Au6XCeUreQnCEbzoOXgODscZ5l8l86lhtzoUCi
BhOHulh90OpZnflNPPnebf99w/IEjz4Bv14/pU+P3evF94ucgR0FFu3dT447s+IK
0bOuyjjo6W4NCwyKDmdvHzwlndflMiTbQ/SvXjIjxv4yYdXjwKCpJTRpSKyk4xJO
LBaFkyVj3XLpi8iGRrSQgYsolZbXaYwYGmORGpHNsVfuO55bbSwCIlP9lCUoiBlA
```


#### Deploy Step 3
```shell
## A copy of this script is in the repository in BUILD.md.
## If you make changes directly on Codeship, make sure to
## check in the changes to the repository.  It is actually
## best to update the one in source control and copy/paste
## the script into the Codeship page.

## POST to baton
curl -sS -X POST -H 'Content-Type: application/json' baton.outturner.io/docker/build -d "{\"packageTarballName\":\"${TARBALL_FILENAME}\",\"packageName\":\"${PACKAGE_NAME}\",\"packageVersion\":\"${SEMVER}\"}"

## -sS = --silent --show-error
## -X  = --request POST
## -H  = --header
## -d  = --data
```
