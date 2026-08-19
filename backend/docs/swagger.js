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
    servers: [{ url: 'http://localhost:3000/api', description: 'Local development (backend on port 3000)' }],
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
            {
              type: 'object',
              properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } },
            },
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
      {
        name: 'Master Data — Operational',
        description: 'Operational master data: farms, blocks, crop types, activity types',
      },
      { name: 'Food Security Datasets', description: '13 dataset CRUD endpoints via the shared factory under /master' },
      { name: 'Lifecycle', description: 'Land, crop cycle, activity, harvest period management' },
      { name: 'Sales', description: 'Sales records (management roles)' },
      { name: 'Expenses', description: 'Expense records (management roles)' },
      { name: 'Assignments', description: 'Farmer + task assignments' },
      { name: 'Farmer Management', description: 'Farmer/owner user management' },
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
  apis: [path.join(__dirname, '../route/*.js').replace(/\\/g, '/')],
};

const swaggerSpec = swaggerJSDoc(options);

// Generate a distinct, individually-testable path entry for each of the 13
// dataset slugs from the single generic factory pattern (documented once in
// route/_datasetCrud.factory.js). Keeps the UI testable per slug without
// duplicating 13 near-identical @swagger blocks.
const DATASET_SLUGS = [
  'ketidakcukupan-nasional',
  'ketidakcukupan-provinsi',
  'konsumsi-per-jenis',
  'penyaluran-donasi',
  'proyeksi-neraca',
  'gerakan-pangan-murah',
  'harga-konsumen-provinsi',
  'harga-konsumen-nasional',
  'harga-produsen-nasional',
  'harga-produsen-provinsi',
  'skor-pph',
  'pangan-terselamatkan',
  'cadangan-pangan-provinsi',
];

const datasetListParams = () => [
  { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Page number' },
  { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Items per page' },
  { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Free-text search across text fields' },
  { name: 'year', in: 'query', schema: { type: 'string' }, description: 'Filter by year' },
  { name: 'month', in: 'query', schema: { type: 'string' }, description: 'Filter by month' },
];

function datasetPath(slug) {
  const base = `/master/${slug}`;
  return {
    [base]: {
      get: {
        tags: ['Food Security Datasets'],
        summary: `List ${slug} (paginated)`,
        description: `Generic dataset-factory list for \`${slug}\`. Guard: authenticate + isGovernment.`,
        security: [{ bearerAuth: [] }],
        parameters: datasetListParams(),
        responses: {
          200: {
            description: 'Paged list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DatasetEnvelope' } } },
          },
          401: { $ref: '#/components/schemas/Error' },
          403: { $ref: '#/components/schemas/Error' },
        },
      },
      post: {
        tags: ['Food Security Datasets'],
        summary: `Create ${slug} document`,
        description: `Generic dataset-factory create for \`${slug}\`. Guard: authenticate + isGovernment.`,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', description: `Document fields for \`${slug}\` (see model).` },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DatasetEnvelope' } } },
          },
          400: { $ref: '#/components/schemas/Error' },
          401: { $ref: '#/components/schemas/Error' },
          403: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    [`${base}/{id}`]: {
      get: {
        tags: ['Food Security Datasets'],
        summary: `Get ${slug} by id`,
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'One document',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DatasetEnvelope' } } },
          },
          401: { $ref: '#/components/schemas/Error' },
          403: { $ref: '#/components/schemas/Error' },
          404: { $ref: '#/components/schemas/Error' },
        },
      },
      put: {
        tags: ['Food Security Datasets'],
        summary: `Update ${slug} by id`,
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', description: `Partial fields for \`${slug}\`.` } },
          },
        },
        responses: {
          200: {
            description: 'Updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DatasetEnvelope' } } },
          },
          400: { $ref: '#/components/schemas/Error' },
          401: { $ref: '#/components/schemas/Error' },
          403: { $ref: '#/components/schemas/Error' },
          404: { $ref: '#/components/schemas/Error' },
        },
      },
      delete: {
        tags: ['Food Security Datasets'],
        summary: `Delete ${slug} by id`,
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Deleted',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean', example: true } } },
              },
            },
          },
          401: { $ref: '#/components/schemas/Error' },
          403: { $ref: '#/components/schemas/Error' },
          404: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  };
}

for (const slug of DATASET_SLUGS) {
  Object.assign(swaggerSpec.paths, datasetPath(slug));
}

module.exports = swaggerSpec;
