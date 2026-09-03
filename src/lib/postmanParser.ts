import { EndpointConfig, HttpMethod } from '../types';

/**
 * Recursively extracts requests from a Postman Collection (v2.0 / v2.1)
 */
export function parsePostmanCollection(collectionJson: string | object): {
  endpoints: EndpointConfig[];
  collectionName?: string;
  detectedBaseUrl?: string;
} {
  let doc: any;
  if (typeof collectionJson === 'string') {
    try {
      doc = JSON.parse(collectionJson);
    } catch (e) {
      throw new Error('Invalid JSON format for Postman Collection.');
    }
  } else {
    doc = collectionJson;
  }

  if (!doc || (!doc.info && !doc.item)) {
    throw new Error('This does not look like a valid Postman collection.');
  }

  const endpoints: EndpointConfig[] = [];
  let detectedBaseUrl: string | undefined;

  function traverseItems(items: any[], folderPath: string = '') {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (item.item && Array.isArray(item.item)) {
        // Nested folder
        const newFolder = folderPath ? `${folderPath} / ${item.name}` : item.name;
        traverseItems(item.item, newFolder);
      } else if (item.request) {
        const req = item.request;
        const method: HttpMethod = (typeof req.method === 'string' ? req.method.toUpperCase() : 'GET') as HttpMethod;
        
        let pathStr = '';
        let extractedBase: string | undefined;

        if (typeof req.url === 'string') {
          try {
            const parsed = new URL(req.url);
            extractedBase = `${parsed.protocol}//${parsed.host}`;
            pathStr = parsed.pathname + parsed.search;
          } catch (e) {
            pathStr = req.url;
          }
        } else if (req.url && typeof req.url === 'object') {
          // Postman URL structure
          if (req.url.raw) {
            try {
              const parsed = new URL(req.url.raw);
              extractedBase = `${parsed.protocol}//${parsed.host}`;
              pathStr = parsed.pathname + parsed.search;
            } catch (e) {
              pathStr = req.url.raw;
            }
          } else if (Array.isArray(req.url.path)) {
            pathStr = '/' + req.url.path.join('/');
            if (Array.isArray(req.url.query) && req.url.query.length > 0) {
              const queryParams = req.url.query
                .filter((q: any) => !q.disabled)
                .map((q: any) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value || '')}`)
                .join('&');
              if (queryParams) pathStr += `?${queryParams}`;
            }
          }
        }

        if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) {
          pathStr = '/' + pathStr;
        }

        if (extractedBase && !detectedBaseUrl) {
          detectedBaseUrl = extractedBase;
        }

        // Headers
        const headers: Record<string, string> = {
          'Accept': 'application/json'
        };

        if (Array.isArray(req.header)) {
          for (const h of req.header) {
            if (h.key && !h.disabled) {
              headers[h.key] = h.value || '';
            }
          }
        }

        // Request Body
        let body: string | undefined = undefined;
        if (req.body) {
          if (req.body.mode === 'raw' && req.body.raw) {
            body = req.body.raw;
            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'application/json';
            }
          } else if (req.body.mode === 'urlencoded' && Array.isArray(req.body.urlencoded)) {
            const formObj: Record<string, any> = {};
            req.body.urlencoded.forEach((f: any) => {
              if (f.key && !f.disabled) formObj[f.key] = f.value || '';
            });
            body = JSON.stringify(formObj, null, 2);
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        }

        endpoints.push({
          id: `ep_pm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: item.name || (folderPath ? `${folderPath} / ${method} ${pathStr}` : `${method} ${pathStr}`),
          path: pathStr,
          method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method) ? method : 'GET',
          weight: method === 'GET' ? 10 : 5,
          headers: headers,
          body: body,
          expectedStatus: method === 'POST' ? 201 : 200
        });
      }
    }
  }

  if (Array.isArray(doc.item)) {
    traverseItems(doc.item);
  }

  return {
    endpoints,
    collectionName: doc.info?.name || 'Imported Postman Collection',
    detectedBaseUrl
  };
}
