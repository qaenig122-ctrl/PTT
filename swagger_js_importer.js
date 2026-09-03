/**
 * EAII Swagger/OpenAPI JavaScript importer.
 *
 * Important:
 * - swagger-ui-bundle.js is Swagger UI runtime code, not an API specification.
 * - "/" is never accepted as an OpenAPI/Swagger spec URL.
 * - Valid embedded specs must contain `paths` (and preferably openapi/swagger).
 */

export function isValidSpecUrl(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v || v === "/" || v === "./" || v === "#") return false;
  return /\.(json|ya?ml)(?:[?#].*)?$/i.test(v) ||
         /(?:openapi|swagger|api-docs|swagger-ui|docs)/i.test(v);
}

export function looksLikeOpenApiDocument(obj) {
  return !!obj &&
    typeof obj === "object" &&
    typeof obj.paths === "object" &&
    (!!obj.openapi || !!obj.swagger);
}

export function looksLikeSwaggerUiBundle(text) {
  if (typeof text !== "string") return false;
  const runtimeHits = [
    "SwaggerUIBundle", "SwaggerUI", "swagger-ui", "swagger: \"2.0\"",
    "openapi: 3.x.y"
  ].filter(x => text.includes(x)).length;
  const hasRealPaths = /["']paths["']\s*:/.test(text) &&
    /["'](?:get|post|put|patch|delete|options|head)["']\s*:/.test(text);
  return runtimeHits >= 2 && !hasRealPaths;
}

export function extractSpecUrls(text) {
  if (typeof text !== "string") return [];
  const urls = new Set();
  const re = /(?:url|specUrl|specURL|swaggerUrl|openapiUrl)\s*[:=]\s*["'`]([^"'`]+)["'`]/gi;
  let m;
  while ((m = re.exec(text))) {
    if (isValidSpecUrl(m[1])) urls.add(m[1]);
  }
  return [...urls];
}

export function extractApiRoutes(text) {
  if (typeof text !== "string") return [];
  const routes = [];
  const seen = new Set();
  const patterns = [
    /\bfetch\s*\(\s*["'`]([^"'`]+)["'`]/gi,
    /\baxios\.(get|post|put|patch|delete|head|options)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
    /\.open\s*\(\s*["'`](GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)["'`]\s*,\s*["'`]([^"'`]+)["'`]/gi
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      const method = (m[1] || "GET").toUpperCase();
      const path = m[2] || m[1];
      if (!path || !/^https?:\/\/|^\//i.test(path)) continue;
      const key = method + " " + path;
      if (!seen.has(key)) {
        seen.add(key);
        routes.push({ method, path });
      }
    }
  }
  return routes;
}
