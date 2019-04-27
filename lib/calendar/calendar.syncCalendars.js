module.exports = (calendars, user) => {
    sails.log.info(`CalDAV : Performing full sync of calendars.`);

    return sync(calendars, user);
};

async function sync(calendars, user) {
    sails.log.info(`CalDAV : Syncing calendars, received ${calendars.length} calendars.`);

    // insert events in DB
    const newCalendars = await gladys.calendar.create(formatCalendars(calendars, user));
    
    sails.log.info(`CalDAV : Successfully inserted ${newCalendars.length} calendars in Gladys database.`);

    return newCalendars;
}

function formatCalendars(caldavCalendars, user) {
    const calendars = [];

    caldavCalendars.forEach((caldavCalendar) => {

        const newCalendar = {
            externalid: caldavCalendar.url,
            name: caldavCalendar.displayName,
            service: 'caldav',
            user: user.id
        };

        calendars.push(newCalendar);
    });

    return calendars;
}