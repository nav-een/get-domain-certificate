# get-domain-certificate

[![npm](https://img.shields.io/npm/v/get-domain-certificate)](https://www.npmjs.com/package/get-domain-certificate) ![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

Retrieve SSL/TLS certificate details from any domain. Zero dependencies — uses only Node.js built-in modules.

Accepts bare domains, `http://`, or `https://` URLs. Automatically normalizes input and connects over TLS to fetch the full certificate chain with extended properties like expiry status, self-signed detection, and PEM encoding.

## Installation

```bash
npm install get-domain-certificate
```

## Quick Start

```js
const getDomainCertificate = require('get-domain-certificate');

const certificate = await getDomainCertificate('google.com');
console.log(certificate.subject.CN);   // *.google.com
console.log(certificate.expired);      // false
console.log(certificate.daysToExpiry); // 63
console.log(certificate.selfSigned);   // false
```

## Flexible Input

All of the following resolve to the same certificate:

```js
await getDomainCertificate('example.com');
await getDomainCertificate('http://example.com');
await getDomainCertificate('https://example.com');
```

## Extended Properties

On top of the standard [Node.js TLS certificate object](https://nodejs.org/api/tls.html#certificate-object), the following computed properties are added:

| Property | Type | Description |
|----------|------|-------------|
| `selfSigned` | `boolean` | `true` if `subject.CN` matches `issuer.CN` |
| `expired` | `boolean` | `true` if the certificate has expired |
| `daysToExpiry` | `number` | Days remaining until expiry (negative if expired) |
| `PEM` | `string` | Certificate in PEM-encoded format |

## Full Example

```js
const getDomainCertificate = require('get-domain-certificate');

async function checkCertificate(domain) {
  try {
    const cert = await getDomainCertificate(domain);
    console.log(`Domain: ${cert.subject.CN}`);
    console.log(`Issuer: ${cert.issuer.CN}`);
    console.log(`Valid: ${cert.valid_from} - ${cert.valid_to}`);
    console.log(`Expires in: ${cert.daysToExpiry} days`);
    console.log(`Self-signed: ${cert.selfSigned}`);
    console.log(`Expired: ${cert.expired}`);
  } catch (error) {
    console.error(error.message);
  }
}

checkCertificate('github.com');
```

## Error Handling

The function returns a Promise that rejects with an error object:

```js
try {
  await getDomainCertificate('not-a-real-domain.fake');
} catch (error) {
  console.error(error.message);
  // "No certificate found in domain:"
}
```

Possible error messages:

| Error | Cause |
|-------|-------|
| `Invalid domain: <hostname>` | Unsupported protocol or missing hostname |
| `No certificate found in domain:` | Domain unreachable or no certificate present |
| `Request timeout while fetching certificate:` | Connection timed out (10s default) |

## Use Cases

- SSL certificate monitoring and alerting
- Automated expiry checks in CI/CD pipelines
- Domain security auditing
- Certificate chain inspection
- Self-signed certificate detection

## License

MIT
