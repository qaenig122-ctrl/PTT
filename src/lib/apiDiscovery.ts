
// Robust Swagger/OpenAPI JS import helpers.
// Swagger UI's own swagger-ui-bundle.js is runtime code; "/" is not a spec URL.
function isValidSwaggerSpecUrl(value) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (!v || v === "/" || v === "./" || v === "#") return false;
  return /(?:openapi|swagger|api-docs|docs|spec)/i.test(v) &&
         /\.(json|ya?ml)(?:[?#].*)?$/i.test(v);
}

function isSwaggerUiRuntimeBundle(text) {
  if (!text || typeof text !== "string") return false;
  const markers = [
    "SwaggerUIBundle", "swagger-ui", "SwaggerUI", "Swagger UI",
    "swagger: \"2.0\"", "openapi: 3.x.y"
  ];
  const hits = markers.filter(m => text.includes(m)).length;
  const hasApiPaths = /["']paths["']\s*:/.test(text) &&
                       /["'](?:get|post|put|patch|delete|options|head)["']\s*:/.test(text);
  return hits >= 2 && !hasApiPaths;
}

function extractValidSwaggerSpecUrls(text) {
  if (!text || typeof text !== "string") return [];
  const found = new Set();
  const patterns = [
    /(?:url|specUrl|specURL|swaggerUrl|openapiUrl)\s*[:=]\s*["'`]([^"'`]+)["'`]/gi,
    /(?:url|specUrl|specURL|swaggerUrl|openapiUrl)\s*=\s*["'`]([^"'`]+)["'`]/gi
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      if (isValidSwaggerSpecUrl(m[1])) found.add(m[1]);
    }
  }
  return [...found];
}

import { EndpointConfig } from '../types';
import { parseOpenApiSpec } from './openapiParser';

export interface DiscoveryProbeLocation {
  url: string;
  category: 'direct' | 'parent-path' | 'root-path' | 'swagger-ui';
  status?: number | 'ERROR' | 'TIMEOUT';
}

export interface DiscoveryResult {
  success: boolean;
  spec?: any;
  specUrl?: string;
  discoveredPath?: string;
  endpoints?: EndpointConfig[];
  detectedBaseUrl?: string;
  title?: string;
  version?: string;
  totalLocationsProbed: number;
  probedLocations: DiscoveryProbeLocation[];
  diagnostics: {
    inputUrl: string;
    detectedApiBaseUrl: string;
    parentPaths: string[];
    rootOrigin: string;
    networkErrorDetected: boolean;
    corsSuspected: boolean;
    unreachableHost: boolean;
    isPrivateOrInternalIp: boolean;
    statusSummary: string;
    diagnosticDetails: string[];
    recommendedActions: {
      action: 'PASTE_SPEC' | 'POSTMAN' | 'CURL' | 'HAR' | 'TEMPLATES';
      title: string;
      description: string;
    }[];
  };
}

/**
 * Standard relative doc paths tested across all web frameworks
 */
export const CANDIDATE_DOC_PATHS = [
  // Primary OpenAPI / Swagger JSON & YAML specifications
  '/openapi.json',
  '/openapi.yaml',
  '/swagger.json',
  '/swagger/v1/swagger.json',
  '/v2/api-docs',
  '/v3/api-docs',
  '/v3/api-docs/swagger-config',
  '/api-docs',
  '/api-docs.json',
  '/api/openapi.json',
  '/api/openapi.yaml',
  '/api/swagger.json',
  '/api/v1/openapi.json',
  '/api/v1/swagger.json',
  '/docs/openapi.json',
  '/docs/swagger.json',
  '/docs/json',
  '/swagger/swagger.json',
  '/swagger.yaml',
  '/q/openapi', // Quarkus
  // HTML UI Endpoints (inspected for embedded spec JSON/YAML links)
  '/swagger-ui.html',
  '/swagger-ui/index.html',
  '/swagger-ui/',
  '/swagger/index.html',
  '/swagger/',
  '/docs',
  '/redoc',
  '/api/docs'
];

/**
 * Checks if a hostname / IP is private or local
 */
function isPrivateOrLocal(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true;
  }

  // IPv4 regex
  const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const octet1 = parseInt(ipMatch[1], 10);
    const octet2 = parseInt(ipMatch[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) return true;
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) return true;
    // 127.0.0.0/8
    if (octet1 === 127) return true;
  }

  return false;
}

/**
 * Inspects an HTML response for Swagger UI script tags or config URLs
 */
function extractSpecUrlFromHtml(html: string, pageUrl: string): string | null {
  if (!html || typeof html !== 'string') return null;

  // Check for SwaggerUIBundle config `url: "..."` or `url: '...'`
  const urlMatches = html.match(/url\s*:\s*["']([^"']+\.(json|yaml|yml)|\/v[23]\/api-docs[^"']*|[^"']*swagger[^"']*)["']/i);
  if (urlMatches && urlMatches[1]) {
    try {
      return new URL(urlMatches[1], pageUrl).href;
    } catch {
      // Continue
    }
  }

  // Check for urls: [ { url: "..." } ]
  const urlsMatches = html.match(/urls\s*:\s*\[\s*\{\s*url\s*:\s*["']([^"']+)["']/i);
  if (urlsMatches && urlsMatches[1]) {
    try {
      return new URL(urlsMatches[1], pageUrl).href;
    } catch {
      // Continue
    }
  }

  // Check for <link rel="alternate" type="application/json" href="...">
  const linkMatches = html.match(/<link[^>]+type=["']application\/json["'][^>]+href=["']([^"']+)["']/i);
  if (linkMatches && linkMatches[1]) {
    try {
      return new URL(linkMatches[1], pageUrl).href;
    } catch {
      // Continue
    }
  }

  // Check for data-config-url or data-url attributes
  const dataMatches = html.match(/data-(?:config-)?url=["']([^"']+)["']/i);
  if (dataMatches && dataMatches[1]) {
    try {
      return new URL(dataMatches[1], pageUrl).href;
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Probes a single URL with timeout & error tracking
 */
async function probeSingleUrl(
  url: string,
  timeoutMs: number = 3000
): Promise<{ ok: boolean; status: number | 'ERROR' | 'TIMEOUT'; data?: any; html?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/html, application/yaml, */*'
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';

    if (res.ok) {
      if (contentType.includes('json') || contentType.includes('yaml')) {
        const text = await res.text();
        try {
          const parsed = JSON.parse(text);
          return { ok: true, status: res.status, data: parsed };
        } catch {
          return { ok: true, status: res.status, data: text };
        }
      } else {
        const text = await res.text();
        // Check if raw text is JSON despite content type
        try {
          const parsed = JSON.parse(text);
          if (parsed && (parsed.openapi || parsed.swagger || parsed.paths)) {
            return { ok: true, status: res.status, data: parsed };
          }
        } catch {
          // It's HTML or text
        }
        return { ok: true, status: res.status, html: text };
      }
    }

    return { ok: false, status: res.status };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { ok: false, status: 'TIMEOUT' };
    }
    return { ok: false, status: 'ERROR' };
  }
}

/**
 * Multi-Strategy Discovery Engine
 */
export async function discoverApiSpecification(rawInputUrl: string): Promise<DiscoveryResult> {
  const trimmed = rawInputUrl.trim();
  if (!trimmed) {
    throw new Error('Please enter a valid target URL or API base path.');
  }

  // Ensure protocol
  let normalizedUrl = trimmed;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `http://${normalizedUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    throw new Error(`Invalid URL format: "${rawInputUrl}". Expected http(s)://host[:port]/path`);
  }

  const rootOrigin = parsedUrl.origin;
  const pathname = parsedUrl.pathname.replace(/\/+$/, '');
  const pathSegments = pathname.split('/').filter(Boolean);

  // Hierarchy levels to probe:
  // e.g. /office-api/api -> [ 'http://host/office-api/api', 'http://host/office-api', 'http://host' ]
  const mountLevels: { base: string; category: DiscoveryProbeLocation['category'] }[] = [];

  // Level 0: Direct input path
  mountLevels.push({
    base: `${rootOrigin}${pathname}`,
    category: 'direct'
  });

  // Level 1: Parent paths
  let accumulatedPath = '';
  for (let i = 0; i < pathSegments.length - 1; i++) {
    accumulatedPath += `/${pathSegments[i]}`;
    mountLevels.push({
      base: `${rootOrigin}${accumulatedPath}`,
      category: 'parent-path'
    });
  }

  // Level 2: Root origin
  if (!mountLevels.some(m => m.base === rootOrigin)) {
    mountLevels.push({
      base: rootOrigin,
      category: 'root-path'
    });
  }

  // Build list of candidate URLs to test
  const candidateList: { url: string; category: DiscoveryProbeLocation['category'] }[] = [];

  // Always check the exact entered URL first (in case it was already a direct json/yaml spec)
  candidateList.push({ url: normalizedUrl, category: 'direct' });

  // For each mount level, append standard doc paths
  for (const level of mountLevels) {
    for (const docPath of CANDIDATE_DOC_PATHS) {
      const fullCandidate = `${level.base}${docPath}`;
      if (!candidateList.some(c => c.url === fullCandidate)) {
        candidateList.push({
          url: fullCandidate,
          category: level.category
        });
      }
    }
  }

  const probedLocations: DiscoveryProbeLocation[] = [];
  let foundSpec: any = null;
  let foundSpecUrl: string = '';
  let networkErrorsCount = 0;

  // Probe in concurrent chunks of 4 to be fast and respectful
  const CHUNK_SIZE = 4;
  for (let i = 0; i < candidateList.length; i += CHUNK_SIZE) {
    const chunk = candidateList.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map(async item => {
        const res = await probeSingleUrl(item.url, 2800);
        return {
          item,
          res
        };
      })
    );

    for (const { item, res } of results) {
      probedLocations.push({
        url: item.url,
        category: item.category,
        status: res.status
      });

      if (res.status === 'ERROR' || res.status === 'TIMEOUT') {
        networkErrorsCount++;
      }

      // Check if this response is a valid OpenAPI/Swagger JSON/Object
      if (res.ok && res.data) {
        if (typeof res.data === 'object' && (res.data.openapi || res.data.swagger || res.data.paths)) {
          foundSpec = res.data;
          foundSpecUrl = item.url;
          break;
        } else if (typeof res.data === 'string') {
          try {
            const parsed = parseOpenApiSpec(res.data);
            if (parsed.endpoints.length > 0) {
              foundSpec = res.data;
              foundSpecUrl = item.url;
              break;
            }
          } catch {
            // Not a spec
          }
        }
      }

      // If this is HTML, inspect it for a Swagger spec link
      if (res.ok && res.html) {
        const extractedUrl = extractSpecUrlFromHtml(res.html, item.url);
        if (extractedUrl) {
          probedLocations.push({
            url: extractedUrl,
            category: 'swagger-ui',
            status: 'Probing HTML Spec Link' as any
          });
          const subRes = await probeSingleUrl(extractedUrl, 3000);
          if (subRes.ok && subRes.data) {
            foundSpec = subRes.data;
            foundSpecUrl = extractedUrl;
            break;
          }
        }
      }
    }

    if (foundSpec) break;
  }

  const isPrivateIp = isPrivateOrLocal(parsedUrl.hostname);
  const totalProbed = probedLocations.length;
  const isNetworkRefused = networkErrorsCount === totalProbed;

  // Build detailed diagnostics
  const parentPathsList = mountLevels.map(m => m.base);

  if (foundSpec) {
    try {
      const parsed = parseOpenApiSpec(foundSpec);
      return {
        success: true,
        spec: foundSpec,
        specUrl: foundSpecUrl,
        discoveredPath: foundSpecUrl.replace(rootOrigin, ''),
        endpoints: parsed.endpoints,
        detectedBaseUrl: parsed.detectedBaseUrl || `${rootOrigin}${pathname}`,
        title: parsed.title,
        version: parsed.version,
        totalLocationsProbed: totalProbed,
        probedLocations,
        diagnostics: {
          inputUrl: normalizedUrl,
          detectedApiBaseUrl: parsed.detectedBaseUrl || `${rootOrigin}${pathname}`,
          parentPaths: parentPathsList,
          rootOrigin,
          networkErrorDetected: false,
          corsSuspected: false,
          unreachableHost: false,
          isPrivateOrInternalIp: isPrivateIp,
          statusSummary: `Successfully discovered OpenAPI documentation at ${foundSpecUrl}`,
          diagnosticDetails: [
            `Found active specification at: ${foundSpecUrl}`,
            `Extracted ${parsed.endpoints.length} operational routes.`,
            `API Base URL detected: ${parsed.detectedBaseUrl || normalizedUrl}`
          ],
          recommendedActions: []
        }
      };
    } catch (e: any) {
      throw new Error(`Discovered spec at ${foundSpecUrl} but failed to parse: ${e.message}`);
    }
  }

  // Not found - Generate rich, educational diagnostic response
  const diagnosticDetails: string[] = [];
  let statusSummary = '';

  if (isNetworkRefused) {
    statusSummary = `Target host ${parsedUrl.hostname} is unreachable from this client environment.`;
    diagnosticDetails.push(`Connection failed for all ${totalProbed} candidate routes.`);
    if (isPrivateIp) {
      diagnosticDetails.push(`Host ${parsedUrl.hostname} appears to be an internal, intranet, or VPN-restricted address.`);
    } else {
      diagnosticDetails.push(`Server at ${parsedUrl.hostname} is refusing connections or does not allow cross-origin browser requests (CORS).`);
    }
  } else {
    statusSummary = `API host is reachable, but no Swagger/OpenAPI specification was found.`;
    diagnosticDetails.push(`Tested ${totalProbed} documentation paths across direct URL, parent path (/office-api/), and root (/).`);
    diagnosticDetails.push(`The API may have Swagger UI disabled in this environment or secured behind private headers.`);
  }

  return {
    success: false,
    totalLocationsProbed: totalProbed,
    probedLocations,
    diagnostics: {
      inputUrl: normalizedUrl,
      detectedApiBaseUrl: `${rootOrigin}${pathname}`,
      parentPaths: parentPathsList,
      rootOrigin,
      networkErrorDetected: isNetworkRefused,
      corsSuspected: isNetworkRefused && !isPrivateIp,
      unreachableHost: isNetworkRefused,
      isPrivateOrInternalIp: isPrivateIp,
      statusSummary,
      diagnosticDetails,
      recommendedActions: [
        {
          action: 'PASTE_SPEC',
          title: 'Paste Swagger/OpenAPI JSON or YAML',
          description: 'Copy the JSON/YAML directly from your swagger-ui.html or local development file.'
        },
        {
          action: 'POSTMAN',
          title: 'Import Postman Collection (v2.1)',
          description: 'Export your tested collection directly from Postman.'
        },
        {
          action: 'CURL',
          title: 'Paste cURL Commands',
          description: 'Right-click any working request in your browser DevTools Network tab and select "Copy as cURL".'
        },
        {
          action: 'HAR',
          title: 'Import Browser HAR Log',
          description: 'Save all network requests from your browser DevTools into a .har file and upload.'
        },
        {
          action: 'TEMPLATES',
          title: 'Use Preset Traffic Templates',
          description: 'Choose from pre-built production load patterns (E-Commerce, Microservices, Auth flows).'
        }
      ]
    }
  };
}
