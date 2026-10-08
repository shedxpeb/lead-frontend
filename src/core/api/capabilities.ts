import axios, { type AxiosRequestConfig } from 'axios';
import { getAccessToken } from '@/core/auth/session';

export type CapabilityStatus = 'available' | 'backend_pending' | 'unavailable' | 'unknown';

export interface CapabilitiesResponse {
  version: string;
  apiVersion: string;
  modules: Record<string, boolean>;
  resources: string[];
}

export class BackendPendingError extends Error {
  readonly code = 'BACKEND_PENDING';

  constructor(public readonly resource: string) {
    super('This feature is not available yet.');
    this.name = 'BackendPendingError';
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const capabilitiesPath = process.env.NEXT_PUBLIC_CAPABILITIES_PATH;
let cachedCapabilities: CapabilitiesResponse | null = null;
let loadingCapabilities: Promise<CapabilitiesResponse | null> | null = null;
const unavailableResources = new Set<string>();

function unwrapCapabilities(payload: unknown): CapabilitiesResponse | null {
  const response = payload && typeof payload === 'object' && 'data' in payload
    ? (payload as { data: unknown }).data
    : payload;
  if (!response || typeof response !== 'object') return null;

  const value = response as Partial<CapabilitiesResponse>;
  if (
    typeof value.version !== 'string' ||
    typeof value.apiVersion !== 'string' ||
    !value.modules ||
    typeof value.modules !== 'object' ||
    !Array.isArray(value.resources) ||
    !value.resources.every((resource) => typeof resource === 'string')
  ) {
    return null;
  }

  return {
    version: value.version,
    apiVersion: value.apiVersion,
    modules: Object.fromEntries(
      Object.entries(value.modules).filter(([, enabled]) => typeof enabled === 'boolean')
    ),
    resources: value.resources,
  };
}

export async function loadCapabilities(): Promise<CapabilitiesResponse | null> {
  if (cachedCapabilities) return cachedCapabilities;
  if (loadingCapabilities) return loadingCapabilities;
  if (!apiBaseUrl || !capabilitiesPath || !getAccessToken()) return null;

  loadingCapabilities = axios
    .get(`${apiBaseUrl}${capabilitiesPath}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
    .then((response) => {
      cachedCapabilities = unwrapCapabilities(response.data);
      return cachedCapabilities;
    })
    .catch(() => null)
    .finally(() => {
      loadingCapabilities = null;
    });

  return loadingCapabilities;
}

export function resetCapabilities(): void {
  cachedCapabilities = null;
  loadingCapabilities = null;
  unavailableResources.clear();
}

export function isModuleAvailable(module: string): CapabilityStatus {
  if (!cachedCapabilities) return 'unknown';
  return cachedCapabilities.modules[module] ? 'available' : 'backend_pending';
}

export function isEndpointAvailable(url: string): CapabilityStatus {
  const resource = url.replace(/^\/+/, '').split('/')[0];
  if (!resource) return 'available';
  if (unavailableResources.has(resource)) return 'unavailable';
  if (!cachedCapabilities) return 'unknown';
  return cachedCapabilities.resources.includes(resource) ? 'available' : 'backend_pending';
}

export function supportsMutation(url: string): boolean {
  return isEndpointAvailable(url) === 'available';
}

export function supportsExport(url: string): boolean {
  return isEndpointAvailable(url) === 'available';
}

export function supportsImport(url: string): boolean {
  return isEndpointAvailable(url) === 'available';
}

export async function assertEndpointAvailable(config: AxiosRequestConfig): Promise<void> {
  const url = config.url || '';
  if (!url || !getAccessToken()) return;

  // Do not serialize the first authenticated request wave on a cold capabilities fetch.
  // Warm cache asynchronously; enforce only once capabilities are known.
  if (!cachedCapabilities) {
    void loadCapabilities();
    return;
  }

  const status = isEndpointAvailable(url);
  if (status !== 'available') {
    throw new BackendPendingError(url.replace(/^\/+/, '').split('/')[0] || url);
  }
}

export async function requireModuleAvailable(module: string): Promise<void> {
  await loadCapabilities();
  if (isModuleAvailable(module) !== 'available') {
    throw new BackendPendingError(module);
  }
}

export function guardModuleApi<T extends Record<string, unknown>>(module: string, api: T): T {
  return new Proxy(api, {
    get(target, property, receiver) {
      const member = Reflect.get(target, property, receiver);
      if (typeof member !== 'function') return member;
      return async (...args: unknown[]) => {
        await requireModuleAvailable(module);
        return Reflect.apply(member, target, args);
      };
    },
  });
}

export function rememberUnavailableEndpoint(url: string): void {
  const path = url.replace(/^\/+/, '').split('?')[0];
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return;

  // Never poison completed / core modules from entity or action 404s
  // (e.g. GET /lead/:id not found must not disable the entire lead module).
  const neverPoison = new Set([
    'lead',
    'customer',
    'project',
    'auth',
    'users',
    'roles',
    'organization',
    'system',
    'health',
    'tracking',
    'workflow',
    'mail',
  ]);
  if (neverPoison.has(segments[0])) return;

  unavailableResources.add(segments[0]);
}

export function isCancelledRequest(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof DOMException && error.name === 'AbortError');
}
