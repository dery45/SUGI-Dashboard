const express = require('express');
const router = express.Router();
const ctrl = require('../controller/chatbotInsightController');
const { authenticate, isGovernment } = require('../middleware/auth');

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