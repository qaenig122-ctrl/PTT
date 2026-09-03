
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

import * as yaml from 'js-yaml';
import { EndpointConfig, HttpMethod } from '../types';

/**
 * Generates sample mock JSON body from an OpenAPI / Swagger schema object
 */
function generateSampleFromSchema(schema: any): any {
  if (!schema) return {};

  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  const type = schema.type || (schema.properties ? 'object' : 'string');

  if (type === 'object' || schema.properties) {
    const result: Record<string, any> = {};
    const props = schema.properties || {};
    for (const key of Object.keys(props)) {
      result[key] = generateSampleFromSchema(props[key]);
    }
    return result;
  }

  if (type === 'array' || schema.items) {
    return [generateSampleFromSchema(schema.items || { type: 'string' })];
  }

  if (type === 'string') {
    if (schema.format === 'email') return 'user@example.com';
    if (schema.format === 'date-time') return new Date().toISOString();
    if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
    if (schema.enum && schema.enum.length > 0) return schema.enum[0];
    return 'sample_string';
  }

  if (type === 'integer' || type === 'number') {
    return schema.minimum !== undefined ? schema.minimum : 100;
  }

  if (type === 'boolean') {
    return true;
  }

  return {};
}

/**
 * Attempts to extract an embedded OpenAPI / Swagger spec or diagnose JavaScript/HTML content
 */
function extractBalancedObject(source: string, start: number): string | null {
  if (source[start] !== '{') return null;
  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === '\n' || ch === '\r') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i++; }
      continue;
    }
    if (!quote && ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (!quote && ch === '/' && next === '*') { blockComment = true; i++; continue; }

    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function tryExtractEmbeddedSpec(source: string): any | null {
  const markers = [
    /(?:^|[,{\s])spec\s*[:=]\s*\{/g,
    /(?:^|[,{\s])definition\s*[:=]\s*\{/g,
    /(?:^|[,{\s])(?:swaggerDoc|swaggerSpec|openapiDoc|openapiSpec)\s*[:=]\s*\{/g,
    /(?:^|[,{\s])["'](?:swaggerDoc|swaggerSpec|openapiDoc|openapiSpec)["']\s*:\s*\{/g,
    /(?:^|[,{\s])openapi\s*[:=]\s*["']/g,
  ];

  for (const marker of markers) {
    marker.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = marker.exec(source))) {
      const brace = source.indexOf('{', match.index + match[0].lastIndexOf('{'));
      if (brace < 0) continue;
      const objectText = extractBalancedObject(source, brace);
      if (!objectText) continue;
      for (const parse of [
        () => JSON.parse(objectText),
        () => yaml.load(objectText),
      ]) {
        try {
          const parsed = parse() as any;
          if (parsed && typeof parsed === 'object' && (parsed.openapi || parsed.swagger || parsed.paths)) {
            return parsed;
          }
        } catch {}
      }
    }
  }
  return null;
}

/** Attempts to extract an embedded OpenAPI / Swagger spec or diagnose JavaScript/HTML content. */
function extractOrDiagnoseContent(rawInput: string): any {
  const trimmed = rawInput.trim();

  // 1. JavaScript/Swagger UI bundles are accepted as uploads. If a bundle contains
  // an embedded spec, extract it; otherwise provide a precise next step.
  const looksLikeJs =
    trimmed.includes('SwaggerUIBundle') ||
    trimmed.includes('swagger-ui-bundle') ||
    trimmed.includes('webpackUniversalModuleDefinition') ||
    trimmed.includes('window.onload') ||
    trimmed.includes('module.exports') ||
    /(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/.test(trimmed);

  if (looksLikeJs) {
    const embedded = tryExtractEmbeddedSpec(trimmed);
    if (embedded) return embedded;

    // Some Swagger UI exports are saved with a .json extension but are actually
    // JavaScript wrappers containing a real OpenAPI document under
    // options.swaggerDoc (or swaggerSpec/openapiDoc/openapiSpec). Treat these as
    // importable specifications instead of reporting them as runtime-only JS.
    const wrapperPatterns = [
      /["']?(?:swaggerDoc|swaggerSpec|openapiDoc|openapiSpec)["']?\s*:\s*\{/gi,
    ];
    for (const re of wrapperPatterns) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(trimmed))) {
        const brace = trimmed.indexOf('{', m.index + m[0].lastIndexOf('{'));
        if (brace < 0) continue;
        const objectText = extractBalancedObject(trimmed, brace);
        if (!objectText) continue;
        for (const parse of [() => JSON.parse(objectText), () => yaml.load(objectText)]) {
          try {
            const parsed = parse() as any;
            if (parsed && typeof parsed === 'object' && parsed.paths && (parsed.openapi || parsed.swagger)) {
              return parsed;
            }
          } catch {}
        }
      }
    }

    const urlMatch = trimmed.match(/\burl\s*:\s*["']([^"']+)["']/i);
    const urlsMatch = trimmed.match(/\burls\s*:\s*\[/i);
    const suggestedUrl = urlMatch ? ` Detected spec URL: ${urlMatch[1]}` : '';
    const hasOnlyBundle = trimmed.includes('swagger-ui-bundle') && !urlMatch && !urlsMatch;

    throw new Error(
      `JavaScript file accepted, but no OpenAPI/Swagger specification was embedded in this JS file.${suggestedUrl}\n\n` +
      (hasOnlyBundle
        ? `This appears to be the Swagger UI JavaScript library (swagger-ui-bundle.js). That library contains the Swagger viewer, not your API definition.\n\n`
        : '') +
      `To import the API, upload the raw swagger.json/openapi.json/swagger.yaml/openapi.yaml file, or upload the Swagger UI configuration JS if it contains a spec object.\n` +
      `You can also use Auto-Discovery Probe with the Swagger UI/API URL.`
    );
  }

  // 2. Check if user pasted an HTML document (e.g. swagger-ui.html or 404 page)
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<script')) {
    // Try to extract JSON embedded in script tags
    const jsonScriptMatch = trimmed.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonScriptMatch && jsonScriptMatch[1]) {
      try {
        const parsed = JSON.parse(jsonScriptMatch[1].trim());
        if (parsed && (parsed.openapi || parsed.swagger || parsed.paths)) {
          return parsed;
        }
      } catch {}
    }

    // Check for spec: { ... } in inline JS scripts
    const inlineSpecMatch = trimmed.match(/spec\s*:\s*(\{[\s\S]*?\})\s*[,}]/);
    if (inlineSpecMatch && inlineSpecMatch[1]) {
      try {
        const parsed = JSON.parse(inlineSpecMatch[1]);
        if (parsed && (parsed.openapi || parsed.swagger || parsed.paths)) {
          return parsed;
        }
      } catch {
        try {
          const loaded = yaml.load(inlineSpecMatch[1]);
          if (loaded && typeof loaded === 'object') return loaded;
        } catch {}
      }
    }

    const urlMatch = trimmed.match(/url\s*:\s*["']([^"']+)["']/i);
    const suggestedUrl = urlMatch ? ` (Found spec endpoint: ${urlMatch[1]})` : '';

    throw new Error(
      `You pasted an HTML web page rather than a raw OpenAPI/Swagger JSON or YAML document${suggestedUrl}.\n\n` +
      `Please paste the raw JSON/YAML content or use the Auto-Discovery Probe tab with your URL.`
    );
  }

  return null;
}

/**
 * Parses OpenAPI 3.0/3.1 or Swagger 2.0 JSON or YAML or Object
 */
export function parseOpenApiSpec(specInput: string | object): {
  endpoints: EndpointConfig[];
  detectedBaseUrl?: string;
  title?: string;
  version?: string;
  totalEndpoints: number;
} {
  let doc: any;
  if (typeof specInput === 'string') {
    const trimmed = specInput.trim();

    // Check for JS/HTML bundles first
    const extracted = extractOrDiagnoseContent(trimmed);
    if (extracted) {
      doc = extracted;
    } else {
      // Try JSON first
      try {
        doc = JSON.parse(trimmed);
      } catch {
        // Try YAML parsing
        try {
          doc = yaml.load(trimmed);
        } catch (yamlErr: any) {
          throw new Error('Unable to parse specification. Ensure it is valid OpenAPI/Swagger JSON or YAML.');
        }
      }
    }
  } else {
    doc = specInput;
  }

  if (!doc || typeof doc !== 'object') {
    throw new Error('OpenAPI specification is empty or not a valid object structure.');
  }

  // Verify that it has paths or at least openapi/swagger header
  if (!doc.paths && !doc.openapi && !doc.swagger) {
    throw new Error('The parsed document does not contain "paths", "openapi", or "swagger" definitions.');
  }

  const endpoints: EndpointConfig[] = [];
  let detectedBaseUrl: string | undefined;

  // 1. Detect Base URL
  // OpenAPI 3.x
  if (Array.isArray(doc.servers) && doc.servers.length > 0 && doc.servers[0]?.url) {
    detectedBaseUrl = doc.servers[0].url;
  }
  // Swagger 2.0
  else if (doc.host) {
    const scheme = (doc.schemes && doc.schemes[0]) || 'https';
    const basePath = doc.basePath && doc.basePath !== '/' ? doc.basePath : '';
    detectedBaseUrl = `${scheme}://${doc.host}${basePath}`;
  }

  const paths = doc.paths || {};
  const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  for (const pathKey of Object.keys(paths)) {
    const pathItem = paths[pathKey];
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const method of httpMethods) {
      const lowerMethod = method.toLowerCase();
      const operation = pathItem[lowerMethod];
      if (!operation) continue;

      const summary = operation.summary || operation.operationId || operation.description || `${method} ${pathKey}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      // Header parameters
      if (Array.isArray(operation.parameters)) {
        for (const p of operation.parameters) {
          if (p.in === 'header' && p.name) {
            headers[p.name] = p.example || p.default || (p.required ? '<REQUIRED>' : 'value');
          }
        }
      }

      // Path parameters replacement (e.g., {userId} -> 123)
      let resolvedPath = pathKey;
      if (Array.isArray(operation.parameters)) {
        for (const p of operation.parameters) {
          if (p.in === 'path' && p.name) {
            const sampleVal = p.example || p.default || (p.schema?.type === 'integer' ? '1' : 'test_id');
            resolvedPath = resolvedPath.replace(`{${p.name}}`, String(sampleVal));
          }
        }
      }

      // Query parameters example appending
      const queryParams: string[] = [];
      if (Array.isArray(operation.parameters)) {
        for (const p of operation.parameters) {
          if (p.in === 'query' && p.name && (p.required || p.example || p.default)) {
            const val = p.example || p.default || '1';
            queryParams.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val)}`);
          }
        }
      }
      if (queryParams.length > 0 && !resolvedPath.includes('?')) {
        resolvedPath += `?${queryParams.join('&')}`;
      }

      // Request Body
      let body: string | undefined = undefined;

      // OpenAPI 3.x requestBody
      if (operation.requestBody && operation.requestBody.content) {
        headers['Content-Type'] = 'application/json';
        const jsonContent = operation.requestBody.content['application/json'];
        if (jsonContent) {
          if (jsonContent.example) {
            body = typeof jsonContent.example === 'string' ? jsonContent.example : JSON.stringify(jsonContent.example, null, 2);
          } else if (jsonContent.schema) {
            const sample = generateSampleFromSchema(jsonContent.schema);
            body = JSON.stringify(sample, null, 2);
          }
        }
      }
      // Swagger 2.0 body parameter
      else if (Array.isArray(operation.parameters)) {
        const bodyParam = operation.parameters.find((p: any) => p.in === 'body');
        if (bodyParam) {
          headers['Content-Type'] = 'application/json';
          if (bodyParam.schema) {
            const sample = generateSampleFromSchema(bodyParam.schema);
            body = JSON.stringify(sample, null, 2);
          }
        }
      }

      // Security requirements
      if (operation.security || doc.security) {
        headers['Authorization'] = 'Bearer {{AUTH_TOKEN}}';
      }

      // Weight calculation (reads get higher default weight than writes)
      const weight = method === 'GET' ? 10 : method === 'POST' ? 5 : 2;

      endpoints.push({
        id: `ep_oas_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: summary.length > 60 ? summary.substring(0, 57) + '...' : summary,
        path: resolvedPath,
        method: method,
        weight: weight,
        headers: headers,
        body: body,
        expectedStatus: method === 'POST' ? 201 : 200,
        enabled: true
      });
    }
  }

  return {
    endpoints,
    detectedBaseUrl,
    title: doc.info?.title,
    version: doc.info?.version,
    totalEndpoints: endpoints.length
  };
}

