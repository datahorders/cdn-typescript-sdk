import { describe, it, expect } from 'vitest';
import { DataHordersCDN, DataHordersCDNError } from './index';

describe('DataHordersCDN', () => {
  it('should create an instance with config object', () => {
    const client = new DataHordersCDN({
      apiKey: 'test-api-key',
    });
    expect(client).toBeInstanceOf(DataHordersCDN);
  });

  it('should create an instance with string API key', () => {
    const client = new DataHordersCDN('test-api-key');
    expect(client).toBeInstanceOf(DataHordersCDN);
  });

  it('should expose all API namespaces', () => {
    const client = new DataHordersCDN('test-api-key');
    expect(client.domains).toBeDefined();
    expect(client.zones).toBeDefined();
    expect(client.certificates).toBeDefined();
    expect(client.waf).toBeDefined();
    expect(client.analytics).toBeDefined();
  });
});

describe('DataHordersCDNError', () => {
  it('should create error with all properties', () => {
    const error = new DataHordersCDNError('Test error', 'TEST_CODE', 400, { field: 'value' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ field: 'value' });
    expect(error.name).toBe('DataHordersCDNError');
  });

  it('should work without details', () => {
    const error = new DataHordersCDNError('Test error', 'TEST_CODE', 500);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.status).toBe(500);
    expect(error.details).toBeUndefined();
  });
});
