import express from 'express';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const procurementRouter = express.Router();

// BOQs
procurementRouter.get('/projects/:projectId/boqs', (req, res) => {
  const boqs = db.getBOQs(req.params.projectId);
  res.json(boqs);
});

procurementRouter.post('/projects/:projectId/boqs', (req, res) => {
  const boq = db.createBOQ({
    projectId: req.params.projectId,
    ...req.body
  });
  res.json(boq);
});

procurementRouter.get('/boqs/:boqId', (req, res) => {
  const boq = db.getBOQById(req.params.boqId);
  if (!boq) return res.status(404).json({ error: 'Not found' });
  const items = db.getBOQItems(req.params.boqId);
  res.json({ ...boq, items });
});

procurementRouter.patch('/boqs/:boqId', (req, res) => {
  const boq = db.updateBOQ(req.params.boqId, req.body);
  res.json(boq);
});

procurementRouter.post('/boqs/:boqId/items', (req, res) => {
  const item = db.createBOQItem({
    boqId: req.params.boqId,
    projectId: req.body.projectId, // normally from BOQ
    ...req.body
  });
  res.json(item);
});

procurementRouter.patch('/boq-items/:id', (req, res) => {
  const item = db.updateBOQItem(req.params.id, req.body);
  res.json(item);
});

procurementRouter.delete('/boq-items/:id', (req, res) => {
  db.deleteBOQItem(req.params.id);
  res.json({ success: true });
});

// RFQs
procurementRouter.get('/projects/:projectId/rfqs', (req, res) => {
  const rfqs = db.getProcurementRFQs(req.params.projectId);
  res.json(rfqs);
});

procurementRouter.post('/projects/:projectId/rfqs', (req, res) => {
  const rfq = db.createProcurementRFQ({
    projectId: req.params.projectId,
    ...req.body
  });
  res.json(rfq);
});

procurementRouter.get('/rfqs/:id', (req, res) => {
  const rfq = db.getProcurementRFQById(req.params.id);
  if (!rfq) return res.status(404).json({ error: 'Not found' });
  // Include invitations and quote summaries
  const invitations = db.getSupplierInvitations(req.params.id);
  const quotes = db.getVendorQuotes(req.params.id);
  res.json({ ...rfq, invitations, quotes });
});

procurementRouter.patch('/rfqs/:id', (req, res) => {
  const rfq = db.updateProcurementRFQ(req.params.id, req.body);
  res.json(rfq);
});

procurementRouter.post('/rfqs/:id/publish', (req, res) => {
  const rfq = db.updateProcurementRFQ(req.params.id, { status: 'PUBLISHED', publishedAt: new Date().toISOString() });
  res.json(rfq);
});

procurementRouter.post('/rfqs/:id/invite', (req, res) => {
  const inv = db.createSupplierInvitation({
    procurementRfqId: req.params.id,
    vendorId: req.body.vendorId,
    status: 'INVITED'
  });
  res.json(inv);
});

// Quotes
procurementRouter.get('/rfqs/:id/quotes', (req, res) => {
  const quotes = db.getVendorQuotes(req.params.id);
  res.json(quotes);
});

procurementRouter.post('/rfqs/:id/quotes', (req, res) => {
  const quote = db.createVendorQuote({
    procurementRfqId: req.params.id,
    projectId: req.body.projectId,
    vendorId: req.body.vendorId,
    status: 'DRAFT',
    ...req.body
  });
  res.json(quote);
});

procurementRouter.get('/quotes/:id', (req, res) => {
  const quote = db.getVendorQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });
  const items = db.getVendorQuoteItems(req.params.id);
  res.json({ ...quote, items });
});

procurementRouter.patch('/quotes/:id', (req, res) => {
  const quote = db.updateVendorQuote(req.params.id, req.body);
  res.json(quote);
});

procurementRouter.post('/quotes/:id/submit', (req, res) => {
  const quote = db.updateVendorQuote(req.params.id, { status: 'SUBMITTED', submittedAt: new Date().toISOString() });
  res.json(quote);
});

procurementRouter.post('/quotes/:quoteId/items', (req, res) => {
  const item = db.createVendorQuoteItem({
    quoteId: req.params.quoteId,
    ...req.body
  });
  res.json(item);
});

// Supplier Award
procurementRouter.post('/rfqs/:id/award', (req, res) => {
  const award = db.createSupplierAward({
    procurementRfqId: req.params.id,
    projectId: req.body.projectId,
    vendorQuoteId: req.body.vendorQuoteId,
    boqItemIds: req.body.boqItemIds,
    awardedValue: req.body.awardedValue,
    status: 'DRAFT'
  });
  res.json(award);
});

// Purchase Orders
procurementRouter.get('/projects/:projectId/purchase-orders', (req, res) => {
  const pos = db.getPurchaseOrders(req.params.projectId);
  res.json(pos);
});

procurementRouter.post('/projects/:projectId/purchase-orders', (req, res) => {
  const po = db.createPurchaseOrder({
    projectId: req.params.projectId,
    status: 'DRAFT',
    ...req.body
  });
  res.json(po);
});

procurementRouter.get('/purchase-orders/:id', (req, res) => {
  const po = db.getPurchaseOrderById(req.params.id);
  if (!po) return res.status(404).json({ error: 'Not found' });
  const items = db.getPurchaseOrderItems(req.params.id);
  const deliveries = db.getDeliveryRecords(req.params.id);
  res.json({ ...po, items, deliveries });
});

procurementRouter.patch('/purchase-orders/:id', (req, res) => {
  const po = db.updatePurchaseOrder(req.params.id, req.body);
  res.json(po);
});

procurementRouter.post('/purchase-orders/:id/issue', (req, res) => {
  const po = db.updatePurchaseOrder(req.params.id, { status: 'ISSUED' });
  res.json(po);
});

// Deliveries
procurementRouter.post('/purchase-orders/:id/deliveries', (req, res) => {
  const delivery = db.createDeliveryRecord({
    purchaseOrderId: req.params.id,
    projectId: req.body.projectId,
    status: 'EXPECTED',
    ...req.body
  });
  res.json(delivery);
});

procurementRouter.patch('/deliveries/:id', (req, res) => {
  const delivery = db.updateDeliveryRecord(req.params.id, req.body);
  res.json(delivery);
});




export default procurementRouter;
