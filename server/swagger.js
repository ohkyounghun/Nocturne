const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// OpenAPI 3.0 spec generated from JSDoc annotations on the route files.
// Shared by app.js (served at /api/docs and /api/openapi.json) and
// scripts/gen-openapi.js (written to openapi.json in the repo root).
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Nocturne API',
            version: '1.0.0',
            description: 'REST API for discovering and sharing night-view spots in Seoul.'
        },
        servers: [
            { url: 'https://nocturne-htdu.onrender.com', description: 'Production' },
            { url: 'http://localhost:3000', description: 'Local' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        }
    },
    apis: [path.join(__dirname, 'routes', '*.js')]
});

module.exports = swaggerSpec;
