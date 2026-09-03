import { EndpointConfig, HttpMethod } from '../types';

/**
 * Parses raw cURL command(s) into EndpointConfig objects
 */
export function parseCurlCommand(rawCurl: string): {
  endpoints: EndpointConfig[];
  detectedBaseUrl?: string;
} {
  if (!rawCurl || typeof rawCurl !== 'string') {
    throw new Error('Please provide one or more valid cURL commands.');
  }

  // Split multiple curl statements if present
  const commandBlocks = rawCurl
    .split(/\n(?=curl\s)/i)
    .map(s => s.trim())
    .filter(s => s.toLowerCase().startsWith('curl'));

  if (commandBlocks.length === 0 && rawCurl.trim().toLowerCase().startsWith('curl')) {
    commandBlocks.push(rawCurl.trim());
  }

  if (commandBlocks.length === 0) {
    throw new Error('No valid "curl" command detected. Commands must start with curl.');
  }

  const endpoints: EndpointConfig[] = [];
  let detectedBaseUrl: string | undefined;

  for (const cmd of commandBlocks) {
    // Clean up line continuations with backslash
    const cleanCmd = cmd.replace(/\\\r?\n/g, ' ').replace(/\s+/g, ' ');

    // Extract URL
    let urlMatch = cleanCmd.match(/curl\s+(?:-[A-Za-z0-9\-_]+\s+(?:'[^\']*'|"[^\"]*"|\S+)\s+)*['"]?(https?:\/\/[^\s\'"]+)['"]?/i);
    if (!urlMatch) {
      // Try finding any http url
      urlMatch = cleanCmd.match(/['"](https?:\/\/[^\'"]+)['"]/i) || cleanCmd.match(/\s(https?:\/\/[^\s]+)/i);
    }

    let rawUrl = urlMatch ? urlMatch[1] : '/api/custom';
    let path = rawUrl;
    
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      try {
        const parsed = new URL(rawUrl);
        if (!detectedBaseUrl) {
          detectedBaseUrl = `${parsed.protocol}//${parsed.host}`;
        }
        path = parsed.pathname + parsed.search;
      } catch (e) {
        path = rawUrl;
      }
    }

    // Extract Method (-X POST, --request POST)
    let method: HttpMethod = 'GET';
    const methodMatch = cleanCmd.match(/(?:-X|--request)\s+([A-Z]+)/i);
    if (methodMatch) {
      const m = methodMatch[1].toUpperCase();
      if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(m)) {
        method = m as HttpMethod;
      }
    }

    // Check headers (-H "Key: Value" or --header "Key: Value")
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(cleanCmd)) !== null) {
      const fullHeader = headerMatch[1];
      const colonIdx = fullHeader.indexOf(':');
      if (colonIdx > 0) {
        const key = fullHeader.substring(0, colonIdx).trim();
        const value = fullHeader.substring(colonIdx + 1).trim();
        headers[key] = value;
      }
    }

    // Extract Body (-d '...', --data '...', --data-raw '...')
    let body: string | undefined = undefined;
    const bodyMatch = cleanCmd.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?:\s+-[a-zA-Z]|\s*$)/);
    if (bodyMatch) {
      body = bodyMatch[1];
      if (method === 'GET') {
        method = 'POST'; // curl -d defaults to POST
      }
      if (!headers['Content-Type']) {
        try {
          JSON.parse(body);
          headers['Content-Type'] = 'application/json';
        } catch {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }
    }

    endpoints.push({
      id: `ep_curl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: `${method} ${path}`,
      path: path,
      method: method,
      weight: method === 'GET' ? 10 : 5,
      headers: headers,
      body: body,
      expectedStatus: method === 'POST' ? 201 : 200
    });
  }

  return {
    endpoints,
    detectedBaseUrl
  };
}
