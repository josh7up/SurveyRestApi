# SurveyRestApi

A Node.js REST API for survey data. Android client app code that works with this server is available at https://github.com/josh7up/AndroidSurveyFramework

Note that the *.env* file contains environment-specific configuration for my Cloud9 instance where I have been testing this server. You will need to replace the contents with the appropriate configuration for your deployment.

##Installation

1) Run `npm install` to install dependencies

2) Install MongoDB: `sudo apt-get install -y mongodb-org` (assumes a linux distribution)

3) Run `private/scripts/run-server.sh` to start mongo and the Node server.
   
The server should now be running and listening for http requests. You can test that the server is working by sending a GET request to 

    https://YOUR_SERVER_IP/assessments?surveyName=Waking

If all goes well, the server will respond with an empty JSON array.
