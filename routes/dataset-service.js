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
                var mapped = [];
                if (docs[0] && docs[0].surveys) {
                    mapped = docs[0].surveys.screens.map(function(item) {
                        return item.id;
                    });
                }
                callback(null, mapped);
            }
        });
    }

    return {
        getFields: getFields
    };
}());