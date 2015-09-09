// Fetches posts and comments efficiently from a Facebook page or group using multiquery FQL.

var config = require('../../../config/secrets').get().facebook;
var ContentService = require('../content-service');
var graph = require('fbgraph');
var util = require('util');
var _ = require('underscore');

// options.url - The url of the Facebook resource
// options.lastReportDate - The time of the last report already fetched (optional)
var FacebookContentService = function(options) {
  graph.setAccessToken(config.accessToken);
  this.fetchType = 'pull';
  this._url = options.url;
  ContentService.call(this, options);
};

util.inherits(FacebookContentService, ContentService);

// Fetch from the Facebook Content Service
// options.maxCount - Max number of reports that will be accepted. (required)
// callback(reportData) - Callback via which to return fetched report data.
// We don't actually care about maxCount in this function, we just rely on Facebook's API limits to limit data per fetch.
// If we return too many items, that is ok, the parent class will handle it.
FacebookContentService.prototype._doFetch = function(options, callback) {
  var self = this;

  if (!this._url) {
    process.nextTick(function () {
      self.emit('error', new Error('Missing Facebook URL'));
    });
    callback([]);
    return;
  }

  var source = this._url.trim();

  if (source.indexOf('?') === -1) {
    source = source.split('?')[0];
  }

  if (source.lastIndexOf('/') === source.length) {
    source = source.substr(0, source.length - 1);
  }

  source = source.substring(source.lastIndexOf('/'), source.length);

  this._doRequest(source, function(err, data) {
    if (err) {
      self.emit('error', new Error(err.message));
      return callback([]);
    }

    callback(self._handleResults(data));
  })

};

FacebookContentService.prototype._doRequest = function (source, callback) {
  var self = this;
  var data = [];
  var params = {};
  if (this._lastReportDate) {
    params.since = this._lastReportDate.getTime() / 1000;
  }

  callback(null, self._doGet('/v2.2/' + source + '/feed', params, data));
};

FacebookContentService.prototype._doGet = function(url, params, data) {
  var self = this;

  graph.get(url , params, function(err, res) {
      if (err) {
        return data;
      } else {
        if (res.data && res.data.length > 0) {
          data = data.concat(res.data);
        }
        if (res.paging && res.paging.next) {
          return self._doGet(res.paging.next, params, data);
        }
        return data;
      }
  });
};

FacebookContentService.prototype._handleResults = function(posts) {
  var self = this;
  var reportData = [];

  // Handle each post.
  posts.forEach(function(post) {
    reportData.push(self._parse(post, {type: 'post'}));
    if (post.comments && post.comment.data && post.comments.data.length > 0 ) {
      post.comments.data.forEach(function(comment) {
        reportData.push(self._parse(comment, {type: 'comment', post: post}))
      });
    }
  });

  if (self._lastReportDate)
    reportData = _.filter(reportData, function(rd) { return rd.authoredAt > self._lastReportDate });

  return reportData;
};

FacebookContentService.prototype._parse = function(data, options) {

  switch(options.type) {
    case 'post':
      return {
        authoredAt: new Date(data.created_time),
        fetchedAt: new Date(),
        content: data.message,
        author: data.from.name,
        url: data.link
      };
    case 'comment':
      return {
        authoredAt: new Date(data.created_time),
        fetchedAt: new Date(),
        content: data.message,
        author: data.from.name,
        url: options.post.link
      };
  }
};

module.exports = FacebookContentService;

