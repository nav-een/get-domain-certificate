const https = require('https');
const url = require('url');

module.exports = (domain) => {
    let URLObj = url.parse(domain)

    if (!URLObj.protocol) {
        return module.exports('https://' + domain)
    } else if (URLObj.protocol == 'http:' || URLObj.pathname != '/') {
        return module.exports('https://' + URLObj.host)
    }

    return new Promise((resolve, reject) => {
        if (URLObj.protocol != 'https:' || !URLObj.hostname) {
            reject({ message: "Invalid domain: "+URLObj.hostname })
        } else {
            return getCertificate(resolve, reject, URLObj.hostname, URLObj.protocol)
        }
    })
}


const getCertificate = (resolve, reject, hostname, protocol, port = 443) => {
    https.get({
        hostname,
        agent: false,
        rejectUnauthorized: false,
        ciphers: 'ALL',
        port,
        protocol
    }, (res) => {
        let certificate = res.socket.getPeerCertificate();
        if (!certificate) {
            reject({
                message: 'No certicate found in domain:',
                hostname
            });
        } else {
            certificate = {
                ...certificate,
                ...generateExtendedProperties(certificate)
            }
            resolve(JSON.parse(JSON.stringify(certificate)));
        }
    }).on('error', (e) => {
        reject({
            message: 'No certicate found in domain:',
            hostname
        });
      });

}

const parsePEM = (str) => {
    return returnString = `-----BEGIN CERTIFICATE-----\n${str.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----`;
}

const generateExtendedProperties = (certificate) => {
    let extendedProperties = {}
    if (certificate && certificate.subject && certificate.issuer && certificate.subject.CN == certificate.issuer.CN) {
        extendedProperties.selfSigned = true;
    } else {
        extendedProperties.selfSigned = false;
    }

    if (certificate && certificate.valid_to) {
        extendedProperties.daysToExpiry = daysToExpiry(certificate.valid_to);
        if (extendedProperties.daysToExpiry > 0) {
            extendedProperties.expired = false;
        } else {
            extendedProperties.expired = true;
        }
    }

    if (certificate && certificate.raw) {
        extendedProperties.PEM = parsePEM(certificate.raw.toString('base64'));
    }

    return extendedProperties;
}

const daysToExpiry = (date) => {
    let thisDate = new Date();
    const timeDiff = (new Date(date)) - (new Date());
    return Math.round(timeDiff / (1000 * 60 * 60 * 24))
}