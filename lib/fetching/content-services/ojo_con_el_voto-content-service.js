// Fetches posts from SOAP url.

var request = require('request');
var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');
var logger = require('../../logger');
var soap = require("soap");
var moment = require("moment");

// options.url - The URL of the Ojo al voto app SOAP url
// options.lastReportDate - The fetchedAt time of the last already fetched report (optional).
var OjoConElVotoContentService = function(options) {
    this._url = options.url;
    this.fetchType = 'pull';
    this.lastIncident = 0;
    ContentService.call(this, options);
};

util.inherits(OjoConElVotoContentService, ContentService);

// Fetch from Ojo al voto
OjoConElVotoContentService.prototype._doFetch = function(options, callback) {
    var self = this;
    soap.createClient(self._url, function(err, client) {
        client.WSOCV.WSOCVSoap.GetIncidents(self.lastIncident, function(err, result) {
            if (err) {
                self.emit("error", new Error(err.message));
                callback([]);
            } else {
                callback(self._handleResults(result.GetIncidentsResult.Incident.Incident));
            }
        });
    });
};

OjoConElVotoContentService.prototype._handleResults = function(data) {
    var self = this;
    var formattedData = [];
    for (var i = 0; i < data.length; i++) {
        if (i == data.length - 1) {
            self.lastIncident = data[i].IdIncident;
        }

        formattedData.push(self._parse(data[i]));
    }
    if (self._lastReportDate)
        formattedData = _.filter(formattedData, function(rd) { return rd.authoredAt > self._lastReportDate });

    return formattedData;
};

OjoConElVotoContentService.prototype._parse = function(data) {
    return {
        authoredAt: moment(data.Datetime).toDate(),
        fetchedAt: new Date(),
        content: "Incidente: " + data.NameIncidentType + " | Nro. Mesa: " + data.Number +
            ", Partido " + data.Location1 + ", Provincia: " + data.Location2 + ", Pais: " +
            data.Location3 + " | Commentario: " + data.Coment,
        author: data.LinkPhoto,
        url: data.LinkPhoto
    };
};

module.exports = OjoConElVotoContentService;
