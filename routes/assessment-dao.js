var moment = require('moment');

exports.find = function(db, query, callback) {
    const dateFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    
    db.assessments.find(query, (err, docs) => {
        if (err) {
            callback(err, null);
        } else {
            var mapped = docs.map(function(currentValue, index, array) {
                if (currentValue.startDate) {
                    currentValue.startDate = moment(currentValue.startDate).format(dateFormat);
                }
                if (currentValue.endDate) {
                    currentValue.endDate = moment(currentValue.endDate).format(dateFormat);
                }
                if (currentValue.timeoutDate) {
                    currentValue.timeoutDate = moment(currentValue.timeoutDate).format(dateFormat);
                }
                if (currentValue.responses) {
                    currentValue.responses = currentValue.responses.map(function(response, index, array) {
                        if (response.responseDate) {
                            response.responseDate = moment(response.responseDate).format(dateFormat);
                        }
                        return response;
                    });
                }
                return currentValue;
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
            callback(null, result);
        }
    });
};