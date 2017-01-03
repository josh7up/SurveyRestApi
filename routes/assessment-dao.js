var moment = require('moment');

exports.find = function(db, query, errorHandler, successHandler) {
    db.assessments.find(query, (err, docs) => {
        if (err) {
            if (errorHandler) {
                errorHandler(err);
            }
        } else {
            if (successHandler) {
                var mapped = docs.map(function(currentValue, index, array) {
                    if (currentValue.startDate) {
                        currentValue.startDate = moment(currentValue.startDate).format("YYYY-MM-DDTHH:mm:ss[Z]");
                    }
                    if (currentValue.endDate) {
                        currentValue.endDate = moment(currentValue.endDate).format("YYYY-MM-DDTHH:mm:ss[Z]");
                    }
                    if (currentValue.timeoutDate) {
                        currentValue.timeoutDate = moment(currentValue.timeoutDate).format("YYYY-MM-DDTHH:mm:ss[Z]");
                    }
                    if (currentValue.responses) {
                        currentValue.responses = currentValue.responses.map(function(response, index, array) {
                            if (response.responseDate) {
                                response.responseDate = moment(response.responseDate).format("YYYY-MM-DDTHH:mm:ss[Z]");
                            }
                            return response;
                        });
                    }
                    return currentValue;
                });
                console.log(mapped);
                successHandler(docs);
            }
        }
    });
};

exports.save = function(db, assessment, errorHandler, successHandler) {
    console.log(assessment);
    
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
    
    console.log("before mapped...");
    console.log(assessment);
    console.log('after mapped....')
    
    db.assessments.save(assessment, (err, result) => {
        if (err) {
            if (errorHandler) {
                errorHandler(err);
            }
        } else {
            if (successHandler) {
                successHandler(result);
            }
        }
    });
};