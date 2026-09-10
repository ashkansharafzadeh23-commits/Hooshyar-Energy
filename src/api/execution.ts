import express from 'express';
import { db } from '../db/index.js';
import { ProjectContract, ProjectMilestone } from '../types/execution.js';

const router = express.Router({ mergeParams: true });

// --- Contracts ---
router.get('/:projectId/contracts', (req, res) => {
  const { projectId } = req.params;
  const contracts = db.getProjectContracts(projectId);
  res.json(contracts);
});

router.post('/:projectId/contracts', (req, res) => {
  const { projectId } = req.params;
  const contractData = req.body;
  const newContract = db.createContract({
    ...contractData,
    projectId,
    status: 'DRAFT',
  });
  
  // Create an initial set of milestones if it's an EPC contract
  if (newContract.contractType === 'EPC') {
    const templates = [
      { title: 'مهندسی نهایی', category: 'ENGINEERING', sequence: 1, weightPercent: 10 },
      { title: 'تأمین تجهیزات', category: 'PROCUREMENT', sequence: 2, weightPercent: 40 },
      { title: 'عملیات ساختمانی', category: 'CIVIL_WORKS', sequence: 3, weightPercent: 15 },
      { title: 'نصب تجهیزات', category: 'INSTALLATION', sequence: 4, weightPercent: 20 },
      { title: 'تست و راه‌اندازی', category: 'COMMISSIONING', sequence: 5, weightPercent: 15 }
    ];
    templates.forEach(t => {
      db.createMilestone({
        projectId,
        contractId: newContract.id,
        milestoneCode: `MS-${Math.floor(Math.random()*1000)}`,
        title: t.title,
        category: t.category,
        sequence: t.sequence,
        weightPercent: t.weightPercent,
        completionPercent: 0,
        status: 'NOT_STARTED',
        requiresApproval: true,
        evidenceRequired: true
      });
    });
  }
  
  res.status(201).json(newContract);
});

router.patch('/:projectId/contracts/:contractId', (req, res) => {
  const { contractId } = req.params;
  const updated = db.updateContract(contractId, req.body);
  if (!updated) return res.status(404).json({ error: 'Contract not found' });
  res.json(updated);
});

// --- Milestones ---
router.get('/:projectId/milestones', (req, res) => {
  const { projectId } = req.params;
  const milestones = db.getProjectMilestones(projectId);
  res.json(milestones);
});

router.patch('/:projectId/milestones/:milestoneId', (req, res) => {
  const { milestoneId } = req.params;
  const updated = db.updateMilestone(milestoneId, req.body);
  if (!updated) return res.status(404).json({ error: 'Milestone not found' });
  res.json(updated);
});

// Approvals
router.get('/:projectId/approvals', (req, res) => {
  const { projectId } = req.params;
  const approvals = db.getApprovalRequests(projectId);
  res.json(approvals);
});

router.post('/:projectId/approvals', (req, res) => {
  const { projectId } = req.params;
  const reqData = req.body;
  const newApproval = db.createApprovalRequest({
    ...reqData,
    projectId,
    status: 'PENDING'
  });
  res.status(201).json(newApproval);
});

router.patch('/:projectId/approvals/:approvalId', (req, res) => {
  const { approvalId } = req.params;
  const updated = db.updateApprovalRequest(approvalId, req.body);
  if (!updated) return res.status(404).json({ error: 'Approval not found' });
  
  // If it's a milestone approval and approved, update the milestone
  if (updated.status === 'APPROVED' && updated.entityType === 'MILESTONE') {
    db.updateMilestone(updated.entityId, { status: 'COMPLETED', completionPercent: 100 });
  } else if (updated.status === 'REJECTED' && updated.entityType === 'MILESTONE') {
    db.updateMilestone(updated.entityId, { status: 'REJECTED' });
  }

  res.json(updated);
});

export default router;
