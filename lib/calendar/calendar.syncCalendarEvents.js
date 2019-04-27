const ical = require('ical');
const Promise = require('bluebird');

module.exports = async (gladysCalendar, calendars) => {
    if (calendars.length !== 1) {
        return Promise.resolve();
    }

    const calendar = calendars[0];

    sails.log.info(`CalDAV : Performing full sync on calendar ${gladysCalendar.externalid}.`);

    // we clean the calendar first
    await gladys.calendar.clean(gladysCalendar)

    return sync(calendar.objects, gladysCalendar);
};

async function sync(events, gladysCalendar) {
    sails.log.info(`CalDAV : Syncing calendar ${gladysCalendar.externalid}, received ${events.length} events.`);

    // insert events in DB
    const newEvents = await gladys.calendar.createEvents(formatEvents(events, gladysCalendar));
    
    sails.log.info(`CalDAV : Successfully inserted ${newEvents.length} calendarEvents in Gladys database.`);

    return newEvents;
}

function formatEvents(caldavEvents, gladysCalendar) {
    const events = [];

    caldavEvents.forEach((caldavEvent) => {
        caldavEvent = ical.parseICS(caldavEvent.calendarData);
        caldavEvent = caldavEvent[Object.keys(caldavEvent)[0]];

        if(caldavEvent.type !== 'VEVENT') return;

        const newEvent = {
            externalid: caldavEvent.uid,
            name: caldavEvent.summary,
            location: caldavEvent.location,
            calendar: gladysCalendar.id
        };

        if (caldavEvent.start) newEvent.start = caldavEvent.start.toISOString();
        if (caldavEvent.end ) newEvent.end = caldavEvent.end.toISOString();

        if (caldavEvent.start && caldavEvent.start.tz === undefined) newEvent.fullday = true;
        console.log(newEvent)

        events.push(newEvent);
    });

    return events;
}