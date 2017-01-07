var moment = require('moment');
const dateFormat = "YYYY-MM-DDTHH:mm:ss[Z]";

var prepareForResponse = function(assessment) {
    if (assessment.startDate) {
        assessment.startDate = moment(assessment.startDate).format(dateFormat);
    }
    if (assessment.endDate) {
        assessment.endDate = moment(assessment.endDate).format(dateFormat);
    }
    if (assessment.timeoutDate) {
        assessment.timeoutDate = moment(assessment.timeoutDate).format(dateFormat);
    }
    if (assessment.responses) {
        assessment.responses = assessment.responses.map(function(response, index, array) {
            if (response.responseDate) {
                response.responseDate = moment(response.responseDate).format(dateFormat);
            }
            return response;
        });
    }
    return assessment;
};

exports.find = function(db, query, callback) {
    db.assessments.find(query, (err, docs) => {
        if (err) {
            callback(err, null);
        } else {
            var mapped = docs.map(function(currentValue, index, array) {
                return prepareForResponse(currentValue);
            });
            callback(null, docs);
        }
    });
};

exports.save = function(db, assessment, callback) {
    if (assessment.startDate) {
        assessment.startDate = new Date(assessment.startDate);
    }
    if (assessment.endDate) {
        assessment.endDate = new Date(assessment.endDate);
    }
    if (assessment.timeoutDate) {
        assessment.timeoutDate = new Date(assessment.timeoutDate);
    }
    if (assessment.responses) {
        assessment.responses = assessment.responses.map(function(currentValue, index, array) {
            if (currentValue.responseDate) {
                currentValue.responseDate = new Date(currentValue.responseDate);
            }
            return currentValue;
        });
    }
    
    db.assessments.save(assessment, (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            var modifiedAssessment = prepareForResponse(result);
            callback(null, modifiedAssessment);
        }
    });
};