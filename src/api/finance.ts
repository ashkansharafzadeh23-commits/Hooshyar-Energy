import { Router } from 'express';
import { db } from '../db/index.js';
import { financeService } from '../services/financeService.js';
import { ProjectFinancialModel, FinancialAssumptionSet, FinancialScenario } from '../types/finance.js';

const router = Router();

// Get financial model by project ID
router.get('/projects/:projectId/financial-models', (req, res) => {
  const models = db.getFinancialModelsByProjectId(req.params.projectId);
  res.json(models);
});

// Create financial model
router.post('/projects/:projectId/financial-models', (req, res) => {
  const { model, assumptions } = req.body;
  
  const newAssumptions = db.createFinancialAssumptionSet(assumptions);
  model.assumptionSetId = newAssumptions.id;
  model.projectId = req.params.projectId;
  
  const newModel = db.createFinancialModel(model);
  res.json({ model: newModel, assumptions: newAssumptions });
});

// Calculate financial model
router.post('/projects/:projectId/financial-models/:modelId/calculate', (req, res) => {
  const model = db.getFinancialModelById(req.params.modelId);
  if (!model) return res.status(404).json({ error: 'Model not found' });
  
  const assumptions = db.getFinancialAssumptionSetById(model.assumptionSetId);
  if (!assumptions) return res.status(404).json({ error: 'Assumptions not found' });
  
  const results = financeService.calculateModel(model, assumptions);
  
  const updatedModel = db.updateFinancialModel(model.id, { results, calculatedAt: new Date().toISOString() });
  res.json(updatedModel);
});

// Create scenario
router.post('/projects/:projectId/financial-models/:modelId/scenarios', (req, res) => {
  const model = db.getFinancialModelById(req.params.modelId);
  if (!model) return res.status(404).json({ error: 'Model not found' });
  
  const assumptions = db.getFinancialAssumptionSetById(model.assumptionSetId);
  if (!assumptions) return res.status(404).json({ error: 'Assumptions not found' });
  
  const scenarioData = req.body;
  scenarioData.projectId = req.params.projectId;
  scenarioData.financialModelId = req.params.modelId;
  
  // Calculate scenario results before saving
  const results = financeService.calculateScenario(scenarioData, model, assumptions);
  scenarioData.results = results;
  
  const newScenario = db.createFinancialScenario(scenarioData);
  res.json(newScenario);
});

// Get scenarios
router.get('/projects/:projectId/financial-models/:modelId/scenarios', (req, res) => {
  const scenarios = db.getFinancialScenariosByModelId(req.params.modelId);
  res.json(scenarios);
});

export default router;
