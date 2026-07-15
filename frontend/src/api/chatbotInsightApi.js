const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const headers = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const fetcher = async (url, signal) => {
  const res = await fetch(url, { headers: headers(), signal });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Request failed'); }
  const j = await res.json();
  if (!j.success) throw new Error(j.message || 'Request failed');
  return j.data;
};

export const fetchChatbotDashboard = async (filters = {}, signal) => {
  const p = new URLSearchParams();
  if (filters.startDate) p.set('startDate', filters.startDate);
  if (filters.endDate) p.set('endDate', filters.endDate);
  if (filters.session_id) p.set('session_id', filters.session_id);
  if (filters.keyword) p.set('keyword', filters.keyword);
  if (filters.category) p.set('category', filters.category);
  if (filters.minChar !== undefined && filters.minChar !== '') p.set('minChar', filters.minChar);
  if (filters.maxChar !== undefined && filters.maxChar !== '') p.set('maxChar', filters.maxChar);
  const qs = p.toString();
  return fetcher(`${BASE_URL}/chatbot-insight/dashboard${qs ? '?' + qs : ''}`, signal);
};

export const fetchChatbotFilters = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/filters`, signal);

export const fetchChatbotActivity = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/activity`, signal);

export const fetchChatbotTopics = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/topics`, signal);

export const fetchChatbotEntities = async (search, signal) => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetcher(`${BASE_URL}/chatbot-insight/entities${qs}`, signal);
};

export const fetchChatbotNer = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/ner`, signal);

export const fetchChatbotIntent = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/intent`, signal);

export const triggerNlpProcess = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/process`, signal);

export const fetchSemanticNetwork = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/semantic-network`, signal);

export const fetchKnowledgeGraph = async (params = {}, signal) => {
  const p = new URLSearchParams();
  if (params.query) p.set('query', params.query);
  if (params.nodeType) p.set('nodeType', params.nodeType);
  if (params.relationType) p.set('relationType', params.relationType);
  const qs = p.toString();
  return fetcher(`${BASE_URL}/chatbot-insight/knowledge-graph${qs ? '?' + qs : ''}`, signal);
};

export const fetchRecommendations = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/recommendations`, signal);

export const fetchProblems = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/problems`, signal);

export const fetchTrends = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/trends`, signal);

export const fetchCoverage = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/coverage`, signal);

export const fetchInsights = async (signal) =>
  fetcher(`${BASE_URL}/chatbot-insight/insights`, signal);

export const semanticSearch = async (query, params = {}, signal) => {
  const p = new URLSearchParams({ q: query });
  if (params.type) p.set('type', params.type);
  if (params.intent) p.set('intent', params.intent);
  if (params.category) p.set('category', params.category);
  if (params.limit) p.set('limit', params.limit);
  return fetcher(`${BASE_URL}/chatbot-insight/semantic-search?${p.toString()}`, signal);
};
