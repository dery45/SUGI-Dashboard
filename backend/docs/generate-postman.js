const fs = require('fs');
const path = require('path');
const swaggerSpec = require('./swagger');

const BASE = swaggerSpec.servers && swaggerSpec.servers[0] ? swaggerSpec.servers[0].url : 'http://localhost:3000/api';

function buildUrl(pathTemplate) {
  let url = BASE + pathTemplate;
  const vars = {};
  const matches = pathTemplate.match(/\{([^}]+)\}/g) || [];
  for (const m of matches) {
    const name = m.slice(1, -1);
    vars[name] = { value: '<' + name + '>' };
    url = url.replace(m, '{{' + name + '}}');
  }
  return { raw: url, host: [BASE.split('/')[2] || 'localhost'], path: [], variable: Object.values(vars) };
}

function buildRequest(pathTemplate, method, op) {
  const headers = [
    { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' },
    { key: 'Content-Type', value: 'application/json', type: 'text' },
  ];
  const body = op.requestBody
    ? { mode: 'raw', raw: '{}', options: { raw: { language: 'json' } } }
    : undefined;

  const query = [];
  const params = op.parameters || [];
  for (const p of params) {
    if (p.in === 'query') {
      query.push({ key: p.name, value: '', disabled: p.required !== true, description: p.description || '' });
    }
  }
  const url = buildUrl(pathTemplate);

  const req = {
    name: `${method.toUpperCase()} ${pathTemplate}`,
    request: {
      method: method.toUpperCase(),
      header: headers,
      url,
    },
  };
  if (body) req.request.body = body;
  if (query.length) req.request.url.query = query;

  const folder = (op.tags && op.tags[0]) || 'Misc';
  return { folder, req };
}

const collection = {
  info: {
    name: 'SUGIDash API',
    description: swaggerSpec.info.description,
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: BASE },
    { key: 'token', value: '', type: 'string' },
  ],
  auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] },
  item: [
    {
      name: 'Auth',
      item: [
        {
          name: 'POST /auth/login',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json', type: 'text' },
            ],
            body: { mode: 'raw', raw: '{\n  "email": "superadmin@sugi.id",\n  "password": "superadmin123"\n}', options: { raw: { language: 'json' } } },
            url: { raw: `${BASE}/auth/login`, host: [BASE], path: ['auth', 'login'] },
          },
          event: [
            {
              listen: 'test',
              script: {
                type: 'text/javascript',
                exec: [
                  'if (pm.response.code === 200) {',
                  '  const j = pm.response.json();',
                  '  pm.collectionVariables.set("token", j.token);',
                  '  console.log("Token set for collection:", j.token ? j.token.slice(0, 20) + "..." : "none");',
                  '}',
                  'pm.test("login succeeds", () => pm.expect(pm.response.code).to.equal(200));',
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

const folders = {};
for (const [pathTemplate, pathItem] of Object.entries(swaggerSpec.paths)) {
  for (const [method, op] of Object.entries(pathItem)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    const { folder, req } = buildRequest(pathTemplate, method, op);
    if (!folders[folder]) folders[folder] = { name: folder, item: [] };
    folders[folder].item.push(req);
  }
}

for (const folder of Object.keys(folders).sort()) {
  collection.item.push(folders[folder]);
}

const out = path.join(__dirname, 'SUGIDash.postman_collection.json');
fs.writeFileSync(out, JSON.stringify(collection, null, 2));
console.log('Wrote', out, '-', collection.item.length, 'folders');