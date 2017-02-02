#!/bin/bash
# Provides a quick way to run mongodb and the node app without having requiring mongo as a service.

script_parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
# Change to the node app root.
cd "${script_parent_path}/../../"

mkdir mongo
# Remove the mongo lock file in case the db shut down unexpectedly.
rm ./mongo/mongod.lock
${script_parent_path}/mongod &
nodemon ./server.js
