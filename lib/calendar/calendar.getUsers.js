const queries = require('./calendar.queries.js');

module.exports = () => {
    return gladys.utils.sql(queries.getUsers, ['CALDAV_USERNAME']);
};