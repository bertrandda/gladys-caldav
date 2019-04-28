# gladys-caldav

This module allows you to connect Gladys to CalDAV server.

*Developed and tested on [Gladys](https://github.com/GladysAssistant) 3.13.0 with Nextcloud Agenda*

## Installation

- From your Gladys interface, go to the "Modules" view, then clic on the "Advanced" tab.

| Nom | Version | URL git | Slug |
|---|---|---|---|
| Gladys CalDAV | 0.1.0 | https://github.com/bertrandda/gladys-caldav | caldav |

- Go to parameters, then tabs "Parameters", and create 3 Params :
  - **CALDAV_URL** : The CalDAV server URL
  - **CALDAV_USERNAME** : Your CalDAV username
  - **CALDAV_PASSWORD**: Your CalDAV password
- Then reboot Gladys

- Try first synchronization, by executing the following script :

```javascript
gladys.modules.caldav.calendar.sync();
```

You should see in Gladys your calendar events.

Et voilà !

## Usage
*From [gladys-google](https://github.com/GladysAssistant/gladys-google#usage)*

I recommend to sync your calendars a first time with either a script, or by clicking on the "configuration" button
(Clicking on "configuration" simply start a sync).

Then, you can create a cron schedule telling "Every 30 minutes" => sync in Gladys.

- First, create an alarm in "Alarms". Create a cron rule with the following rule : "0 0,30 * * * *".
- Then create a scenario with this alarm selected, and put in action "Sync calendars".

If the action does not exist, go to parameters and update Gladys data.