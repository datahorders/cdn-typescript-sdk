/**
 * DataHorders CDN API TypeScript SDK
 *
 * A type-safe SDK for interacting with the DataHorders CDN API.
 *
 * @packageDocumentation
 */

import type {
  DataHordersCDNConfig,
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  // Domain types
  Domain,
  DomainCreateParams,
  DomainCreateResponse,
  DomainListParams,
  DomainVerifyParams,
  DomainVerifyResponse,
  DomainDeleteResponse,
  // Zone types
  Zone,
  ZoneCreateParams,
  ZoneUpdateParams,
  ZoneListParams,
  ZoneDeleteResponse,
  // Upstream types
  UpstreamServer,
  // Certificate types
  Certificate,
  CertificateCreateManualParams,
  CertificateCreateAcmeParams,
  CertificateCreateSimpleParams,
  CertificateUpdateParams,
  CertificateListParams,
  CertificateDeleteResponse,
  AcmeCertificateStatus,
  AcmeCertificateCreateResponse,
  // Health check types
  HealthCheckProfile,
  HealthCheckProfileCreateParams,
  HealthCheckProfileUpdateParams,
  HealthCheckProfileListParams,
  HealthCheckProfileListResponse,
  HealthCheckToggleParams,
  HealthCheckToggleResponse,
  CdnNode,
  // WAF types
  WafConfigResponse,
  WafConfigUpdateParams,
  WafRule,
  WafRuleCreateParams,
  WafRuleUpdateParams,
  WafRuleListParams,
  WafIpEntry,
  WafIpCreateParams,
  WafIpUpdateParams,
  WafIpListParams,
  WafCountryRule,
  WafCountryCreateParams,
  WafCountryUpdateParams,
  WafAsnRule,
  WafAsnCreateParams,
  WafAsnUpdateParams,
  // Analytics types
  UsageResponse,
  UsageParams,
} from './types';

// Re-export all types
export * from './types';

/**
 * Custom error class for API errors
 */
export class DataHordersCDNError extends Error {
  /**
   * Error code from the API
   */
  public readonly code: string;

  /**
   * HTTP status code
   */
  public readonly status: number;

  /**
   * Additional error details
   */
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'DataHordersCDNError';
    this.code = code;
    this.status = status;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

/**
 * Default API base URL
 */
const DEFAULT_BASE_URL = 'https://dashboard.datahorders.org/api/user/v1';

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * HTTP client for making API requests
 */
class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly customHeaders: Record<string, string>;

  constructor(config: DataHordersCDNConfig) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.customHeaders = config.headers ?? {};
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      responseType?: 'json' | 'blob';
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    // Add query parameters
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
      ...this.customHeaders,
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url.toString(), fetchOptions);

      clearTimeout(timeoutId);

      // Handle binary responses (e.g., certificate download)
      if (options.responseType === 'blob') {
        if (!response.ok) {
          const errorText = await response.text();
          throw new DataHordersCDNError(
            errorText || 'Request failed',
            'REQUEST_FAILED',
            response.status
          );
        }
        return response.blob() as unknown as T;
      }

      const data = (await response.json()) as ApiResponse<T> | ApiErrorResponse;

      if (!response.ok || !data.success) {
        const errorResponse = data as ApiErrorResponse;
        const error = typeof errorResponse.error === 'string'
          ? { code: 'API_ERROR', message: errorResponse.error }
          : errorResponse.error;

        throw new DataHordersCDNError(
          error.message,
          error.code,
          response.status,
          error.details as Record<string, unknown> | undefined
        );
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DataHordersCDNError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new DataHordersCDNError(
            'Request timeout',
            'TIMEOUT',
            0
          );
        }
        throw new DataHordersCDNError(
          error.message,
          'NETWORK_ERROR',
          0
        );
      }

      throw new DataHordersCDNError(
        'Unknown error occurred',
        'UNKNOWN_ERROR',
        0
      );
    }
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const options: { params?: Record<string, string | number | boolean | undefined> } = {};
    if (params !== undefined) {
      options.params = params;
    }
    return this.request<T>('GET', path, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const options: { body?: unknown; params?: Record<string, string | number | boolean | undefined> } = {};
    if (body !== undefined) {
      options.body = body;
    }
    if (params !== undefined) {
      options.params = params;
    }
    return this.request<T>('POST', path, options);
  }

  async put<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const options: { body?: unknown; params?: Record<string, string | number | boolean | undefined> } = {};
    if (body !== undefined) {
      options.body = body;
    }
    if (params !== undefined) {
      options.params = params;
    }
    return this.request<T>('PUT', path, options);
  }

  async patch<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const options: { body?: unknown; params?: Record<string, string | number | boolean | undefined> } = {};
    if (body !== undefined) {
      options.body = body;
    }
    if (params !== undefined) {
      options.params = params;
    }
    return this.request<T>('PATCH', path, options);
  }

  async delete<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const options: { params?: Record<string, string | number | boolean | undefined> } = {};
    if (params !== undefined) {
      options.params = params;
    }
    return this.request<T>('DELETE', path, options);
  }

  async download(path: string): Promise<Blob> {
    return this.request<Blob>('GET', path, { responseType: 'blob' });
  }
}

/**
 * Domain management API
 */
class DomainsApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all domains with optional filtering and pagination
   */
  async list(params?: DomainListParams): Promise<{ data: Domain[]; meta: PaginationMeta }> {
    const response = await this.client.get<ApiResponse<Domain[]>>('/domains', {
      page: params?.page,
      perPage: params?.perPage,
      verified: params?.verified?.toString(),
    });
    return { data: response.data, meta: response.meta ?? { total: response.data.length, page: 1, perPage: response.data.length, totalPages: 1 } };
  }

  /**
   * Get a specific domain by ID
   */
  async get(id: string): Promise<Domain> {
    const response = await this.client.get<ApiResponse<Domain>>('/domains', { id });
    return response.data;
  }

  /**
   * Register a new domain
   */
  async create(params: DomainCreateParams): Promise<DomainCreateResponse> {
    const response = await this.client.post<ApiResponse<DomainCreateResponse>>('/domains', params);
    return response.data;
  }

  /**
   * Delete a domain by ID
   */
  async delete(id: string): Promise<DomainDeleteResponse> {
    const response = await this.client.delete<ApiResponse<DomainDeleteResponse>>('/domains', { id });
    return response.data;
  }

  /**
   * Verify domain ownership
   */
  async verify(params: DomainVerifyParams): Promise<DomainVerifyResponse> {
    const response = await this.client.post<ApiResponse<DomainVerifyResponse>>('/domains/verify', params);
    return response.data;
  }
}

/**
 * Zone management API
 */
class ZonesApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all zones with optional filtering and pagination
   */
  async list(params?: ZoneListParams): Promise<{ data: Zone[]; meta: PaginationMeta }> {
    const response = await this.client.get<ApiResponse<Zone[]>>('/zones', {
      page: params?.page,
      perPage: params?.perPage,
      domain: params?.domain,
    });
    return { data: response.data, meta: response.meta ?? { total: response.data.length, page: 1, perPage: response.data.length, totalPages: 1 } };
  }

  /**
   * Get a zone by fully qualified domain name
   */
  async getByFqdn(fqdn: string): Promise<Zone> {
    const response = await this.client.get<ApiResponse<Zone>>('/zones', { fqdn });
    return response.data;
  }

  /**
   * Get a zone by ID
   */
  async get(id: string): Promise<Zone> {
    const response = await this.client.get<ApiResponse<Zone>>(`/zones/${id}`);
    return response.data;
  }

  /**
   * Create a new zone
   */
  async create(params: ZoneCreateParams): Promise<Zone> {
    const response = await this.client.post<ApiResponse<Zone>>('/zones', params);
    return response.data;
  }

  /**
   * Update a zone by FQDN
   */
  async updateByFqdn(fqdn: string, params: ZoneUpdateParams): Promise<Zone> {
    const response = await this.client.patch<ApiResponse<Zone>>('/zones', params, { fqdn });
    return response.data;
  }

  /**
   * Update a zone by ID
   */
  async update(id: string, params: ZoneUpdateParams): Promise<Zone> {
    const response = await this.client.put<ApiResponse<Zone>>(`/zones/${id}`, params);
    return response.data;
  }

  /**
   * Delete a zone by FQDN
   */
  async deleteByFqdn(fqdn: string): Promise<ZoneDeleteResponse> {
    const response = await this.client.delete<ApiResponse<ZoneDeleteResponse>>('/zones', { fqdn });
    return response.data;
  }

  /**
   * Delete a zone by ID
   */
  async delete(id: string): Promise<ZoneDeleteResponse> {
    const response = await this.client.delete<ApiResponse<ZoneDeleteResponse>>(`/zones/${id}`);
    return response.data;
  }
}

/**
 * Upstream server management API
 */
class UpstreamServersApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all servers in a zone's upstream pool
   */
  async list(zoneId: string): Promise<UpstreamServer[]> {
    return this.client.get<UpstreamServer[]>(`/zones/${zoneId}/upstream/servers`);
  }

  /**
   * Add a server to the upstream pool
   */
  async create(zoneId: string, params: Omit<UpstreamServer, 'id' | 'upstreamId'>): Promise<UpstreamServer> {
    return this.client.post<UpstreamServer>(`/zones/${zoneId}/upstream/servers`, params);
  }

  /**
   * Update an upstream server
   */
  async update(zoneId: string, serverId: string, params: Partial<UpstreamServer>): Promise<UpstreamServer> {
    return this.client.put<UpstreamServer>(`/zones/${zoneId}/upstream/servers/${serverId}`, params);
  }

  /**
   * Remove a server from the upstream pool
   */
  async delete(zoneId: string, serverId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/zones/${zoneId}/upstream/servers/${serverId}`);
  }
}

/**
 * Certificate management API
 */
class CertificatesApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all certificates with optional filtering and pagination
   */
  async list(params?: CertificateListParams): Promise<{ data: Certificate[]; meta: PaginationMeta }> {
    const response = await this.client.get<ApiResponse<Certificate[]>>('/certificates', {
      page: params?.page,
      perPage: params?.perPage,
      status: params?.status,
    });
    return { data: response.data, meta: response.meta ?? { total: response.data.length, page: 1, perPage: response.data.length, totalPages: 1 } };
  }

  /**
   * Get a certificate by domain
   */
  async getByDomain(domain: string, includeSensitiveData?: boolean): Promise<Certificate> {
    const response = await this.client.get<ApiResponse<Certificate>>('/certificates', {
      domain,
      includeSensitiveData,
    });
    return response.data;
  }

  /**
   * Create a manual certificate
   */
  async createManual(params: CertificateCreateManualParams): Promise<Certificate> {
    const response = await this.client.post<ApiResponse<Certificate>>('/certificates', params);
    return response.data;
  }

  /**
   * Create a simple ACME certificate (single domain)
   */
  async createSimple(params: CertificateCreateSimpleParams): Promise<{ message: string; certificate: Certificate }> {
    const response = await this.client.post<ApiResponse<{ message: string; certificate: Certificate }>>('/certificates', params);
    return response.data;
  }

  /**
   * Update a certificate
   */
  async update(domain: string, params: CertificateUpdateParams): Promise<Certificate> {
    const response = await this.client.put<ApiResponse<Certificate>>('/certificates', params, { domain });
    return response.data;
  }

  /**
   * Delete a certificate
   */
  async delete(domain: string): Promise<CertificateDeleteResponse> {
    const response = await this.client.delete<ApiResponse<CertificateDeleteResponse>>('/certificates', { domain });
    return response.data;
  }

  /**
   * Download a certificate as a ZIP file
   */
  async download(id: string): Promise<Blob> {
    return this.client.download(`/certificates/${id}/download`);
  }
}

/**
 * ACME Certificate management API
 */
class AcmeCertificatesApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all ACME certificates
   */
  async list(): Promise<AcmeCertificateStatus[]> {
    const response = await this.client.get<ApiResponse<AcmeCertificateStatus[]>>('/certificates/acme');
    return response.data;
  }

  /**
   * Request a new ACME certificate
   */
  async create(params: CertificateCreateAcmeParams): Promise<AcmeCertificateCreateResponse> {
    const response = await this.client.post<ApiResponse<AcmeCertificateCreateResponse>>('/certificates/acme', params);
    return response.data;
  }

  /**
   * Check the status of an ACME certificate
   */
  async getStatus(certificateId: string): Promise<AcmeCertificateStatus> {
    const response = await this.client.get<ApiResponse<AcmeCertificateStatus>>('/certificates/acme', { certificateId });
    return response.data;
  }

  /**
   * Poll for certificate status until active or failed
   */
  async waitForActive(
    certificateId: string,
    options?: { pollInterval?: number; timeout?: number }
  ): Promise<AcmeCertificateStatus> {
    const pollInterval = options?.pollInterval ?? 10000;
    const timeout = options?.timeout ?? 300000; // 5 minutes default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getStatus(certificateId);

      if (status.status === 'active') {
        return status;
      }

      if (status.status === 'failed' || status.status === 'error') {
        throw new DataHordersCDNError(
          status.message || 'Certificate issuance failed',
          'CERTIFICATE_FAILED',
          0
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new DataHordersCDNError(
      'Timeout waiting for certificate to become active',
      'TIMEOUT',
      0
    );
  }
}

/**
 * Health check management API
 */
class HealthChecksApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List health check profiles
   */
  async listProfiles(params?: HealthCheckProfileListParams): Promise<HealthCheckProfileListResponse> {
    return this.client.get<HealthCheckProfileListResponse>('/healthcheck-profiles', {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    });
  }

  /**
   * Get a specific health check profile
   */
  async getProfile(id: string): Promise<{ success: boolean; profile: HealthCheckProfile }> {
    return this.client.get<{ success: boolean; profile: HealthCheckProfile }>(`/healthcheck-profiles/${id}`);
  }

  /**
   * Create a health check profile
   */
  async createProfile(params: HealthCheckProfileCreateParams): Promise<{ success: boolean; profile: HealthCheckProfile }> {
    return this.client.post<{ success: boolean; profile: HealthCheckProfile }>('/healthcheck-profiles', params);
  }

  /**
   * Update a health check profile
   */
  async updateProfile(id: string, params: HealthCheckProfileUpdateParams): Promise<{ success: boolean; profile: HealthCheckProfile }> {
    return this.client.put<{ success: boolean; profile: HealthCheckProfile }>(`/healthcheck-profiles/${id}`, params);
  }

  /**
   * Delete a health check profile
   */
  async deleteProfile(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/healthcheck-profiles/${id}`);
  }

  /**
   * Toggle health checks for a server
   */
  async toggleServerHealthCheck(params: HealthCheckToggleParams): Promise<HealthCheckToggleResponse> {
    return this.client.post<HealthCheckToggleResponse>('/monitoring/health-checks', params);
  }

  /**
   * List CDN nodes
   */
  async listCdnNodes(): Promise<CdnNode[]> {
    return this.client.get<CdnNode[]>('/cdn-nodes');
  }
}

/**
 * WAF Rules API
 */
class WafRulesApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List WAF rules for a zone
   */
  async list(zoneId: string, params?: WafRuleListParams): Promise<{ data: WafRule[]; meta: PaginationMeta }> {
    const response = await this.client.get<ApiResponse<WafRule[]>>(`/zones/${zoneId}/waf/rules`, {
      enabled: params?.enabled?.toString(),
      ruleType: params?.ruleType,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
      page: params?.page,
      perPage: params?.perPage,
    });
    return { data: response.data, meta: response.meta ?? { total: response.data.length, page: 1, perPage: response.data.length, totalPages: 1 } };
  }

  /**
   * Get a specific WAF rule
   */
  async get(zoneId: string, ruleId: string): Promise<WafRule> {
    const response = await this.client.get<ApiResponse<WafRule>>(`/zones/${zoneId}/waf/rules/${ruleId}`);
    return response.data;
  }

  /**
   * Create a WAF rule
   */
  async create(zoneId: string, params: WafRuleCreateParams): Promise<WafRule> {
    const response = await this.client.post<ApiResponse<WafRule>>(`/zones/${zoneId}/waf/rules`, params);
    return response.data;
  }

  /**
   * Update a WAF rule
   */
  async update(zoneId: string, ruleId: string, params: WafRuleUpdateParams): Promise<WafRule> {
    const response = await this.client.put<ApiResponse<WafRule>>(`/zones/${zoneId}/waf/rules/${ruleId}`, params);
    return response.data;
  }

  /**
   * Delete a WAF rule
   */
  async delete(zoneId: string, ruleId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/zones/${zoneId}/waf/rules/${ruleId}`);
  }
}

/**
 * WAF IP Lists API
 */
class WafIpListsApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List IP entries for a zone
   */
  async list(zoneId: string, params?: WafIpListParams): Promise<{ data: WafIpEntry[]; meta: PaginationMeta }> {
    const response = await this.client.get<ApiResponse<WafIpEntry[]>>(`/zones/${zoneId}/waf/ip-lists`, {
      listType: params?.listType,
      search: params?.search,
      page: params?.page,
      perPage: params?.perPage,
    });
    return { data: response.data, meta: response.meta ?? { total: response.data.length, page: 1, perPage: response.data.length, totalPages: 1 } };
  }

  /**
   * Get a specific IP entry
   */
  async get(zoneId: string, ipId: string): Promise<WafIpEntry> {
    const response = await this.client.get<ApiResponse<WafIpEntry>>(`/zones/${zoneId}/waf/ip-lists/${ipId}`);
    return response.data;
  }

  /**
   * Add an IP to the list
   */
  async create(zoneId: string, params: WafIpCreateParams): Promise<WafIpEntry> {
    const response = await this.client.post<ApiResponse<WafIpEntry>>(`/zones/${zoneId}/waf/ip-lists`, params);
    return response.data;
  }

  /**
   * Update an IP entry
   */
  async update(zoneId: string, ipId: string, params: WafIpUpdateParams): Promise<WafIpEntry> {
    const response = await this.client.put<ApiResponse<WafIpEntry>>(`/zones/${zoneId}/waf/ip-lists/${ipId}`, params);
    return response.data;
  }

  /**
   * Remove an IP from the list
   */
  async delete(zoneId: string, ipId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/zones/${zoneId}/waf/ip-lists/${ipId}`);
  }
}

/**
 * WAF Geo-blocking API
 */
class WafGeoApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * List country rules for a zone
   */
  async listCountries(zoneId: string): Promise<WafCountryRule[]> {
    const response = await this.client.get<ApiResponse<WafCountryRule[]>>(`/zones/${zoneId}/waf/countries`);
    return response.data;
  }

  /**
   * Get a specific country rule
   */
  async getCountry(zoneId: string, countryId: string): Promise<WafCountryRule> {
    const response = await this.client.get<ApiResponse<WafCountryRule>>(`/zones/${zoneId}/waf/countries/${countryId}`);
    return response.data;
  }

  /**
   * Add a country rule
   */
  async createCountry(zoneId: string, params: WafCountryCreateParams): Promise<WafCountryRule> {
    const response = await this.client.post<ApiResponse<WafCountryRule>>(`/zones/${zoneId}/waf/countries`, params);
    return response.data;
  }

  /**
   * Update a country rule
   */
  async updateCountry(zoneId: string, countryId: string, params: WafCountryUpdateParams): Promise<WafCountryRule> {
    const response = await this.client.put<ApiResponse<WafCountryRule>>(`/zones/${zoneId}/waf/countries/${countryId}`, params);
    return response.data;
  }

  /**
   * Delete a country rule
   */
  async deleteCountry(zoneId: string, countryId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/zones/${zoneId}/waf/countries/${countryId}`);
  }

  /**
   * List ASN rules for a zone
   */
  async listAsns(zoneId: string): Promise<WafAsnRule[]> {
    const response = await this.client.get<ApiResponse<WafAsnRule[]>>(`/zones/${zoneId}/waf/asn`);
    return response.data;
  }

  /**
   * Get a specific ASN rule
   */
  async getAsn(zoneId: string, asnId: string): Promise<WafAsnRule> {
    const response = await this.client.get<ApiResponse<WafAsnRule>>(`/zones/${zoneId}/waf/asn/${asnId}`);
    return response.data;
  }

  /**
   * Add an ASN rule
   */
  async createAsn(zoneId: string, params: WafAsnCreateParams): Promise<WafAsnRule> {
    const response = await this.client.post<ApiResponse<WafAsnRule>>(`/zones/${zoneId}/waf/asn`, params);
    return response.data;
  }

  /**
   * Update an ASN rule
   */
  async updateAsn(zoneId: string, asnId: string, params: WafAsnUpdateParams): Promise<WafAsnRule> {
    const response = await this.client.put<ApiResponse<WafAsnRule>>(`/zones/${zoneId}/waf/asn/${asnId}`, params);
    return response.data;
  }

  /**
   * Delete an ASN rule
   */
  async deleteAsn(zoneId: string, asnId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/zones/${zoneId}/waf/asn/${asnId}`);
  }
}

/**
 * WAF Configuration API
 */
class WafApi {
  /**
   * WAF rules sub-API
   */
  public readonly rules: WafRulesApi;

  /**
   * WAF IP lists sub-API
   */
  public readonly ipLists: WafIpListsApi;

  /**
   * WAF geo-blocking sub-API
   */
  public readonly geo: WafGeoApi;

  constructor(private readonly client: HttpClient) {
    this.rules = new WafRulesApi(client);
    this.ipLists = new WafIpListsApi(client);
    this.geo = new WafGeoApi(client);
  }

  /**
   * Get WAF configuration for a zone
   */
  async getConfig(zoneId: string): Promise<WafConfigResponse> {
    const response = await this.client.get<ApiResponse<WafConfigResponse>>(`/zones/${zoneId}/waf`);
    return response.data;
  }

  /**
   * Update WAF configuration for a zone
   */
  async updateConfig(zoneId: string, params: WafConfigUpdateParams): Promise<WafConfigResponse> {
    const response = await this.client.put<ApiResponse<WafConfigResponse>>(`/zones/${zoneId}/waf`, params);
    return response.data;
  }
}

/**
 * Analytics API
 */
class AnalyticsApi {
  constructor(private readonly client: HttpClient) {}

  /**
   * Get usage metrics
   */
  async getUsage(params?: UsageParams): Promise<UsageResponse> {
    return this.client.get<UsageResponse>('/usage', {
      start_date: params?.start_date,
      end_date: params?.end_date,
    });
  }

  /**
   * List CDN nodes
   */
  async listCdnNodes(): Promise<CdnNode[]> {
    return this.client.get<CdnNode[]>('/cdn-nodes');
  }
}

/**
 * DataHorders CDN API Client
 *
 * The main entry point for interacting with the DataHorders CDN API.
 *
 * @example
 * ```typescript
 * import { DataHordersCDN } from '@datahorders/cdn-sdk';
 *
 * const client = new DataHordersCDN('your-api-key');
 *
 * // List domains
 * const domains = await client.domains.list();
 *
 * // Create a zone
 * const zone = await client.zones.create({
 *   name: 'app',
 *   domains: ['dom_abc123'],
 *   upstream: {
 *     loadBalanceMethod: 'round_robin',
 *     servers: [
 *       { address: '10.0.1.100', port: 8080, healthCheckPath: '/health' }
 *     ]
 *   }
 * });
 *
 * // Get ACME certificate
 * const cert = await client.acmeCertificates.create({
 *   name: 'example.com SSL',
 *   domains: ['example.com', '*.example.com'],
 *   email: 'admin@example.com'
 * });
 * ```
 */
export class DataHordersCDN {
  private readonly client: HttpClient;

  /**
   * Domain management API
   */
  public readonly domains: DomainsApi;

  /**
   * Zone management API
   */
  public readonly zones: ZonesApi;

  /**
   * Upstream server management API
   */
  public readonly upstreamServers: UpstreamServersApi;

  /**
   * Certificate management API
   */
  public readonly certificates: CertificatesApi;

  /**
   * ACME certificate management API
   */
  public readonly acmeCertificates: AcmeCertificatesApi;

  /**
   * Health check management API
   */
  public readonly healthChecks: HealthChecksApi;

  /**
   * WAF management API
   */
  public readonly waf: WafApi;

  /**
   * Analytics API
   */
  public readonly analytics: AnalyticsApi;

  /**
   * Create a new DataHorders CDN API client
   *
   * @param apiKeyOrConfig - API key string or full configuration object
   */
  constructor(apiKeyOrConfig: string | DataHordersCDNConfig) {
    const config = typeof apiKeyOrConfig === 'string'
      ? { apiKey: apiKeyOrConfig }
      : apiKeyOrConfig;

    this.client = new HttpClient(config);

    this.domains = new DomainsApi(this.client);
    this.zones = new ZonesApi(this.client);
    this.upstreamServers = new UpstreamServersApi(this.client);
    this.certificates = new CertificatesApi(this.client);
    this.acmeCertificates = new AcmeCertificatesApi(this.client);
    this.healthChecks = new HealthChecksApi(this.client);
    this.waf = new WafApi(this.client);
    this.analytics = new AnalyticsApi(this.client);
  }
}

// Default export
export default DataHordersCDN;
