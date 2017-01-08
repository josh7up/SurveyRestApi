'use strict';

module.exports = (function() {
    var moment = require('moment');
    const dateFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    
    function toDateForFind(val) {
        return moment(val).format(dateFormat);
    };
    
    function toDateForSave(val) {
        return new Date(val);
    }
    
    function convertAssessment(assessment, dateConverter) {
        if (assessment.startDate) {
            assessment.startDate = dateConverter(assessment.startDate);
        }
        if (assessment.endDate) {
            assessment.endDate = dateConverter(assessment.endDate);
        }
        if (assessment.timeoutDate) {
            assessment.timeoutDate = dateConverter(assessment.timeoutDate);
        }
        if (assessment.responses) {
            assessment.responses = assessment.responses.map(function(response, index, array) {
                if (response.responseDate) {
                    response.responseDate = dateConverter(response.responseDate);
                }
                return response;
            });
        }
        return assessment;
    };
    
    return {
        find: function(db, query, callback) {
            db.assessments.find(query, (err, docs) => {
                if (err) {
                    callback(err, null);
                } else {
                    var mapped = docs.map(function(currentValue, index, array) {
                        return convertAssessment(currentValue, toDateForFind);
                    });
                    callback(null, docs);
                }
            });
        },
        save: function(db, assessment, callback) {
            var assessmentForSave = convertAssessment(assessment, toDateForSave);
            db.assessments.save(assessmentForSave, (err, result) => {
                if (err) {
                    callback(err, null);
                } else {
                    var assessmentForResponse = convertAssessment(assessment, toDateForFind);
                    callback(null, assessmentForResponse);
                }
            });
        }
    };
}());