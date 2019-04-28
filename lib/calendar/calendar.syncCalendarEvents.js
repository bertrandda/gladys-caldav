const ical = require('ical');
const moment = require('moment');
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
    let events = [];

    caldavEvents.forEach((caldavEvent) => {
        caldavEvent = ical.parseICS(caldavEvent.calendarData);
        caldavEvent = caldavEvent[Object.keys(caldavEvent)[0]];

        if (caldavEvent.type !== 'VEVENT') return;

        if (typeof caldavEvent.rrule === 'undefined') {
            const newEvent = {
                externalid: caldavEvent.uid,
                name: caldavEvent.summary,
                location: caldavEvent.location,
                calendar: gladysCalendar.id
            };

            if (caldavEvent.start) newEvent.start = caldavEvent.start.toISOString();
            if (caldavEvent.end) newEvent.end = caldavEvent.end.toISOString();

            if (caldavEvent.start && caldavEvent.start.tz === undefined) newEvent.fullday = true;
            
            events.push(newEvent);
        } else {
            events = events.concat(formatRecurring(caldavEvent, gladysCalendar).filter(e => e !== null));
        }
    });

    return events;
}

// From : https://github.com/peterbraden/ical.js/blob/master/example_rrule.js
function formatRecurring(event, gladysCalendar) {
    let startDate = moment(event.start);
    let endDate = event.end ? moment(event.end) : event.duration ? moment(event.start).add(moment.duration(event.duration)) : moment(event.start).add(1, 'days');

    // Calculate the duration of the event for use with recurring events.
    const duration = parseInt(endDate.format('x')) - parseInt(startDate.format('x'));

    const rangeStart = moment().subtract(1, 'years');
    const rangeEnd = moment().add(2, 'years');

    // For recurring events, get the set of event start dates that fall within the range
    // of dates we're looking for.
    const dates = event.rrule.between(
        rangeStart.toDate(),
        rangeEnd.toDate(),
        true,
        (date, i) => { return true }
    )

    // The "dates" array contains the set of dates within our desired date range range that are valid
    // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
    // had its date changed from outside the range to inside the range.  One way to handle this is
    // to add *all* recurrence override entries into the set of dates that we check, and then later
    // filter out any recurrences that don't actually belong within our range.
    if (event.recurrences != undefined) {
        for (let r in event.recurrences) {
            // Only add dates that weren't already in the range we added from the rrule so that 
            // we don't double-add those events.
            if (moment(new Date(r)).isBetween(rangeStart, rangeEnd) != true) {
                dates.push(new Date(r));
            }
        }
    }

    // Loop through the set of date entries to see which recurrences should be printed.
    return dates.map((date, i) => {
        let curEvent = event;
        let showRecurrence = true;
        let curDuration = duration;

        startDate = moment(date);

        // Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
        let dateLookupKey = date.toISOString().substring(0, 10);

        // For each date that we're checking, it's possible that there is a recurrence override for that one day.
        if ((curEvent.recurrences != undefined) && (curEvent.recurrences[dateLookupKey] != undefined)) {
            // We found an override, so for this recurrence, use a potentially different title, start date, and duration.
            curEvent = curEvent.recurrences[dateLookupKey];
            startDate = moment(curEvent.start);
            curDuration = parseInt(moment(curEvent.end).format('x')) - parseInt(startDate.format('x'));
        }
        // If there's no recurrence override, check for an exception date.  Exception dates represent exceptions to the rule.
        else if ((curEvent.exdate != undefined) && (curEvent.exdate[dateLookupKey] != undefined)) {
            // This date is an exception date, which means we should skip it in the recurrence pattern.
            showRecurrence = false;
        }

        // Set the the title and the end date from either the regular event or the recurrence override.
        const recurrenceTitle = curEvent.summary;
        endDate = moment(parseInt(startDate.format('x')) + curDuration, 'x');

        // If this recurrence ends before the start of the date range, or starts after the end of the date range, 
        // don't process it.
        if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
            showRecurrence = false;
        }

        if (showRecurrence === true) {
            const newEvent = {
                externalid: `${event.uid}${i}`,
                name: recurrenceTitle,
                location: event.location,
                calendar: gladysCalendar.id
            };
        
            if (event.start && event.start.tz === undefined) newEvent.fullday = true;

            newEvent.start = startDate.toISOString();
            newEvent.end = endDate.toISOString();
            
            return newEvent;
        }

        return null;
    });
}