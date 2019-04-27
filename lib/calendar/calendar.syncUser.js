const Promise = require('bluebird');
const connect = require('../connect.js');
const syncCalendars = require('./calendar.syncCalendars.js');
const syncCalendarEvents = require('./calendar.syncCalendarEvents.js');

module.exports = async (user) => {
    const account = await connect(user);

    await syncCalendars(account.calendars, user);

    const gladysCalendars = await gladys.calendar.getByService('caldav');

    // foreach calendar, sync events
    return Promise.map(gladysCalendars, (gladysCalendar) => {
        try {
            return syncCalendarEvents(
                gladysCalendar,
                account.calendars.filter((calendar) => gladysCalendar.externalid === calendar.url)
            )
        } catch (err) {
            sails.log.warn(`CalDAV - Calendar : Failed to sync calendar ${gladysCalendar.name} with externalid ${gladysCalendar.externalid}. ${err}`);
        };
    }, { concurrency: 1 });
};