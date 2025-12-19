# DataHorders CDN SDK for TypeScript

Official TypeScript/JavaScript SDK for the DataHorders CDN API. This SDK provides a type-safe, intuitive interface for managing domains, zones, SSL/TLS certificates, WAF configuration, and analytics.

## Installation

```bash
npm install @datahorders/cdn-sdk
```

Or with other package managers:

```bash
# Yarn
yarn add @datahorders/cdn-sdk

# pnpm
pnpm add @datahorders/cdn-sdk
```

## Quick Start

```typescript
import { DataHordersCDN } from '@datahorders/cdn-sdk';

// Initialize the client with your API key
const client = new DataHordersCDN('your-api-key');

// List all domains
const { data: domains } = await client.domains.list();
console.log(domains);
```

## Configuration

You can configure the client with additional options:

```typescript
import { DataHordersCDN } from '@datahorders/cdn-sdk';

const client = new DataHordersCDN({
  apiKey: 'your-api-key',
  baseUrl: 'https://dashboard.datahorders.org/api/user/v1', // Optional: custom API base URL
  timeout: 30000, // Optional: request timeout in milliseconds
  headers: { // Optional: custom headers
    'X-Custom-Header': 'value'
  }
});
```

## API Reference

### Domains

Manage domain registrations and verification.

```typescript
// List all domains
const { data: domains, meta } = await client.domains.list({
  page: 1,
  perPage: 20,
  verified: true
});

// Get a specific domain
const domain = await client.domains.get('dom_abc123');

// Register a new domain
const { domain: newDomain, verification } = await client.domains.create({
  domain: 'example.com',
  healthCheckEnabled: false
});
console.log('Add this TXT record:', verification.code);

// Verify domain ownership
const result = await client.domains.verify({ domain: 'example.com' });
console.log('Verified:', result.verified);

// Delete a domain
await client.domains.delete('dom_abc123');
```

### Zones

Create and manage reverse proxy zones.

```typescript
// List all zones
const { data: zones } = await client.zones.list({
  domain: 'example.com'
});

// Get a zone by ID
const zone = await client.zones.get('zone_abc123');

// Get a zone by FQDN
const zoneByFqdn = await client.zones.getByFqdn('app.example.com');

// Create a new zone
const newZone = await client.zones.create({
  name: 'app',
  domains: ['dom_abc123'],
  upgradeInsecure: true,
  healthCheckEnabled: true,
  upstream: {
    loadBalanceMethod: 'round_robin',
    servers: [
      {
        name: 'backend-1',
        address: '10.0.1.100',
        port: 8080,
        protocol: 'http',
        weight: 1,
        healthCheckPath: '/health'
      },
      {
        name: 'backend-2',
        address: '10.0.1.101',
        port: 8080,
        protocol: 'http',
        weight: 1,
        backup: true,
        healthCheckPath: '/health'
      }
    ]
  }
});

// Update a zone
const updatedZone = await client.zones.update('zone_abc123', {
  healthCheckEnabled: true,
  upstream: {
    loadBalanceMethod: 'least_conn',
    servers: [/* ... */]
  }
});

// Delete a zone
await client.zones.delete('zone_abc123');
```

### Upstream Servers

Manage backend servers for a zone.

```typescript
// List servers in a zone's upstream
const servers = await client.upstreamServers.list('zone_abc123');

// Add a server
const server = await client.upstreamServers.create('zone_abc123', {
  name: 'backend-3',
  address: '10.0.1.102',
  port: 8080,
  protocol: 'http',
  weight: 1,
  healthCheckPath: '/health'
});

// Update a server
await client.upstreamServers.update('zone_abc123', 'srv_abc123', {
  weight: 3,
  backup: false
});

// Remove a server
await client.upstreamServers.delete('zone_abc123', 'srv_abc123');
```

### Certificates

Manage SSL/TLS certificates.

```typescript
// List certificates
const { data: certs } = await client.certificates.list({
  status: 'active'
});

// Get certificate by domain
const cert = await client.certificates.getByDomain('example.com');

// Upload a manual certificate
const manualCert = await client.certificates.createManual({
  name: 'example.com SSL',
  provider: 'manual',
  certContent: '-----BEGIN CERTIFICATE-----\n...',
  keyContent: '-----BEGIN PRIVATE KEY-----\n...'
});

// Create a simple ACME certificate
const { certificate } = await client.certificates.createSimple({
  domain: 'example.com'
});

// Update certificate settings
await client.certificates.update('example.com', {
  autoRenew: true
});

// Download certificate as ZIP
const blob = await client.certificates.download('cert_abc123');

// Delete a certificate
await client.certificates.delete('example.com');
```

### ACME Certificates

Automated certificate issuance via Let's Encrypt and other ACME providers.

```typescript
// Request a new ACME certificate
const acmeCert = await client.acmeCertificates.create({
  name: 'example.com Wildcard',
  domains: ['example.com', '*.example.com'],
  email: 'admin@example.com',
  acmeProvider: 'letsencrypt', // 'letsencrypt', 'zerossl', or 'google'
  autoRenew: true
});

// Check certificate status
const status = await client.acmeCertificates.getStatus(acmeCert.id);
console.log(`Status: ${status.status}, Progress: ${status.progress}%`);

// Wait for certificate to become active (with polling)
const activeCert = await client.acmeCertificates.waitForActive(acmeCert.id, {
  pollInterval: 10000, // Check every 10 seconds
  timeout: 300000     // Timeout after 5 minutes
});

// List all ACME certificates
const acmeCerts = await client.acmeCertificates.list();
```

### Health Checks

Configure and monitor backend health.

```typescript
// List health check profiles
const { profiles } = await client.healthChecks.listProfiles({
  search: 'api'
});

// Create a health check profile
const { profile } = await client.healthChecks.createProfile({
  name: 'API Health Check',
  protocol: 'https',
  port: 443,
  path: '/api/health',
  method: 'GET',
  expectedStatusCodes: '200',
  expectedResponseText: 'healthy',
  checkInterval: 15,
  timeout: 5,
  retries: 3,
  verifySSL: true
});

// Update a profile
await client.healthChecks.updateProfile('profile_abc123', {
  checkInterval: 30
});

// Delete a profile
await client.healthChecks.deleteProfile('profile_abc123');

// Toggle health checks for a server
await client.healthChecks.toggleServerHealthCheck({
  serverId: 'srv_abc123',
  action: 'disable',
  reason: 'Scheduled maintenance'
});

// List CDN nodes
const nodes = await client.healthChecks.listCdnNodes();
```

### WAF (Web Application Firewall)

Configure WAF protection at the zone level.

```typescript
// Get WAF configuration
const { config, stats } = await client.waf.getConfig('zone_abc123');
console.log(`WAF ${config.enabled ? 'enabled' : 'disabled'}, Mode: ${config.mode}`);
console.log(`Active rules: ${stats.activeRules}, Blocked IPs: ${stats.blockedIps}`);

// Update WAF configuration
await client.waf.updateConfig('zone_abc123', {
  enabled: true,
  mode: 'blocking', // 'log_only' or 'blocking'
  sqliDetection: true,
  xssDetection: true,
  inheritGlobalRules: true
});
```

#### WAF Rules

```typescript
// List WAF rules
const { data: rules } = await client.waf.rules.list('zone_abc123', {
  enabled: true,
  ruleType: 'pattern',
  sortBy: 'priority'
});

// Create a WAF rule
const rule = await client.waf.rules.create('zone_abc123', {
  name: 'Block Admin Access',
  ruleType: 'pattern',
  matchTarget: 'uri',
  matchPattern: '^/admin',
  action: 'block',
  severity: 'high',
  priority: 100
});

// Update a rule
await client.waf.rules.update('zone_abc123', 'rule_abc123', {
  enabled: false
});

// Delete a rule
await client.waf.rules.delete('zone_abc123', 'rule_abc123');
```

#### WAF IP Lists

```typescript
// List IP entries
const { data: ipEntries } = await client.waf.ipLists.list('zone_abc123', {
  listType: 'block'
});

// Block an IP
const blockedIp = await client.waf.ipLists.create('zone_abc123', {
  listType: 'block',
  ipAddress: '198.51.100.50',
  reason: 'Malicious scanner',
  expiresAt: '2024-12-31T23:59:59Z' // Optional expiration
});

// Whitelist a CIDR range
await client.waf.ipLists.create('zone_abc123', {
  listType: 'allow',
  ipAddress: '203.0.113.0/24',
  reason: 'Office network'
});

// Update an IP entry
await client.waf.ipLists.update('zone_abc123', 'ip_abc123', {
  expiresAt: null // Remove expiration (permanent)
});

// Remove an IP entry
await client.waf.ipLists.delete('zone_abc123', 'ip_abc123');
```

#### WAF Geo-blocking

```typescript
// List country rules
const countries = await client.waf.geo.listCountries('zone_abc123');

// Block a country
await client.waf.geo.createCountry('zone_abc123', {
  countryCode: 'CN',
  action: 'block',
  reason: 'High attack volume'
});

// Challenge traffic from a country
await client.waf.geo.createCountry('zone_abc123', {
  countryCode: 'RU',
  action: 'challenge',
  reason: 'Additional verification'
});

// Update a country rule
await client.waf.geo.updateCountry('zone_abc123', 'country_abc123', {
  action: 'log'
});

// Delete a country rule
await client.waf.geo.deleteCountry('zone_abc123', 'country_abc123');

// ASN rules
const asns = await client.waf.geo.listAsns('zone_abc123');

await client.waf.geo.createAsn('zone_abc123', {
  asn: 12345,
  asnName: 'Bad Hosting Provider',
  action: 'block',
  reason: 'Known source of abuse'
});

await client.waf.geo.updateAsn('zone_abc123', 'asn_abc123', {
  action: 'challenge'
});

await client.waf.geo.deleteAsn('zone_abc123', 'asn_abc123');
```

### Analytics

Access traffic metrics and usage data.

```typescript
// Get usage for current billing period
const usage = await client.analytics.getUsage();
console.log(`Total traffic: ${usage.total_traffic.gigabytes} GB`);

for (const zone of usage.zones) {
  console.log(`${zone.zone}: ${zone.gigabytes_sent} GB, ${zone.requests} requests`);
}

// Get usage for specific date range
const monthlyUsage = await client.analytics.getUsage({
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});

// List CDN nodes
const nodes = await client.analytics.listCdnNodes();
for (const node of nodes) {
  console.log(`${node.domain} (${node.ipAddress})`);
}
```

## Error Handling

The SDK throws `DataHordersCDNError` for API errors:

```typescript
import { DataHordersCDN, DataHordersCDNError } from '@datahorders/cdn-sdk';

const client = new DataHordersCDN('your-api-key');

try {
  await client.domains.create({ domain: 'example.com' });
} catch (error) {
  if (error instanceof DataHordersCDNError) {
    console.error('API Error:', error.message);
    console.error('Code:', error.code);      // e.g., 'DOMAIN_EXISTS'
    console.error('Status:', error.status);  // HTTP status code
    console.error('Details:', error.details); // Additional error details
  } else {
    throw error;
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTH_REQUIRED` | Authentication is required |
| `NOT_FOUND` | Resource not found |
| `DOMAIN_EXISTS` | Domain already registered |
| `DOMAIN_IN_USE` | Domain is used by zones |
| `INVALID_DOMAINS` | One or more domains are invalid |
| `INVALID_CERTIFICATE` | Certificate validation failed |
| `DUPLICATE_DOMAIN_CERTIFICATE` | Certificate already exists for domain |
| `CERTIFICATE_IN_USE` | Certificate is assigned to zones |
| `DUPLICATE_IP` | IP already in list |
| `RULE_EXISTS` | WAF rule already exists |
| `TIMEOUT` | Request timed out |
| `NETWORK_ERROR` | Network connectivity issue |

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions. All API methods are fully typed:

```typescript
import type {
  Domain,
  Zone,
  Certificate,
  WafConfig,
  UpstreamServer
} from '@datahorders/cdn-sdk';

// Types are automatically inferred
const { data: domains } = await client.domains.list();
// domains is Domain[]

const zone = await client.zones.get('zone_abc123');
// zone is Zone
```

## Requirements

- Node.js 18.0.0 or later
- A DataHorders CDN account and API key

## License

MIT License - see LICENSE file for details.

## Support

- [Documentation](https://wiki.datahorders.org/docs/api/overview)
- [Issues](https://github.com/datahorders/cdn-typescript-sdk/issues)
