#!/bin/bash

read -r -d '' JSON <<EOF
{
  "surveyName": "My Survey",
  "startDate": "2016-12-20T00:00:55Z",
  "endDate": "2016-12-20T23:05:55Z",
  "responses": [
    {
      "responseId": "hahahahahahaha",
      "responseDate": "2016-12-20T00:00:57Z",
      "values": [
        1, 2, 5
      ]
    },
    {
      "responseId": "two",
      "responseDate": "2016-12-20T00:01:03Z",
      "values": [
        true
      ]
    }
  ]
}
EOF

curl -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXJ2ZXkiLCJpYXQiOjE0ODM0ODY3NDR9.rQWGneSF44tRd5QDodAlkDabafE5Nek3ydJDX4ZRVf8" -X POST -d "$JSON" http://0.0.0.0:8080/assessments
