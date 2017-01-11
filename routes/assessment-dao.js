'use strict';

const moment = require('moment');
const dateFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    
module.exports = (function() {
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
    
    function find(db, query) {
        return new Promise(function(resolve, reject) {
            db.assessments.find(query, (err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    var mapped = docs.map(function(currentValue, index, array) {
                        return convertAssessment(currentValue, toDateForFind);
                    });
                    resolve(mapped);
                }
            });
        });
    }
    
    function save(db, assessment) {
        return new Promise(function(resolve, reject) {
            var assessmentForSave = convertAssessment(assessment, toDateForSave);
            db.assessments.save(assessmentForSave, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    var assessmentForResponse = convertAssessment(assessment, toDateForFind);
                    resolve(assessmentForResponse);
                }
            });
        });
    }
    
    return {
        find: find,
        save: save
    };
}());