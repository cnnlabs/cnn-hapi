#!/bin/bash

NODE_TYPE='node'
NODE_ENGINE=$(jq -r .engines.node package.json)
PACKAGE_NAME=$(jq -r .name package.json)
START_COMMAND='node'
PACKAGE_MAIN=$(jq -r .main package.json)

sed "s/@@nodeType/${NODE_TYPE}/g;\
    s/@@nodeEngine/${NODE_ENGINE}/g;\
    s/@@packageName/${PACKAGE_NAME}/g;\
    s/@@startCommand/${START_COMMAND}/g;\
    s/@@packageMain/${PACKAGE_MAIN}/g" Dockerfile.template > Dockerfile
