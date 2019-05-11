const Promise = require('bluebird');
const sync = require('./calendar/calendar.sync');
const getUsers = require('./calendar/calendar.getUsers');
const iCloudUrl = require('./services/icloud');

module.exports = async () => {
    let users;
    try {
        users = await getUsers();
    } catch (error) {
        return Promise.reject(error);
    }

    if (users.length < 1) {
        return Promise.reject('No user configuration found')
    }

    await Promise.all(users.map(async user => {
        console.log('User', user.id);
        await checkSetup(user);
    }));

    // start syncing calendar
    await sync();

    return Promise.resolve();
};

async function checkSetup(user) {
    let params;
    try {
        params = await gladys.paramUser.getValues([
            { name: 'CALDAV_URL', user: user.id },
            { name: 'CALDAV_USERNAME', user: user.id },
            { name: 'CALDAV_PASSWORD', user: user.id }
        ]);
    } catch (error) {
        Promise.reject(error);
    }

    switch (params[0]) {
        case 'icloud.com':
            await gladys.paramUser.setValue({
                user: user.id,
                name: 'CALDAV_URL',
                value: await iCloudUrl(params[1], params[2])
            })
            break;
        default:
            break;
    }

    return Promise.resolve();
}