# nlp/ Directory — Final Layout (Phase 3 TASK 1)

Finalized during Phase 3 TASK 1. The `sugi_insights` Mongoose models
(`SessionSummary`, `NlpResult`) moved from `model/sugi_insights/` to
`model/insights/` alongside every other model; the `dbName: 'sugi_insights'`
binding is unchanged in `connection/db.js` and `model/insights/index.js` still
re-exports `insightsConnection` there (`code/source-checked`).

Old `src/nlp/` allocation: nothing was left behind — Phase 2 Task 4 moved the
pure computation modules; the old `src/` tree no longer exists (`Test-Path
src/nlp` = False).

## Pure computation modules (in `nlp/`, one concern per file)

| File                 | Purpose                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `preprocessor.js`    | Tokenizes + normalizes raw text into `tokens` / `filtered_tokens` (with stopwords + stemming) |
| `stemmer.js`         | `IndonesianStemmer` — rule-based stemmer for Bahasa Indonesia                                 |
| `stopwords.js`       | `Set` of Indonesian stopwords used to build `filtered_tokens`                                 |
| `entities.js`        | `EntityExtractor` — commodities/locations/entities from text                                  |
| `intent.js`          | `IntentClassifier` — keyword-based intent classification + confidence scores                  |
| `sentiment.js`       | `SentimentAnalyzer` — positive/negative/neutral scoring + emotions                            |
| `topics.js`          | Topic modeler (uses `natural` TF-IDF-style grouping)                                          |
| `relations.js`       | `RELATION_PATTERNS` — relation extraction between entities                                    |
| `knowledgeGraph.js`  | Builds a knowledge graph from extracted relations                                             |
| `recommendations.js` | `RecommendationMiner` — actionable recommendations from results                               |
| `problems.js`        | `ProblemMiner` — problem/shortfall detection from results                                     |
| `trends.js`          | `TrendAnalyzer` — temporal trend computation across results                                   |
| `coverage.js`        | `CoverageAnalyzer` — coverage stats of topics/entities/locations                              |
| `semanticSearch.js`  | `SemanticSearch` — vector-ish semantic search over indexed results                            |
| `insights.js`        | `InsightEngine` — 10 dynamic insight types in Bahasa Indonesia                                |
| `optimization.js`    | `WorkerQueue` + `Memoizer` — concurrency + caching utilities                                  |

## Coordination + split layers

| Path                                         | Purpose                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nlp/pipeline.js`                            | `NlpPipeline` — orchestrates preprocessor → entities → intent → sentiment → repository persistence |
| `nlp/repository/chatbotNlpRepository.js`     | DB access: reads writer `NlpResult` records (`model/insights/NlpResult`)                           |
| `nlp/repository/chatbotInsightRepository.js` | DB access: `SessionSummary` + `NlpResult` for the insight engine (`model/insights/*`)              |
| `nlp/service/chatbotNlpService.js`           | High-level NLP orchestration used by the chatbot controller                                        |
| `nlp/service/chatbotInsightService.js`       | Insight-engine service used by the chatbot controller                                              |
| `nlp/service/chatbotAdvancedService.js`      | Aggregates relations/KG/recommendations/problems/trends/coverage/insights/semantic search          |

Verification: server booted clean (main + `sugi_insights` connections), and the
moved models were exercised live — `GET /api/chatbot-insight/filters` 200,
`GET /api/chatbot-insight/insights` 200, `POST /api/chatbot-insight/process`
200 (cached).
