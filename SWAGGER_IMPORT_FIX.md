# Swagger/OpenAPI Import Fix

The importer now treats `swagger-ui-bundle.js` correctly.

## What happens with swagger-ui-bundle.js

That file is the Swagger UI runtime library. It is not the API's OpenAPI document.
The importer therefore does **not** claim that `/` is a Swagger specification URL.

A URL is accepted only when it is a plausible specification URL. `/`, `./`, and `#`
are rejected.

## Supported import sources

- swagger.json
- openapi.json
- swagger.yaml
- openapi.yaml
- Swagger UI configuration JavaScript containing a real spec URL
- JavaScript containing discoverable API calls (used as route discovery, not as a fake OpenAPI document)

## API URL discovery

For a live API such as:

`http://196.188.240.103/office-api/api`

the application should probe common OpenAPI locations and Swagger UI pages, then inspect
HTML/JS configuration for a real specification URL. If none exists, it reports that the
host is reachable but no published specification was found rather than pretending `/` is
the specification.
