#!/bin/bash
# hamish.hamilton@turner.com
# ad.slaton@turner.com
# Creates a release

# Usage: ./create-release.sh
# Dry run usage: ./create-release.sh --dry-run

escape="\033";
GREEN="${escape}[32m";
YELLOW="${escape}[33m"
NO_COLOR="${escape}[0m";
CURRENT_VERSION=""
DRY_RUN=false
NEW_VERSION=""
PREFIX=$'\n'"-->>"
REPO_PATH=""
REPO_URL=""

# Check if the current directory contains a GIT repo
if $(git rev-parse --git-dir > /dev/null 2>&1;); then
    REPO_URL=$(git config --get remote.origin.url)
    # Check if this is the repo
    if [[ "${REPO_URL}" == *"cnnlabs/cnn-hapi" ]]; then
        REPO_PATH=$(git rev-parse --show-toplevel)
        CURRENT_VERSION=$(grep version ${REPO_PATH}/package.json | sed -e 's/^ *//g;s/ *$//g')
    fi
fi

# Output script usage information
function usage () {
    echo "
Usage:              ./create-release.sh
                    ./create-release.sh --dry-run
Options:
    --dry-run       Outputs the release creation commands instead of executing them.
                    Good way to see exactly what commands will be run beforehand."

    if [ -n "${CURRENT_VERSION}" ]; then
        echo "
Current release:    $(grep version ${REPO_PATH}/package.json | sed -e 's/^ *//g;s/ *$//g')
        "
    else
        warning "
You need to be in your local GIT repo to execute this script.
        "
    fi
}

function processCommand () {
    if [ "${DRY_RUN}" = true ]; then
        # A dry run outputs the command
        echo -e "${YELLOW}DRY RUN:${NO_COLOR} $1"
    else
        # Execute the command
        $1
        # Check return code
        if [ $? -ne 0 ]; then
            log "An error occurred. Exiting..."
            exit 1
        fi
    fi
}

function log () {
    echo -e "${GREEN}${PREFIX} $1${NO_COLOR}"
}

function warning () {
    echo -e "${YELLOW}$1${NO_COLOR}"
}

# Set command arguments
while [ -n "$1" ]; do
  case $1 in
    --dry-run )
        DRY_RUN=true
        ;;
    -h | --help )
        usage
        exit
        ;;
    * )
        usage
        exit 1
  esac
  shift
done

# If we got the current version, let's start the process
if [ -n "${CURRENT_VERSION}" ]; then
    warning "Be sure that the PR process is complete, and changes have been merged into develop."
    log "Fetching and pruning branches..."
    processCommand "git fetch -p"
    log "Checking out master branch..."
    processCommand "git checkout master"
    log "Pulling master branch..."
    processCommand "git pull origin master"
    log "Checking out develop branch..."
    processCommand "git checkout develop"
    log "Pulling develop branch..."
    processCommand "git pull origin develop"
    log "The current release is: ${CURRENT_VERSION}"

    # Prompt for the new release version
    while true; do
      read -p $'\n'"Enter the new release version: (q to quit) " reply
      case ${reply} in
        [^Qq]* )
            NEW_VERSION=${reply}; break;;
        [Qq]* ) log "Aborted!"$'\n'; exit;;
        * ) warning "Please enter a release version OR q to quit.";;
      esac
    done

    # Prompt to create release
    while true; do
      read -p $'\n'"Ready to create release ${NEW_VERSION} ? (y/n) " yn
      case ${yn} in
        [Yy]* ) log "Creating release branch..."; break;;
        [Nn]* ) log "Aborted!"$'\n'; exit;;
        * ) warning "Please answer yes or no.";;
      esac
    done

    processCommand "git checkout -b release/${NEW_VERSION}"
    log "Updating version in package.json..."

    # Handle package.json version update
    if [ "${DRY_RUN}" = true ]; then
        # Output the sed command as a string for the dry run
        CURRENT_VERSION_ESCAPED=$(echo ${CURRENT_VERSION} | sed -e 's/"/\\\"/g')
        echo -e "${YELLOW}DRY RUN:${NO_COLOR} sed -i '' \"s/${CURRENT_VERSION_ESCAPED}/\\\"version\\\": \\\"${NEW_VERSION}\\\",/\" ${REPO_PATH}/package.json"
    else
        # Execute the sed command directly without processCommand function to avoid string issues
        sed -i '' "s/${CURRENT_VERSION}/\"version\": \"${NEW_VERSION}\",/" ${REPO_PATH}/package.json
        # Check return code for the sed command
        if [ $? -ne 0 ]; then
            log "An error occurred. Exiting..."
            exit 1
        fi
    fi

    processCommand "git diff ${REPO_PATH}/package.json"

    # Prompt before committing the package.json so you can verify the diff
    while true; do
      read -p $'\n'"Commit the package.json change? (y/n) " yn
      case ${yn} in
        [Yy]* ) log "Committing package.json change..."; break;;
        [Nn]* )
            log "Aborting..."
            log "Undoing package.json change..."
            processCommand "git checkout ${REPO_PATH}/package.json"
            processCommand "git checkout develop"
            log "Deleting local release branch..."
            processCommand "git branch -D release/${NEW_VERSION}"
            log "Aborted!"$'\n'
            exit
            ;;
        * ) warning "Please answer yes or no.";;
      esac
    done

    processCommand "git add ${REPO_PATH}/package.json"
    processCommand "git commit -m ${NEW_VERSION}"
    processCommand "git checkout master"
    log "Merging release into master"
    processCommand "git merge --no-ff release/${NEW_VERSION}"
    log "Pushing master branch"
    processCommand "git push origin master"
    processCommand "git tag ${NEW_VERSION}"
    log "Pushing release tag"
    processCommand "git push origin ${NEW_VERSION}"
    processCommand "git checkout develop"
    log "Merging master into develop"
    processCommand "git merge --no-ff master"
    log "Pushing develop branch"
    processCommand "git push origin develop"
    log "Deleting local release branch"
    processCommand "git branch -d release/${NEW_VERSION}"
    log "All Done!"$'\n'
else
    usage
    exit
fi
