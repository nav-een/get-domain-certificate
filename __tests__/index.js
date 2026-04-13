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

describe('Google Certificate Baseline Check', () => {
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

// Unit tests for error cases and edge cases with mocked https
describe('Unit Tests - Invalid Domain (Line 15)', () => {
    it('should reject when protocol is not https', async () => {
        await expect(getDomainCertificate('ftp://example.com')).rejects.toEqual(
            expect.objectContaining({ message: expect.stringContaining('Invalid domain') })
        );
    });
});

describe('Unit Tests - Network Errors and Certificate Issues (Lines 34, 46)', () => {
    let httpsMock;

    beforeEach(() => {
        // Save original https module
        httpsMock = require('https');
        jest.clearAllMocks();
    });

    it('should reject when getPeerCertificate returns null (Line 34)', (done) => {
        const mockSocket = { getPeerCertificate: () => null };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        // Mock https.get to call the callback immediately
        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then(() => {
                done(new Error('Should have rejected'));
            })
            .catch((error) => {
                expect(error.message).toBe('No certificate found in domain:');
                expect(error.hostname).toBe('example.com');
                jest.restoreAllMocks();
                done();
            });
    });

    it('should reject on https.get error (Line 46)', (done) => {
        const mockRequest = {
            on: jest.fn(function(event, callback) {
                if (event === 'error') {
                    setImmediate(() => callback(new Error('Network error')));
                }
                return mockRequest;
            }),
            destroy: jest.fn()
        };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then(() => {
                done(new Error('Should have rejected'));
            })
            .catch((error) => {
                expect(error.message).toBe('No certificate found in domain:');
                expect(error.hostname).toBe('example.com');
                jest.restoreAllMocks();
                done();
            });
    });
});

describe('Unit Tests - Self-Signed Certificate (Line 61)', () => {
    it('should detect self-signed certificate when subject.CN equals issuer.CN', (done) => {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'example.com' },
            valid_to: futureDate,
            raw: Buffer.from('test')
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.selfSigned).toBe(true);
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });

    it('should detect non-self-signed certificate when CNs differ', (done) => {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA Authority' },
            valid_to: futureDate,
            raw: Buffer.from('test')
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.selfSigned).toBe(false);
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });
});

describe('Unit Tests - Expired Certificate (Line 71)', () => {
    it('should mark certificate as expired when valid_to is in the past', (done) => {
        const expiredDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toUTCString();
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA' },
            valid_to: expiredDate,
            raw: Buffer.from('test')
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.expired).toBe(true);
                expect(result.daysToExpiry).toBeLessThanOrEqual(0);
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });

    it('should mark certificate as not expired when valid_to is in the future', (done) => {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA' },
            valid_to: futureDate,
            raw: Buffer.from('test')
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.expired).toBe(false);
                expect(result.daysToExpiry).toBeGreaterThan(0);
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });

    it('should not set expired property when valid_to is missing (Line 66)', (done) => {
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA' },
            raw: Buffer.from('test')
            // valid_to is intentionally missing
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.expired).toBeUndefined();
                expect(result.daysToExpiry).toBeUndefined();
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });
});

describe('Unit Tests - PEM Certificate Property (Line 75)', () => {
    it('should not set PEM property when raw certificate data is missing', (done) => {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA' },
            valid_to: futureDate
            // raw is intentionally missing
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.PEM).toBeUndefined();
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });

    it('should set PEM property when raw certificate data exists', (done) => {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA' },
            valid_to: futureDate,
            raw: Buffer.from('ABCDEFGHIJKLMNOP')
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.PEM).toBeDefined();
                expect(result.PEM).toContain('-----BEGIN CERTIFICATE-----');
                expect(result.PEM).toContain('-----END CERTIFICATE-----');
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });
});

describe('Unit Tests - Recursion Depth Guard (Line 7)', () => {
    it('should reject when maximum recursion depth is exceeded', async () => {
        // Call with depth > 2 directly to test the guard
        await expect(getDomainCertificate('example.com', 3))
            .rejects.toEqual({ message: "Maximum recursion depth exceeded while normalizing domain" });
    });
});

describe('Unit Tests - Request Timeout (Lines 64-65)', () => {
    it('should reject and destroy socket on timeout', (done) => {
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            setImmediate(() => {
                const timeoutHandler = mockRequest.on.mock.calls.find(c => c[0] === 'timeout');
                if (timeoutHandler) timeoutHandler[1]();
            });
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then(() => {
                done(new Error('Should have rejected'));
            })
            .catch((error) => {
                expect(error.message).toBe('Request timeout while fetching certificate:');
                expect(error.hostname).toBe('example.com');
                expect(mockRequest.destroy).toHaveBeenCalled();
                jest.restoreAllMocks();
                done();
            });
    });
});

describe('Unit Tests - parsePEM Null Safety (Line 76)', () => {
    it('should handle empty raw certificate data', (done) => {
        const mockCertificate = {
            subject: { CN: 'example.com' },
            issuer: { CN: 'CA' },
            valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(),
            raw: Buffer.from('')
        };
        const mockSocket = { getPeerCertificate: () => mockCertificate };
        const mockResponse = { socket: mockSocket };
        const mockRequest = { on: jest.fn().mockReturnThis(), destroy: jest.fn() };

        jest.spyOn(require('https'), 'get').mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        getDomainCertificate('https://example.com')
            .then((result) => {
                expect(result.PEM).toBe('-----BEGIN CERTIFICATE-----\n\n-----END CERTIFICATE-----');
                jest.restoreAllMocks();
                done();
            })
            .catch((error) => {
                jest.restoreAllMocks();
                done(error);
            });
    });
});

