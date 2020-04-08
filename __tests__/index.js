const getDomainCertificate = require('../index')
var googleCertificate = {};
var githubCertificate = {};

beforeAll(async () => {
    return Promise.all([
        getDomainCertificate('google.com')
        .then((certificate) => {
            googleCertificate = certificate;
        })
        .catch(console.error),

        getDomainCertificate('http://github.com')
        .then((certificate) => {
            githubCertificate = certificate;
        })
        .catch(console.error)
    ])
});


describe('Github Certificate Baseline Check', () => {
    it('not expired', () => {
        expect(githubCertificate.expired).toBe(false);
    });

    it('not self-signed', () => {
        expect(githubCertificate.selfSigned).toBe(false);
    });

    it('not enough days left', () => {
        expect(githubCertificate.daysToExpiry).toBeGreaterThan(0);
    });

    it('subject CN is defined', () => {
        expect(githubCertificate.subject.CN).toBeDefined()
    });

    it('issuer CN is defined', () => {
        expect(githubCertificate.issuer.CN).toBeDefined()
    });

});

describe('Goolgle Certificate Baseline Check', () => {
    it('not expired', () => {
        expect(googleCertificate.expired).toBe(false);
    });

    it('not self-signed', () => {
        expect(googleCertificate.selfSigned).toBe(false);
    });

    it('not enough days left', () => {
        expect(googleCertificate.daysToExpiry).toBeGreaterThan(0);
    });

    it('subject CN is defined', () => {
        expect(googleCertificate.subject.CN).toBeDefined()
    });

    it('issuer CN is defined', () => {
        expect(googleCertificate.issuer.CN).toBeDefined()
    });

});