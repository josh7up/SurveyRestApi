#!/bin/bash

mkdir mongo
rm mongo/mongod.lock
./mongod &
nodemon server.js
