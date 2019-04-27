const Promise = require('bluebird');
const sync = require('./calendar/calendar.sync.js');

module.exports = function() {

    // start syncing calendar
    sync();

    return Promise.resolve();
};