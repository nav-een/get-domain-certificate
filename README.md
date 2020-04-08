Simple module to get a website's SSL certificate from domain name

## Installation
```
npm install --save get-domain-certificate
```

## Usage
```
const getDomainCertificate = require('get-domain-certificate);
const certificate  = await getDomainCertificate('domain.com')
```

**Example:**
```
const getDomainCertificate = require('get-domain-certificate);
const certificate  = await getDomainCertificate('google.com')
console.log(certificate);

/*
{
      subject: {
        C: 'US',
        ST: 'California',
        L: 'Mountain View',
        O: 'Google LLC',
        CN: '*.google.com'
      },
      issuer: { C: 'US', O: 'Google Trust Services', CN: 'GTS CA 1O1' },
      subjectaltname: 'DNS:*.google.com, DNS:*.android.com, DNS:*.appengine.google.com, DNS:*.cloud.google.com, DNS:*.crowdsource.google.com, DNS:*.g.co, DNS:*.gcp.gvt2.com, DNS:*.gcpcdn.gvt1.com, DNS:*.ggpht.cn, DNS:*.gkecnapps.cn, DNS:*.google-analytics.com, DNS:*.google.ca, DNS:*.google.cl, DNS:*.google.co.in, DNS:*.google.co.jp, DNS:*.google.co.uk, DNS:*.google.com.ar, DNS:*.google.com.au, DNS:*.google.com.br, DNS:*.google.com.co, DNS:*.google.com.mx, DNS:*.google.com.tr, DNS:*.google.com.vn, DNS:*.google.de, DNS:*.google.es, DNS:*.google.fr, DNS:*.google.hu, DNS:*.google.it, DNS:*.google.nl, DNS:*.google.pl, DNS:*.google.pt, DNS:*.googleadapis.com, DNS:*.googleapis.cn, DNS:*.googlecnapps.cn, DNS:*.googlecommerce.com, DNS:*.googlevideo.com, DNS:*.gstatic.cn, DNS:*.gstatic.com, DNS:*.gstaticcnapps.cn, DNS:*.gvt1.com, DNS:*.gvt2.com, DNS:*.metric.gstatic.com, DNS:*.urchin.com, DNS:*.url.google.com, DNS:*.wear.gkecnapps.cn, DNS:*.youtube-nocookie.com, DNS:*.youtube.com, DNS:*.youtubeeducation.com, DNS:*.youtubekids.com, DNS:*.yt.be, DNS:*.ytimg.com, DNS:android.clients.google.com, DNS:android.com, DNS:developer.android.google.cn, DNS:developers.android.google.cn, DNS:g.co, DNS:ggpht.cn, DNS:gkecnapps.cn, DNS:goo.gl, DNS:google-analytics.com, DNS:google.com, DNS:googlecnapps.cn, DNS:googlecommerce.com, DNS:source.android.google.cn, DNS:urchin.com, DNS:www.goo.gl, DNS:youtu.be, DNS:youtube.com, DNS:youtubeeducation.com, DNS:youtubekids.com, DNS:yt.be',
      infoAccess: {
        'OCSP - URI': [ 'http://ocsp.pki.goog/gts1o1' ],
        'CA Issuers - URI': [ 'http://pki.goog/gsr2/GTS1O1.crt' ]
      },
      bits: 256,
      pubkey: {
        type: 'Buffer',
        data: [
            4, 216,  18, 254, 116, 193,  78,  77, 254,  56,  58,
          255, 116, 184, 120, 147,  44,  61, 220, 229,  94, 135,
          194, 146, 138,  57, 219,  35,  23, 181, 186,  28,  28,
          193, 226,   1,  80, 131,  64,  57,  45, 232, 230, 174,
          111, 138, 181, 196,  48, 148,  31, 136, 147, 105, 141,
           37, 119,  89, 155,  59, 153, 221,  77, 147, 207
        ]
      },
      asn1Curve: 'prime256v1',
      nistCurve: 'P-256',
      valid_from: 'Mar 24 06:35:18 2020 GMT',
      valid_to: 'Jun 16 06:35:18 2020 GMT',
      fingerprint: '27:E9:1B:9A:D1:94:8D:27:40:91:A8:87:12:55:3B:63:D6:05:D3:1F',
      fingerprint256: 'EA:0E:E7:08:42:03:6E:DD:C0:2F:BD:85:5E:19:9B:9D:FC:87:85:D6:BF:B8:17:51:5A:CE:C2:E3:6E:CA:16:D3',
      ext_key_usage: [ '1.3.6.1.5.5.7.3.1' ],
      serialNumber: '7E403AACA8F84F5302000000005F975E',
      raw: {
        type: 'Buffer',
        data: [
           48, 130,   9,  66,  48, 130,   8,  42, 160,   3,   2,   1,
            2,   2,  16, 126,  64,  58, 172, 168, 248,  79,  83,   2,
          ... 2274 more items
        ]
      },
      selfSigned: false,
      daysToExpiry: 69,
      expired: false,
      PEM: '-----BEGIN CERTIFICATE-----\n' +
        'MIIJQjCCCCqgAwIBAgIQfkA6rKj4T1MCAAAAAF+XXjANBgkqhkiG9w0BAQsFADBC\n' +
        ...
        '3lzhCa2/xwa64HE/zlIInbnVJESjTg==\n' +
        '-----END CERTIFICATE-----'
}
*/
```