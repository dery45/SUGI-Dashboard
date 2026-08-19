const express = require('express');
const router = express.Router();
const ctrl = require('../controller/chatbotInsightController');
const { authenticate, isGovernment } = require('../middleware/auth');

/**
 * @swagger
 * /chatbot-insight/dashboard:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: "Chatbot insight dashboard KPIs (isGovernment: superadmin, government)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: startDate, in: query, schema: { type: string } }
 *       - { name: endDate, in: query, schema: { type: string } }
 *       - { name: session_id, in: query, schema: { type: string } }
 *       - { name: keyword, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: minChar, in: query, schema: { type: integer } }
 *       - { name: maxChar, in: query, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Dashboard data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/filters:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Filter options (dates, sessions, categories)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Filter options
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/activity:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Chat activity data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Activity data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/topics:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Topic distribution
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Topics data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/entities:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Entities (optionally search)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       '200':
 *         description: Entities data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/ner:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Named-entity recognition aggregates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: NER data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/intent:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Intent distribution
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Intent data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/process:
 *   post:
 *     tags: [Chatbot Insight]
 *     summary: Run the NLP pipeline over pending documents
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Processing result
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/semantic-network:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Semantic network of entities/relations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Semantic network
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/knowledge-graph:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Search the knowledge graph
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: query, in: query, schema: { type: string } }
 *       - { name: nodeType, in: query, schema: { type: string } }
 *       - { name: relationType, in: query, schema: { type: string } }
 *     responses:
 *       '200':
 *         description: Knowledge graph result
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/recommendations:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Recommendations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Recommendations
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/problems:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Problems/shortfalls
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Problems
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/trends:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Temporal trends
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Trends
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/coverage:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Coverage stats (topics/entities/locations)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Coverage
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/insights:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Generated analytical insights
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Insights
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /chatbot-insight/semantic-search:
 *   get:
 *     tags: [Chatbot Insight]
 *     summary: Semantic search (requires q)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: q, in: query, required: true, schema: { type: string } }
 *       - { name: type, in: query, schema: { type: string } }
 *       - { name: intent, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Search results
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 */

// FLAG: legacy chatbotInsightRoutes had NO auth guard; isGovernment applied
// per README `/chatbot-insight` = superadmin, government
router.use(authenticate, isGovernment);

router.get('/dashboard', ctrl.getDashboard);
router.get('/filters', ctrl.getFilters);
router.get('/activity', ctrl.getActivity);
router.get('/topics', ctrl.getTopics);
router.get('/entities', ctrl.getEntities);
router.get('/ner', ctrl.getNer);
router.post('/process', ctrl.processNlp);
router.get('/intent', ctrl.getIntent);

router.get('/semantic-network', ctrl.getSemanticNetwork);
router.get('/knowledge-graph', ctrl.getKnowledgeGraph);
router.get('/recommendations', ctrl.getRecommendations);
router.get('/problems', ctrl.getProblems);
router.get('/trends', ctrl.getTrends);
router.get('/coverage', ctrl.getCoverage);
router.get('/insights', ctrl.getInsights);
router.get('/semantic-search', ctrl.semanticSearch);

module.exports = router;
