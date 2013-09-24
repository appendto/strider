'use strict';

var  _ = require('underscore'),
  logging = require('./logging'),
  mongoose = require('mongoose'),
  ObjectId = mongoose.Types.ObjectId,
  Job = require('./models').Job;

module.exports = {};

module.exports.forceLatestJob = function forceLatestJob(req, res, next) {
  var org = req.params.org,
    repo = req.params.repo;

  function respond(err, jobs) {
    if (err) {
      return next(new Error(err));
    }
    if (!jobs || jobs.length === 0) {
      return next();
    }
		console.dir(jobs[0]);
    var id = jobs[0]._id.toString();
    var redirectTo = '/' + ([org, repo, 'job', id].join('/'));
    res.redirect(301, redirectTo);
  }

  var criteria = {
    "_owner": new ObjectId(req.user._id.toString()),
    "repo_url": {
      "$regex": [".*/", org, "/", repo, "$"].join(''),
      "$options": "i"
    }
  };

  var query = Job.find(criteria)
    .sort({"created_timestamp": -1})
    .limit(1)
    .lean();

  query.exec(respond);
};
