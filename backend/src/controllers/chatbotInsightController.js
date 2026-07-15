const chatbotInsightService = require('../services/chatbotInsightService');
const chatbotNlpService = require('../services/chatbotNlpService');
const chatbotAdvancedService = require('../services/chatbotAdvancedService');

exports.getDashboard = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      session_id: req.query.session_id,
      keyword: req.query.keyword,
      category: req.query.category,
      minChar: req.query.minChar,
      maxChar: req.query.maxChar,
    };

    const data = await chatbotInsightService.getDashboardData(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Chatbot insight dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const options = await chatbotInsightService.getFilterOptions();
    res.json({ success: true, data: options });
  } catch (error) {
    console.error('Chatbot insight filters error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const data = await chatbotNlpService.getActivityData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Chatbot activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const data = await chatbotNlpService.getTopicData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Chatbot topics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEntities = async (req, res) => {
  try {
    const { search } = req.query;
    if (search) {
      const data = await chatbotNlpService.searchEntities(search);
      return res.json({ success: true, data });
    }
    const data = await chatbotNlpService.getEntityData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Chatbot entities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNer = async (req, res) => {
  try {
    const data = await chatbotNlpService.getNerData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Chatbot NER error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIntent = async (req, res) => {
  try {
    const data = await chatbotNlpService.getIntentData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Chatbot intent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processNlp = async (req, res) => {
  try {
    const result = await chatbotNlpService.processAll();
    chatbotAdvancedService.clearCache();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Chatbot NLP processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSemanticNetwork = async (req, res) => {
  try {
    const data = await chatbotAdvancedService.getSemanticNetwork();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Semantic network error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getKnowledgeGraph = async (req, res) => {
  try {
    const { query, nodeType, relationType } = req.query;
    const data = await chatbotAdvancedService.searchKnowledgeGraph(query, nodeType, relationType);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Knowledge graph error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const data = await chatbotAdvancedService.getRecommendations();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProblems = async (req, res) => {
  try {
    const data = await chatbotAdvancedService.getProblems();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Problems error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const data = await chatbotAdvancedService.getTrends();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCoverage = async (req, res) => {
  try {
    const data = await chatbotAdvancedService.getCoverage();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Coverage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const [kpiData, activityData, topicData, commodityData, locationData, intentData, trendData, coverageData] = await Promise.all([
      chatbotInsightService.getDashboardData(),
      chatbotNlpService.getActivityData().catch(() => null),
      chatbotNlpService.getTopicData().catch(() => null),
      chatbotNlpService.getNerData().catch(() => null),
      chatbotNlpService.getNerData().catch(() => null),
      chatbotNlpService.getIntentData().catch(() => null),
      chatbotAdvancedService.getTrends().catch(() => null),
      chatbotAdvancedService.getCoverage().catch(() => null),
    ]);
    const data = await chatbotAdvancedService.getInsights(kpiData, activityData, topicData,
      commodityData, locationData, intentData, trendData, coverageData);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.semanticSearch = async (req, res) => {
  try {
    const { q, type, intent, category, limit } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter "q" required' });
    const data = await chatbotAdvancedService.semanticSearch(q, { type, intent, category, limit: parseInt(limit) || 20 });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
