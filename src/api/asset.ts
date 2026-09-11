import express from 'express';
import { db } from '../db/index.js';

const assetRouter = express.Router();

assetRouter.get('/assets', (req, res) => {
  res.json(db.getAssets());
});

assetRouter.get('/assets/:id', (req, res) => {
  const asset = db.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Not found' });
  res.json(asset);
});

assetRouter.patch('/assets/:id', (req, res) => {
  const asset = db.updateAsset(req.params.id, req.body);
  res.json(asset);
});

assetRouter.get('/projects/:projectId/assets', (req, res) => {
  res.json(db.getAssetsByProjectId(req.params.projectId));
});

assetRouter.post('/projects/:projectId/assets', (req, res) => {
  const asset = db.createAsset({
    projectId: req.params.projectId,
    status: 'COMMISSIONING',
    ...req.body
  });
  res.json(asset);
});

// Components
assetRouter.get('/assets/:id/components', (req, res) => {
  res.json(db.getAssetComponents(req.params.id));
});

assetRouter.post('/assets/:id/components', (req, res) => {
  const comp = db.createAssetComponent({
    assetId: req.params.id,
    status: 'INSTALLED',
    ...req.body
  });
  res.json(comp);
});

assetRouter.patch('/components/:id', (req, res) => {
  res.json(db.updateAssetComponent(req.params.id, req.body));
});

// Warranties
assetRouter.get('/assets/:id/warranties', (req, res) => {
  res.json(db.getEquipmentWarranties(req.params.id));
});

assetRouter.post('/assets/:id/warranties', (req, res) => {
  res.json(db.createEquipmentWarranty({
    assetId: req.params.id,
    status: 'ACTIVE',
    ...req.body
  }));
});

// Commissioning
assetRouter.get('/projects/:projectId/commissioning', (req, res) => {
  res.json(db.getCommissioningRecords(req.params.projectId));
});

assetRouter.post('/projects/:projectId/commissioning', (req, res) => {
  const rec = db.createCommissioningRecord({
    projectId: req.params.projectId,
    status: 'DRAFT',
    ...req.body
  });
  res.json(rec);
});

assetRouter.patch('/commissioning/:id', (req, res) => {
  res.json(db.updateCommissioningRecord(req.params.id, req.body));
});

assetRouter.get('/commissioning/:id/tests', (req, res) => {
  res.json(db.getCommissioningTests(req.params.id));
});

assetRouter.post('/commissioning/:id/tests', (req, res) => {
  res.json(db.createCommissioningTest({
    commissioningRecordId: req.params.id,
    status: 'NOT_STARTED',
    ...req.body
  }));
});

assetRouter.patch('/commissioning-tests/:id', (req, res) => {
  res.json(db.updateCommissioningTest(req.params.id, req.body));
});

// Handover
assetRouter.get('/projects/:projectId/handover', (req, res) => {
  res.json(db.getProjectHandover(req.params.projectId));
});

assetRouter.post('/projects/:projectId/handover', (req, res) => {
  res.json(db.createProjectHandover({
    projectId: req.params.projectId,
    status: 'DRAFT',
    ...req.body
  }));
});

assetRouter.patch('/handover/:id', (req, res) => {
  res.json(db.updateProjectHandover(req.params.id, req.body));
});

// Passport Snapshots
assetRouter.get('/assets/:id/passport-snapshots', (req, res) => {
  res.json(db.getAssetPassportSnapshots(req.params.id));
});

assetRouter.post('/assets/:id/passport-snapshots', (req, res) => {
  res.json(db.createAssetPassportSnapshot({
    assetId: req.params.id,
    ...req.body
  }));
});

export default assetRouter;
