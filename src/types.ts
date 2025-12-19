/**
 * DataHorders CDN API TypeScript SDK - Type Definitions
 * @packageDocumentation
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Pagination metadata included in list responses
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

/**
 * Base API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown> | Array<{ path: string[]; message: string }>;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails | string;
}

// ============================================================================
// Domain Types
// ============================================================================

/**
 * Zone reference in domain response
 */
export interface DomainZoneReference {
  zone: {
    id: string;
    name: string;
  };
}

/**
 * Domain entity
 */
export interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  healthCheckEnabled: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  zones?: DomainZoneReference[];
}

/**
 * Domain verification information
 */
export interface DomainVerification {
  code: string;
  instructions: string;
}

/**
 * Response from domain registration
 */
export interface DomainCreateResponse {
  domain: Domain;
  verification: DomainVerification;
}

/**
 * Parameters for creating a domain
 */
export interface DomainCreateParams {
  domain: string;
  healthCheckEnabled?: boolean;
}

/**
 * Parameters for listing domains
 */
export interface DomainListParams extends PaginationParams {
  verified?: boolean;
}

/**
 * Response from domain verification
 */
export interface DomainVerifyResponse {
  verified: boolean;
  message: string;
}

/**
 * Parameters for verifying a domain
 */
export interface DomainVerifyParams {
  domain?: string;
  id?: string;
}

/**
 * Response from domain deletion
 */
export interface DomainDeleteResponse {
  id: string;
  deleted: boolean;
}

// ============================================================================
// Zone Types
// ============================================================================

/**
 * Load balancing methods for upstream servers
 */
export type LoadBalanceMethod = 'round_robin' | 'least_conn' | 'ip_hash';

/**
 * Server protocol types
 */
export type ServerProtocol = 'http' | 'https';

/**
 * Upstream server configuration
 */
export interface UpstreamServer {
  id?: string;
  name?: string;
  address: string;
  port?: number;
  protocol?: ServerProtocol;
  weight?: number;
  backup?: boolean;
  healthCheckPath?: string;
  healthCheckConnectTimeout?: number | null;
  healthCheckTimeout?: number | null;
  healthCheckRetries?: number | null;
  region?: string | null;
  country?: string | null;
  upstreamId?: string;
}

/**
 * Upstream configuration
 */
export interface Upstream {
  id: string;
  name: string;
  loadBalanceMethod: LoadBalanceMethod;
  servers: UpstreamServer[];
}

/**
 * Upstream configuration for zone creation/update
 */
export interface UpstreamConfig {
  loadBalanceMethod?: LoadBalanceMethod;
  servers: UpstreamServer[];
}

/**
 * Domain reference in zone response
 */
export interface ZoneDomainReference {
  domainId: string;
  isPrimary: boolean;
  domain: {
    id: string;
    domain: string;
    verified: boolean;
  };
}

/**
 * Certificate reference in zone response
 */
export interface ZoneCertificateReference {
  id: string;
  name: string;
  provider: CertificateProvider;
  status: CertificateStatus;
  expiresAt: string;
  domains: Array<{ domain: string }>;
}

/**
 * Health status aggregation
 */
export interface HealthStatus {
  healthy: number;
  unhealthy: number;
  disabled: number;
  total: number;
}

/**
 * Zone entity
 */
export interface Zone {
  id: string;
  name: string;
  upgradeInsecure: boolean;
  fourKFallback: boolean;
  healthCheckEnabled: boolean;
  userId: string;
  certificateId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  domains: ZoneDomainReference[];
  upstream: Upstream;
  certificate?: ZoneCertificateReference | null;
  healthStatus?: HealthStatus;
}

/**
 * Parameters for creating a zone
 */
export interface ZoneCreateParams {
  name: string;
  domains: string[];
  certificateId?: string;
  upgradeInsecure?: boolean;
  fourKFallback?: boolean;
  healthCheckEnabled?: boolean;
  upstream: UpstreamConfig;
}

/**
 * Parameters for updating a zone
 */
export interface ZoneUpdateParams {
  name?: string;
  domains?: string[];
  certificateId?: string | null;
  forceCertificateRemoval?: boolean;
  upgradeInsecure?: boolean;
  fourKFallback?: boolean;
  healthCheckEnabled?: boolean;
  upstream?: UpstreamConfig;
}

/**
 * Parameters for listing zones
 */
export interface ZoneListParams extends PaginationParams {
  domain?: string;
}

/**
 * Response from zone deletion
 */
export interface ZoneDeleteResponse {
  id: string;
  deleted: boolean;
  message: string;
}

// ============================================================================
// Certificate Types
// ============================================================================

/**
 * Certificate provider types
 */
export type CertificateProvider = 'manual' | 'acme';

/**
 * ACME certificate providers
 */
export type AcmeProvider = 'letsencrypt' | 'zerossl' | 'google';

/**
 * Certificate status values
 */
export type CertificateStatus = 'pending' | 'active' | 'failed' | 'expired' | 'error';

/**
 * Certificate domain reference
 */
export interface CertificateDomain {
  domain: string;
}

/**
 * Certificate entity
 */
export interface Certificate {
  id: string;
  name: string;
  provider: CertificateProvider;
  acmeProvider?: AcmeProvider;
  status: CertificateStatus;
  autoRenew: boolean;
  isWildcard: boolean;
  email?: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  domains: CertificateDomain[];
}

/**
 * Parameters for creating a manual certificate
 */
export interface CertificateCreateManualParams {
  name: string;
  provider: 'manual';
  domains?: string[];
  certContent: string;
  keyContent: string;
  autoRenew?: boolean;
  force?: boolean;
}

/**
 * Parameters for creating an ACME certificate
 */
export interface CertificateCreateAcmeParams {
  name: string;
  domains: string[];
  email: string;
  acmeProvider?: AcmeProvider;
  autoRenew?: boolean;
  force?: boolean;
}

/**
 * Parameters for creating a simple ACME certificate
 */
export interface CertificateCreateSimpleParams {
  domain: string;
}

/**
 * Parameters for updating a certificate
 */
export interface CertificateUpdateParams {
  name?: string;
  autoRenew?: boolean;
  certContent?: string;
  keyContent?: string;
}

/**
 * Parameters for listing certificates
 */
export interface CertificateListParams extends PaginationParams {
  status?: CertificateStatus;
}

/**
 * Response from certificate deletion
 */
export interface CertificateDeleteResponse {
  domain: string;
  deleted: boolean;
}

/**
 * ACME certificate status response
 */
export interface AcmeCertificateStatus {
  certificateId: string;
  name?: string;
  status: CertificateStatus;
  progress: number;
  message: string;
  domains: string[];
  createdAt?: string;
  expiresAt?: string | null;
}

/**
 * Response from ACME certificate creation
 */
export interface AcmeCertificateCreateResponse {
  id: string;
  name: string;
  provider: 'acme';
  status: 'pending';
  domains: string[];
  message: string;
}

// ============================================================================
// Health Check Types
// ============================================================================

/**
 * Health check protocols
 */
export type HealthCheckProtocol = 'http' | 'https' | 'tcp';

/**
 * Health check HTTP methods
 */
export type HealthCheckMethod = 'HEAD' | 'GET' | 'POST';

/**
 * Health check profile entity
 */
export interface HealthCheckProfile {
  id: string;
  name: string;
  description?: string | null;
  protocol: HealthCheckProtocol;
  port: number;
  path: string;
  method: HealthCheckMethod;
  expectedStatusCodes: string;
  expectedResponseText?: string | null;
  checkInterval: number;
  timeout: number;
  retries: number;
  followRedirects: boolean;
  verifySSL: boolean;
  customHeaders?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  serverCount?: number;
}

/**
 * Parameters for creating a health check profile
 */
export interface HealthCheckProfileCreateParams {
  name: string;
  description?: string;
  protocol?: HealthCheckProtocol;
  port?: number;
  path?: string;
  method?: HealthCheckMethod;
  expectedStatusCodes?: string;
  expectedResponseText?: string;
  checkInterval?: number;
  timeout?: number;
  retries?: number;
  followRedirects?: boolean;
  verifySSL?: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * Parameters for updating a health check profile
 */
export interface HealthCheckProfileUpdateParams extends Partial<HealthCheckProfileCreateParams> {}

/**
 * Parameters for listing health check profiles
 */
export interface HealthCheckProfileListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Response from listing health check profiles
 */
export interface HealthCheckProfileListResponse {
  success: boolean;
  profiles: HealthCheckProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Health check action types
 */
export type HealthCheckAction = 'enable' | 'disable';

/**
 * Parameters for toggling server health checks
 */
export interface HealthCheckToggleParams {
  serverId: string;
  action: HealthCheckAction;
  reason?: string;
}

/**
 * Response from toggling health checks
 */
export interface HealthCheckToggleResponse {
  success: boolean;
  message: string;
  serverId: string;
  action: HealthCheckAction;
  reason?: string;
}

/**
 * CDN node entity
 */
export interface CdnNode {
  id: string;
  domain: string;
  ipAddress: string;
  type: string;
  port: number;
  resourcePath: string;
}

// ============================================================================
// WAF Types
// ============================================================================

/**
 * WAF operation modes
 */
export type WafMode = 'log_only' | 'blocking';

/**
 * WAF rule types
 */
export type WafRuleType = 'pattern' | 'ip_allow' | 'ip_block' | 'country' | 'asn' | 'sqli' | 'xss' | 'rate_limit';

/**
 * WAF match targets
 */
export type WafMatchTarget = 'uri' | 'query' | 'headers' | 'body' | 'cookies' | 'user_agent' | 'ip' | 'country' | 'asn' | 'method';

/**
 * WAF rule actions
 */
export type WafAction = 'allow' | 'block' | 'log' | 'challenge' | 'rate_limit' | 'tarpit';

/**
 * WAF severity levels
 */
export type WafSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * WAF rule entity
 */
export interface WafRule {
  id: string;
  zoneConfigId: string;
  name: string;
  description?: string | null;
  ruleType: WafRuleType;
  matchTarget: WafMatchTarget;
  matchPattern: string;
  action: WafAction;
  severity: WafSeverity;
  enabled: boolean;
  priority: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * WAF IP list types
 */
export type WafIpListType = 'allow' | 'block';

/**
 * WAF IP list entry
 */
export interface WafIpEntry {
  id: string;
  zoneConfigId: string;
  listType: WafIpListType;
  ipAddress: string;
  reason?: string | null;
  expiresAt?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * WAF geo action types
 */
export type WafGeoAction = 'block' | 'challenge' | 'log';

/**
 * WAF country rule
 */
export interface WafCountryRule {
  id: string;
  zoneConfigId: string;
  countryCode: string;
  action: WafGeoAction;
  reason?: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * WAF ASN rule
 */
export interface WafAsnRule {
  id: string;
  zoneConfigId: string;
  asn: number;
  asnName?: string | null;
  action: WafGeoAction;
  reason?: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * WAF configuration entity
 */
export interface WafConfig {
  id: string;
  zoneId: string;
  enabled: boolean;
  mode: WafMode;
  customBlockPage?: string | null;
  inheritGlobalRules: boolean;
  sqliDetection: boolean;
  xssDetection: boolean;
  createdAt: string;
  updatedAt: string;
  zoneRules?: WafRule[];
  ipLists?: WafIpEntry[];
  countryRules?: WafCountryRule[];
  asnRules?: WafAsnRule[];
}

/**
 * WAF statistics
 */
export interface WafStats {
  totalRules: number;
  activeRules: number;
  blockedIps: number;
  allowedIps: number;
  countryRules: number;
  asnRules: number;
}

/**
 * WAF configuration response
 */
export interface WafConfigResponse {
  config: WafConfig;
  stats: WafStats;
}

/**
 * Parameters for updating WAF configuration
 */
export interface WafConfigUpdateParams {
  enabled?: boolean;
  mode?: WafMode;
  customBlockPage?: string | null;
  inheritGlobalRules?: boolean;
  sqliDetection?: boolean;
  xssDetection?: boolean;
}

/**
 * Parameters for creating a WAF rule
 */
export interface WafRuleCreateParams {
  name: string;
  description?: string;
  ruleType: WafRuleType;
  matchTarget: WafMatchTarget;
  matchPattern: string;
  action: WafAction;
  severity?: WafSeverity;
  enabled?: boolean;
  priority?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a WAF rule
 */
export interface WafRuleUpdateParams extends Partial<WafRuleCreateParams> {}

/**
 * Parameters for listing WAF rules
 */
export interface WafRuleListParams extends PaginationParams {
  enabled?: boolean;
  ruleType?: WafRuleType;
  sortBy?: 'priority' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Parameters for creating a WAF IP entry
 */
export interface WafIpCreateParams {
  listType: WafIpListType;
  ipAddress: string;
  reason?: string;
  expiresAt?: string;
}

/**
 * Parameters for updating a WAF IP entry
 */
export interface WafIpUpdateParams {
  reason?: string;
  expiresAt?: string | null;
}

/**
 * Parameters for listing WAF IP entries
 */
export interface WafIpListParams extends PaginationParams {
  listType?: WafIpListType;
  search?: string;
}

/**
 * Parameters for creating a WAF country rule
 */
export interface WafCountryCreateParams {
  countryCode: string;
  action: WafGeoAction;
  reason?: string;
  enabled?: boolean;
}

/**
 * Parameters for updating a WAF country rule
 */
export interface WafCountryUpdateParams {
  action?: WafGeoAction;
  reason?: string;
  enabled?: boolean;
}

/**
 * Parameters for creating a WAF ASN rule
 */
export interface WafAsnCreateParams {
  asn: number;
  asnName?: string;
  action: WafGeoAction;
  reason?: string;
  enabled?: boolean;
}

/**
 * Parameters for updating a WAF ASN rule
 */
export interface WafAsnUpdateParams {
  asnName?: string;
  action?: WafGeoAction;
  reason?: string;
  enabled?: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Zone usage data
 */
export interface ZoneUsage {
  zone: string;
  gigabytes_sent: number;
  requests: number;
}

/**
 * Usage response
 */
export interface UsageResponse {
  total_traffic: {
    gigabytes: number;
  };
  total_zones: number;
  zones: ZoneUsage[];
  date_range: {
    start: string;
    end: string;
  };
}

/**
 * Parameters for getting usage data
 */
export interface UsageParams {
  start_date?: string;
  end_date?: string;
}

// ============================================================================
// SDK Configuration Types
// ============================================================================

/**
 * SDK client configuration options
 */
export interface DataHordersCDNConfig {
  /**
   * API key for authentication
   */
  apiKey: string;

  /**
   * Base URL for the API (default: https://dashboard.datahorders.org/api/user/v1)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;

  /**
   * Custom headers to include with every request
   */
  headers?: Record<string, string>;
}
