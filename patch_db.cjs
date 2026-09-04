const fs = require('fs');

let code = fs.readFileSync('src/db/index.ts', 'utf8');

if (!code.includes('addRecommendationLog')) {
  code = code.replace(
    /addHistory: \(history: Omit<AnalysisHistory, "id" \| "createdAt">\) => \{/,
    `addRecommendationLog: (log: any) => {
    const data = readDB();
    if (!data.aiRecommendationLogs) data.aiRecommendationLogs = [];
    data.aiRecommendationLogs.push({ ...log, id: uuidv4(), createdAt: new Date().toISOString() });
    writeDB(data);
  },
  addHistory: (history: Omit<AnalysisHistory, "id" | "createdAt">) => {`
  );
  
  // Also add aiRecommendationLogs to DB interface
  code = code.replace(
    /analysisHistory: AnalysisHistory\[\];/,
    `analysisHistory: AnalysisHistory[];\n  aiRecommendationLogs?: any[];`
  );
  
  fs.writeFileSync('src/db/index.ts', code);
}
