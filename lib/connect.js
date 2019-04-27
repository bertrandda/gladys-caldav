const dav = require('dav');

module.exports = async (user) => {
    const params = await gladys.paramUser.getValues([
        { name: 'CALDAV_URL', user: user.id },
        { name: 'CALDAV_USERNAME', user: user.id },
        { name: 'CALDAV_PASSWORD', user: user.id }
    ]);

    const xhr = new dav.transport.Basic(
        new dav.Credentials({
            username: params[1],
            password: params[2]
        })
    );

    const client = new dav.Client(xhr);
    
    let lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    lastYear = lastYear.toISOString()
        .split('.')[0]
        .concat('Z')
        .replace(/[-:]/g, '');

    return client.createAccount({
        server: params[0],
        accountType: 'caldav',
        loadCollections: true,
        loadObjects: true,
        filters: [{
            type: 'comp-filter',
            attrs: { name: 'VCALENDAR' },
            children: [{
                type: 'comp-filter',
                attrs: { name: 'VEVENT' },
                children: [{
                    type: 'time-range',
                    attrs: { start: lastYear },
                }],
            }]
        }]
    })
}