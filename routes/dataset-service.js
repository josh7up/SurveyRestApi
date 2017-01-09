'use strict';

const moment = require('moment');
const json2csv = require('json2csv');
const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm:ss';

module.exports = (function() {
    const fixedFields = ['participantId', 'surveyName', 'startDate', 'startTime', 'endDate', 'endTime', 'timeoutDate', 'timeoutTime'];
    
    function getFields(db, surveyName, callback) {
        var aggregationPipeline = [
            // Convert surveys array to child documents.
            {
                $unwind: "$surveys"
            },
            // Only include the unwound survey document that matches the surveyName.
            {
                $match: {
                    'surveys.name': surveyName
                }
            },
            // Filter out unwanted fields.
            {
                $project: {
                    'surveys.name': 1,
                    'surveys.screens.id': 1,
                }
            }
        ];
        
        db.surveyDescriptions.aggregate(aggregationPipeline, (err, docs) => {
            if (err) {
                callback(err, null);
            } else {
                var fields = [];
                if (docs[0] && docs[0].surveys) {
                    docs[0].surveys.screens.forEach(function(item) {
                        fields.push(item.id);
                        fields.push(item.id + '_date');
                        fields.push(item.id + '_time');
                    });
                }
                callback(null, fields);
            }
        });
    }
    
    function getCsv(db, surveyName, assessments, callback) {
        try {
            getFields(db, surveyName, function(err, dynamicFields) {
                if (err) {
                    callback(err, null);
                } else {
                    var allFields = fixedFields.concat(dynamicFields);
                    var dataset = assessments.map(function(item) {
                        var row = {};
                        row.participantId = item.participant ? item.participant.id : '';
                        row.surveyName = item.surveyName;
                        row.startDate = item.startDate ? moment(item.startDate).format(dateFormat) : '';
                        row.startTime = item.startDate ? moment(item.startDate).format(timeFormat) : '';
                        row.endDate = item.endDate ? moment(item.endDate).format(dateFormat) : '';
                        row.endTime = item.endDate ? moment(item.endDate).format(timeFormat) : '';
                        row.timeoutDate = item.timeoutDate ? moment(item.timeoutDate).format(dateFormat) : '';
                        row.timeoutTime = item.timeoutTime ? moment(item.timeoutDate).format(timeFormat) : '';
                        
                        // Collect assessment data for each dynamic field.
                        if (item.responses) {
                            item.responses.forEach(function(response) {
                                row[response.responseId] = response.values.map(function(value) {
                                    var convertedValue = parseInt(value);
                                    return convertedValue == NaN ? value : convertedValue;
                                }).join(',');
                                
                                // Add a date and a time row mapping for each response.
                                if (response.responseDate) {
                                    row[response.responseId + '_date'] = moment(response.responseDate).format(dateFormat);
                                    row[response.responseId + '_time'] = moment(response.responseDate).format(timeFormat);
                                }
                            });
                        }
                        
                        return row;
                    });
                    
                    var result = json2csv({ data: dataset, fields: allFields });
                    callback(null, result);
                }
            });
        } catch (err) {
            // Errors are thrown for bad options, or if the data is empty and no fields are provided. 
            // Be sure to provide fields if it is possible that your data array will be empty. 
            callback(err, null)
        }
    }

    return {
        getFields: getFields,
        getCsv: getCsv
    };
}());