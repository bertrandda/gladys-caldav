module.exports = function (sails) {

    const sync = require('./lib/calendar/calendar.sync.js');
    const setup = require('./lib/setup.js');

    return {
        setup,
        calendar: {
            sync
        }
    };
};