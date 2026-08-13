const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SUGIDash API',
      version: '3.0.0',
      description:
        'Food-security & agriculture dashboard. ' +
        'Bearer-token protected except `POST /auth/login` (public). ' +
        'Envelope is `{ success, data }` on 2xx and `{ success, message }` on 4xx. ',
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Local development (backend on port 3000)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          description:
            'Error envelope. On 4xx the message lives in `message`; on 5xx (and a few specific controllers) it may instead live in `error`. Both keys are officially tolerated — see anyOf.',
          anyOf: [
            { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } } },
            { type: 'object', properties: { success: { type: 'boolean', example: false }, error: { type: 'string' } } },
          ],
        },
        PagedData: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Login + current-user info' },
      { name: 'Master Data — Operational', description: 'Operational master data: farms, blocks, crop types, activity types' },
      { name: 'Food Security Datasets', description: '13 dataset CRUD endpoints via the shared factory under /master' },
      { name: 'Lifecycle', description: 'Land, crop cycle, activity, harvest period management' },
      { name: 'Sales', description: 'Sales records (management roles)' },
      { name: 'Expenses', description: 'Expense records (management roles)' },
      { name: 'Assignments', description: 'Farmer + task assignments' },
      { name: 'Settings', description: 'Profile, change password, assign farm' },
      { name: 'Filters', description: 'Dashboard filter options' },
      { name: 'Insights', description: 'Government + farmer market intelligence' },
      { name: 'Farmer Dashboard', description: 'Farmer v2 dashboard endpoint' },
      { name: 'Government Dashboard', description: 'Government v2 dashboard endpoint' },
      { name: 'Management Dashboard', description: 'Management KPIs, yield trend, UM performance' },
      { name: 'Bulk Import', description: 'Bulk-import dataset docs by model name' },
      { name: 'Chatbot Insight', description: 'NLP chatbot dashboards, process, semantic search' },
    ],
  },
  apis: [
    path.join(__dirname, '../route/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;