#!/bin/bash

rm data/mongod.lock
./mongod &
nodemon server.js
