const Promise = require('bluebird');
const getUsers = require('./calendar.getUsers.js');
const syncUser = require('./calendar.syncUser.js');

module.exports = async () => {
    const users = await getUsers();
    sails.log.info(`CalDAV - Calendar : Syncing ${users.length} users.`);

    return Promise.map(users, (user) => {
        try {
            return syncUser(user)
        } catch (err) {
            sails.log.warn(`CalDAV - Calendar : Unable to sync user ID ${user.id}. ${err}`);
        };
    }, { concurrency: 1 });
};