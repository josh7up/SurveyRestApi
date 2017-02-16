# SurveyRestApi

A Node.js REST API for survey data. Android client app code that works with this server is available at https://github.com/josh7up/AndroidSurveyFramework

##Installation

1) Run `npm install` to install dependencies

2) Install MongoDB: `sudo apt-get install -y mongodb-org` (assumes a linux distribution)

3) Create a .env file in the root of this project. This is a property file with key-value pairs, and must include the following three properties:

    SERVER_HOST=YOUR_SERVER_IP_STRING
    SERVER_PORT=YOUR_SERVER_PORT
    JWT_KEY=YOUR_JWT_SECRET_KEY

   *Note: if you are running on a Cloud9 instance, server host will be "0.0.0.0".*

4) Run `private/scripts/run-server.sh` to start MongoDB and the Node server.
   
The server should now be running and listening for http requests. You can test that the server is working by sending a GET request to 

    https://YOUR_SERVER_IP/assessments?surveyName=Waking

If all goes well, the server will respond with an empty JSON array.
