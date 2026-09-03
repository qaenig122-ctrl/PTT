import { EndpointConfig, HARArchive, HttpMethod } from '../types';

export interface HARParseResult {
  baseUrl: string;
  endpoints: EndpointConfig[];
  totalEntriesFound: number;
  skippedAssets: number;
}

export function parseHARJson(jsonString: string): HARParseResult {
  let har: HARArchive;
  try {
    har = JSON.parse(jsonString);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON format: ${message}`);
  }

  if (!har.log || !Array.isArray(har.log.entries)) {
    throw new Error('Invalid HAR file format: missing "log.entries" array.');
  }

  const endpoints: EndpointConfig[] = [];
  const seenKeys = new Set<string>();
  let detectedBaseUrl = '';
  let skippedAssets = 0;

  // Static asset extensions to optionally ignore for pure API load tests
  const staticExtensions = /\.(png|jpe?g|gif|svg|ico|woff2?|ttf|eot|css|map)$/i;

  for (const entry of har.log.entries) {
    const req = entry.request;
    if (!req || !req.url || !req.method) continue;

    let urlObj: URL;
    try {
      urlObj = new URL(req.url);
    } catch {
      continue;
    }

    // Skip static assets
    if (staticExtensions.test(urlObj.pathname)) {
      skippedAssets++;
      continue;
    }

    if (!detectedBaseUrl) {
      detectedBaseUrl = `${urlObj.protocol}//${urlObj.host}`;
    }

    const path = urlObj.pathname + (urlObj.search || '');
    const method = req.method.toUpperCase() as HttpMethod;
    const key = `${method}:${path}`;

    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);

    // Extract relevant headers (filter out pseudo headers, cookies for generic load scripts)
    const headers: Record<string, string> = {};
    if (Array.isArray(req.headers)) {
      req.headers.forEach((h) => {
        const name = h.name.toLowerCase();
        if (
          name === 'content-type' ||
          name === 'accept' ||
          name === 'authorization' ||
          name.startsWith('x-')
        ) {
          headers[h.name] = h.value;
        }
      });
    }

    // Extract body
    let body = '';
    if (req.postData && req.postData.text) {
      body = req.postData.text;
    }

    endpoints.push({
      id: `ep-${Date.now()}-${endpoints.length}`,
      method: (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(method) ? method : 'GET'),
      path,
      description: `Imported from HAR (${method} ${path})`,
      headers,
      body,
      weight: 1
    });
  }

  return {
    baseUrl: detectedBaseUrl || 'https://api.example.com',
    endpoints,
    totalEntriesFound: har.log.entries.length,
    skippedAssets
  };
}
