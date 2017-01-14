#!/bin/bash

read -r -d '' JSON <<EOF
{
  "surveyName": "My Survey",
  "startDate": "2016-12-20T00:00:55Z",
  "endDate": "2016-12-20T23:05:55Z",
  "participant": {
    "id": "aaaa"
  },
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

#JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFhYWEiLCJpYXQiOjE0ODM1ODY5ODAsImlzcyI6InN1cnZleSJ9.ioN4ZPjAjj1V7IIPWD5SdS3W6DJ-rWudbNyCuC99cRo"
JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJiYmIiLCJpYXQiOjE0ODQxOTI5OTAsImlzcyI6InN1cnZleSJ9.AQQw5Uo8JaJ-P1GsC4M7NCltrcA1uf73KpEtqf_gnuo"

curl -H "Content-Type: application/json" -H "Authorization: ${JWT}" -X POST -d "${JSON}" http://0.0.0.0:8080/assessments
