# SurveyRestApi

A Node.js REST API for survey data. Android client app code that works with this server is available at https://github.com/josh7up/AndroidSurveyFramework

## Installation and Running

1) Run `npm install` to install dependencies

2) Install MongoDB: `sudo apt-get install -y mongodb-org` (assumes a linux distribution)

3) Create a .env file in the root of this project. This is a property file with key-value pairs, and must include the following three properties:

```
 SERVER_HOST=YOUR_SERVER_IP
 SERVER_PORT=YOUR_SERVER_PORT
 JWT_KEY=YOUR_JWT_SECRET_KEY
```
*Note: if you are running on a Cloud9 instance, server host will be "0.0.0.0".*

For example, if you want to run the server on localhost on port 23456, you can use the following:

```
 SERVER_HOST=0.0.0.0
 SERVER_PORT=23456
```

The JWT_KEY value is an arbitrary string that is a secret value known only to the server and that is used to sign the tokens that are used for authentication.

4) Run `private/scripts/run-server.sh` to start MongoDB and the Node server.
   
5) Verify the server is running and listening for http requests by sending a GET request to 

```
  YOUR_SERVER_IP/assessments?surveyName=Waking
```
  
  e.g.

```
  0.0.0.0:23456/assessments?surveyName=Waking
```

The server should respond with the following:

```
  {
    "statusCode": 401,
    "error": "Unauthorized",
    "message": "jwt must be provided"
  }
```

## Using the API

In order to use the REST API, you will need to include a valid JWT **Authorization** header token in requests. You can get a token by creating a new user with the following API call (note that the associated Android app will do this for you when creating a user. This is for illustrative purposes only):

- Create User

```
  POST  /users
  
  parameters:
  
    NAME         VALUE
    _________    _________
    username     minimum 4 character long string
    password     minimum 8 character long string
```

- Login Existing User

```
  POST  /users/authenticate
  
  parameters:
  
    NAME         VALUE
    _________    _________
    username     minimum 4 character long string
    password     minimum 8 character long string
```
