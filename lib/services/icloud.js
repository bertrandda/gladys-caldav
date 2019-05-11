const Promise = require('bluebird');
const xmlDom = require('xmldom');
const https = require('https');

module.exports = async (appleId, password) => {
    const auth = {
        appleId,
        password
    }

    let postData = `
        <propfind xmlns='DAV:'>
            <prop>
                <current-user-principal/>
            </prop>
        </propfind>
    `;

    let xml = await iCloudRequest('/', auth, postData);
    let xmlDoc = new xmlDom.DOMParser().parseFromString(xml);
    const path = xmlDoc.getElementsByTagName('current-user-principal')[0].getElementsByTagName('href')[0].childNodes[0].nodeValue;
    postData = `
        <propfind xmlns='DAV:' xmlns:cd='urn:ietf:params:xml:ns:caldav'>
            <prop>
                <cd:calendar-home-set/>
            </prop>
        </propfind>
    `;

    xml = await iCloudRequest(path, auth, postData);
    xmlDoc = new xmlDom.DOMParser().parseFromString(xml);
    return xmlDoc.getElementsByTagName('calendar-home-set')[0].getElementsByTagName('href')[0].childNodes[0].nodeValue;
}

function iCloudRequest(path, auth, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            auth: `${auth.appleId}:${auth.password}`,
            headers: {
                Depth: '0',
                'Content-Type': 'application/xml',
                'Content-Length': postData.length
            },
            host: 'caldav.icloud.com',
            method: 'PROPFIND',
            path,
            port: 443
        }, (res) => {
            let body = '';

            res.on('data', (data) => {
                body += data;
            });

            res.on('end', () => {
                resolve(body);
            });
        })

        req.on('error', (err) => {
            reject(err);
        })

        req.write(postData);
        req.end();
    })
}