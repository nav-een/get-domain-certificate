const https = require('https');

module.exports = (domain, depth = 0) => {
    const MAX_RECURSION_DEPTH = 2;

    if (depth > MAX_RECURSION_DEPTH) {
        return Promise.reject({ message: "Maximum recursion depth exceeded while normalizing domain" });
    }

    let URLObj;

    try {
        URLObj = new URL(domain);
    } catch {
        // new URL() throws if no protocol; prepend https:// and retry
        return module.exports('https://' + domain, depth + 1);
    }

    if (URLObj.protocol === 'http:' || URLObj.pathname !== '/') {
        return module.exports('https://' + URLObj.host, depth + 1);
    }

    return new Promise((resolve, reject) => {
        if (URLObj.protocol !== 'https:' || !URLObj.hostname) {
            reject({ message: "Invalid domain: "+URLObj.hostname })
        } else {
            getCertificate(resolve, reject, URLObj.hostname, URLObj.protocol);
        }
    })
}


const getCertificate = (resolve, reject, hostname, protocol, port = 443) => {
    const REQUEST_TIMEOUT = 10000; // 10 seconds

    const request = https.get({
        hostname,
        agent: false,
        rejectUnauthorized: false,
        ciphers: 'ALL',
        port,
        protocol,
        timeout: REQUEST_TIMEOUT
    }, (res) => {
        let certificate = res.socket.getPeerCertificate();
        if (!certificate) {
            reject({
                message: 'No certificate found in domain:',
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
            message: 'No certificate found in domain:',
            hostname
        });
    }).on('timeout', () => {
        request.destroy();
        reject({
            message: 'Request timeout while fetching certificate:',
            hostname
        });
    });

}

const parsePEM = (str) => {
    const lines = str.match(/.{1,64}/g);
    if (!lines) {
        return `-----BEGIN CERTIFICATE-----\n\n-----END CERTIFICATE-----`;
    }
    return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----`;
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
    const timeDiff = (new Date(date)) - (new Date());
    return Math.round(timeDiff / (1000 * 60 * 60 * 24))
}