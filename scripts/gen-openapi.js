// Generate a static OpenAPI spec file (openapi.json) from the route JSDoc.
// Run with: npm run openapi
const fs = require('fs');
const path = require('path');
const spec = require('../server/swagger');

const out = path.join(__dirname, '..', 'openapi.json');
fs.writeFileSync(out, JSON.stringify(spec, null, 2));
console.log(`✅ openapi.json generated (${Object.keys(spec.paths || {}).length} paths) at ${out}`);
