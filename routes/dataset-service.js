'use strict';

const Boom = require('boom');
const json2csv = require('json2csv');

module.exports = (function() {
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

    return {
        getFields: getFields
    };
}());