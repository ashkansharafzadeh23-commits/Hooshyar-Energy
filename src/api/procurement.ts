import express from "express";
import { db } from "../db/index.js";
import { verifyAuthToken } from "./auth.js";

const router = express.Router();

// BOQ Endpoints
router.get("/projects/:projectId/boqs", verifyAuthToken, (req, res) => {
  const boqs = db.getBOQs(req.params.projectId);
  res.json(boqs);
});

router.post("/projects/:projectId/boqs", verifyAuthToken, (req, res) => {
  const boq = db.createBOQ({
    ...req.body,
    projectId: req.params.projectId,
    createdByUserId: (req as any).user.id,
    status: 'DRAFT'
  });
  res.json(boq);
});

router.get("/boqs/:boqId/items", verifyAuthToken, (req, res) => {
  const items = db.getBOQItems(req.params.boqId);
  res.json(items);
});

router.post("/boqs/:boqId/items", verifyAuthToken, (req, res) => {
  const item = db.createBOQItem({
    ...req.body,
    boqId: req.params.boqId
  });
  res.json(item);
});

router.post("/boqs/:boqId/approve", verifyAuthToken, (req, res) => {
  const boq = db.updateBOQ(req.params.boqId, {
    status: 'APPROVED',
    approvedAt: new Date().toISOString()
  });
  // Also create a project activity
  if (boq) {
    db.createProjectActivity({
      projectId: boq.projectId,
      type: 'DOCUMENT_APPROVED',
      title: 'BOQ Approved',
      description: `BOQ ${boq.boqCode} has been approved.`,
      performedByUserId: (req as any).user.id
    });
  }
  res.json(boq);
});


// RFQ Endpoints
router.get("/projects/:projectId/procurement-rfqs", verifyAuthToken, (req, res) => {
  const rfqs = db.getProcurementRFQs(req.params.projectId);
  res.json(rfqs);
});

router.post("/projects/:projectId/procurement-rfqs", verifyAuthToken, (req, res) => {
  const rfq = db.createProcurementRFQ({
    ...req.body,
    projectId: req.params.projectId,
    createdByUserId: (req as any).user.id,
    status: 'DRAFT'
  });
  res.json(rfq);
});

router.post("/procurement-rfqs/:rfqId/publish", verifyAuthToken, (req, res) => {
  const rfq = db.updateProcurementRFQ(req.params.rfqId, {
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString()
  });
  res.json(rfq);
});

router.get("/procurement-rfqs/:rfqId/quotes", verifyAuthToken, (req, res) => {
  const quotes = db.getVendorQuotes(req.params.rfqId);
  const quotesWithItems = quotes.map(q => {
    return {
      ...q,
      items: db.getVendorQuoteItems(q.id)
    };
  });
  res.json(quotesWithItems);
});

router.post("/procurement-rfqs/:rfqId/invite", verifyAuthToken, (req, res) => {
  const { vendorId } = req.body;
  const invitation = db.createSupplierInvitation({
    procurementRfqId: req.params.rfqId,
    vendorId,
    status: 'INVITED'
  });
  res.json(invitation);
});

// Quote submission (by vendor)
router.post("/procurement-rfqs/:rfqId/quotes", verifyAuthToken, (req, res) => {
  const userId = (req as any).user.id;
  const rfq = db.getProcurementRFQById(req.params.rfqId);
  
  if (!rfq) return res.status(404).json({ error: "RFQ not found" });

  const { items, ...quoteData } = req.body;

  const quote = db.createVendorQuote({
    ...quoteData,
    procurementRfqId: req.params.rfqId,
    projectId: rfq.projectId,
    createdByUserId: userId,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString()
  });

  if (items && Array.isArray(items)) {
    items.forEach(item => {
      db.createVendorQuoteItem({
        ...item,
        quoteId: quote.id
      });
    });
  }
  
  // Calculate compliance simple dummy logic for now
  db.createProjectActivity({
    projectId: rfq.projectId,
    type: 'QUOTE_RECEIVED',
    title: 'New Vendor Quote',
    description: `Quote received for RFQ ${rfq.procurementRfqCode}`,
    performedByUserId: userId
  });

  res.json(quote);
});

// Award & PO
router.post("/procurement-rfqs/:rfqId/award", verifyAuthToken, (req, res) => {
  const rfq = db.getProcurementRFQById(req.params.rfqId);
  const award = db.createSupplierAward({
    ...req.body,
    procurementRfqId: req.params.rfqId,
    projectId: rfq?.projectId,
    status: 'AWARDED'
  });
  
  db.updateProcurementRFQ(req.params.rfqId, { status: 'AWARDED' });

  // Generate PO
  const po = db.createPurchaseOrder({
    projectId: rfq?.projectId,
    vendorId: req.body.vendorId, // pass vendorId in request
    supplierAwardId: award.id,
    status: 'DRAFT',
    currency: req.body.currency,
    totalValue: req.body.awardedValue,
    createdByUserId: (req as any).user.id
  });

  res.json({ award, po });
});

router.get("/projects/:projectId/purchase-orders", verifyAuthToken, (req, res) => {
  const pos = db.getPurchaseOrders(req.params.projectId);
  res.json(pos);
});

router.post("/purchase-orders/:poId/issue", verifyAuthToken, (req, res) => {
  const po = db.updatePurchaseOrder(req.params.poId, {
    status: 'ISSUED',
    issueDate: new Date().toISOString()
  });
  res.json(po);
});

router.post("/purchase-orders/:poId/deliveries", verifyAuthToken, (req, res) => {
  const po = db.getPurchaseOrderById(req.params.poId);
  const delivery = db.createDeliveryRecord({
    ...req.body,
    purchaseOrderId: req.params.poId,
    projectId: po?.projectId,
    status: 'EXPECTED',
    deliveryNumber: 'DEL-HSE-' + Date.now()
  });
  res.json(delivery);
});

export default router;
