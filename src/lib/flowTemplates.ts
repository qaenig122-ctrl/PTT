
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

export interface FlowTemplate {
  id: string;
  name: string;
  category: 'E-Commerce' | 'SaaS & Auth' | 'Microservices' | 'High-Throughput' | 'AI & Analytics';
  description: string;
  recommendedVUs: number;
  recommendedDurationMin: number;
  endpoints: EndpointConfig[];
}

export const PRESET_FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'tpl_ecommerce',
    name: 'E-Commerce Customer Journey',
    category: 'E-Commerce',
    description: 'Realistic customer flow: Browse catalog, product detail query, cart manipulation, discount calculation, and checkout order placement.',
    recommendedVUs: 150,
    recommendedDurationMin: 15,
    endpoints: [
      {
        id: 'ep_ecom_1',
        name: 'Browse Product Catalog',
        path: '/api/v1/products?category=electronics&page=1&limit=20',
        method: 'GET',
        weight: 40,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      },
      {
        id: 'ep_ecom_2',
        name: 'Product Details Query',
        path: '/api/v1/products/sku-984210',
        method: 'GET',
        weight: 30,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      },
      {
        id: 'ep_ecom_3',
        name: 'Add Item to Cart',
        path: '/api/v1/cart/items',
        method: 'POST',
        weight: 15,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{AUTH_TOKEN}}' },
        body: JSON.stringify({ productId: 'sku-984210', quantity: 1, variantId: 'v-black' }, null, 2),
        expectedStatus: 201
      },
      {
        id: 'ep_ecom_4',
        name: 'Apply Promo Coupon',
        path: '/api/v1/cart/discounts',
        method: 'POST',
        weight: 10,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{AUTH_TOKEN}}' },
        body: JSON.stringify({ code: 'SUMMER25', cartTotal: 129.99 }, null, 2),
        expectedStatus: 200
      },
      {
        id: 'ep_ecom_5',
        name: 'Final Order Checkout',
        path: '/api/v1/checkout/orders',
        method: 'POST',
        weight: 5,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{AUTH_TOKEN}}' },
        body: JSON.stringify({
          paymentMethod: 'card_token_xyz',
          shippingAddress: { country: 'US', zip: '94105', city: 'San Francisco' }
        }, null, 2),
        expectedStatus: 201
      }
    ]
  },
  {
    id: 'tpl_saas_auth',
    name: 'SaaS User Auth & Workspace Management',
    category: 'SaaS & Auth',
    description: 'OAuth2/JWT token exchange, user profile polling, workspace member listing, and entity creation.',
    recommendedVUs: 100,
    recommendedDurationMin: 10,
    endpoints: [
      {
        id: 'ep_saas_1',
        name: 'JWT Login & Token Exchange',
        path: '/api/v1/auth/login',
        method: 'POST',
        weight: 15,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'tester_{{VU_ID}}@example.com', password: 'SecretPassword123!' }, null, 2),
        expectedStatus: 200
      },
      {
        id: 'ep_saas_2',
        name: 'Fetch User Profile',
        path: '/api/v1/users/me',
        method: 'GET',
        weight: 35,
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer {{AUTH_TOKEN}}' },
        expectedStatus: 200
      },
      {
        id: 'ep_saas_3',
        name: 'List Workspace Projects',
        path: '/api/v1/workspaces/ws-default/projects?status=active',
        method: 'GET',
        weight: 30,
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer {{AUTH_TOKEN}}' },
        expectedStatus: 200
      },
      {
        id: 'ep_saas_4',
        name: 'Create New Task Entity',
        path: '/api/v1/tasks',
        method: 'POST',
        weight: 20,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{AUTH_TOKEN}}' },
        body: JSON.stringify({
          title: 'Automated Load Test Task #{{TIMESTAMP}}',
          priority: 'high',
          assigneeId: 'usr-admin'
        }, null, 2),
        expectedStatus: 201
      }
    ]
  },
  {
    id: 'tpl_microservices',
    name: 'Microservices Health & Mesh Observability',
    category: 'Microservices',
    description: 'High-frequency internal telemetry and readiness endpoints used by Kubernetes ingress and service mesh.',
    recommendedVUs: 250,
    recommendedDurationMin: 5,
    endpoints: [
      {
        id: 'ep_ms_1',
        name: 'Kubernetes Liveness Probe',
        path: '/healthz',
        method: 'GET',
        weight: 40,
        headers: { 'Accept': 'text/plain' },
        expectedStatus: 200
      },
      {
        id: 'ep_ms_2',
        name: 'Readiness & Database Ping',
        path: '/ready',
        method: 'GET',
        weight: 30,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      },
      {
        id: 'ep_ms_3',
        name: 'Prometheus App Metrics Scraping',
        path: '/metrics',
        method: 'GET',
        weight: 20,
        headers: { 'Accept': 'text/plain' },
        expectedStatus: 200
      },
      {
        id: 'ep_ms_4',
        name: 'Distributed Config & Feature Flags',
        path: '/api/v1/features/flags',
        method: 'GET',
        weight: 10,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      }
    ]
  },
  {
    id: 'tpl_search_heavy',
    name: 'High-Throughput Search & Elasticsearch',
    category: 'High-Throughput',
    description: 'Stress test Elasticsearch/PostgreSQL full-text index with faceted filters, auto-complete prefix queries, and pagination.',
    recommendedVUs: 300,
    recommendedDurationMin: 20,
    endpoints: [
      {
        id: 'ep_srch_1',
        name: 'Instant Autocomplete Query',
        path: '/api/v1/search/autocomplete?q=cloud&max=5',
        method: 'GET',
        weight: 50,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      },
      {
        id: 'ep_srch_2',
        name: 'Faceted Multi-Filter Query',
        path: '/api/v1/search?q=performance&category=devops&sortBy=date_desc&page=1',
        method: 'GET',
        weight: 35,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      },
      {
        id: 'ep_srch_3',
        name: 'Deep Pagination Search',
        path: '/api/v1/search?q=observability&page=12&limit=50',
        method: 'GET',
        weight: 15,
        headers: { 'Accept': 'application/json' },
        expectedStatus: 200
      }
    ]
  }
];

/**
 * Common OpenAPI doc endpoints for live discovery probe
 */
export const COMMON_DOC_PATHS = [
  '/openapi.json',
  '/swagger.json',
  '/v3/api-docs',
  '/api/v1/openapi.json',
  '/api-docs',
  '/swagger/v1/swagger.json',
  '/docs/json'
];

/**
 * Performance Testing Best Practice Techniques
 */
export interface TestingTechnique {
  title: string;
  tag: string;
  summary: string;
  codeSnippet: string;
  benefit: string;
}

export const TESTING_TECHNIQUES: TestingTechnique[] = [
  {
    title: 'Dynamic Parameterization & Token Injection',
    tag: 'Data Variety',
    summary: 'Avoid testing with static payload data which causes unnatural database cache hits. Inject randomized IDs, timestamps, and realistic user credentials.',
    codeSnippet: `// k6 Dynamic Injection Example:
const payload = JSON.stringify({
  userId: 'usr_' + __VU + '_' + Math.floor(Math.random() * 10000),
  timestamp: Date.now(),
  action: 'checkout'
});`,
    benefit: 'Validates actual database write throughput and cache-miss latency.'
  },
  {
    title: 'Weighted Traffic Distribution',
    tag: 'Realistic Ratios',
    summary: 'In production, 80-90% of requests are reads (GET) and 10-20% are writes (POST/PUT). Assigning endpoint weights simulates real user behavior.',
    codeSnippet: `// Weighted task execution in k6 / Locust:
// Browse: 40% weight
// Product Detail: 30% weight
// Add to Cart: 15% weight
// Checkout: 5% weight`,
    benefit: 'Prevents overloading write APIs unrealistically while keeping read pipelines saturated.'
  },
  {
    title: 'Correlation & Flow Chaining',
    tag: 'Stateful Testing',
    summary: 'Extract dynamic tokens (JWT Bearer tokens or Cart IDs) from a login or creation endpoint and pass them in subsequent headers.',
    codeSnippet: `// Extract and pass dynamic bearer token:
const loginRes = http.post('/api/auth/login', JSON.stringify(creds));
const token = loginRes.json('access_token');

const authHeaders = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
};`,
    benefit: 'Tests genuine multi-step user workflows without hardcoded expired session tokens.'
  },
  {
    title: 'Think Time & Jitter Pacing',
    tag: 'Pacing',
    summary: 'Real humans do not click instantly in 0 milliseconds. Introduce 1-3 second random sleep delays between actions to simulate organic human cadence.',
    codeSnippet: `// Simulate human reading / decision delay:
sleep(Math.random() * 2 + 1); // 1.0s to 3.0s delay`,
    benefit: 'Provides accurate concurrent user concurrency measurements rather than simple burst bombardment.'
  }
];
