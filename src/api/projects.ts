import express from 'express';
import { verifyAuthToken } from './auth.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { generateProjectCode } from '../services/projectCodeService.js';
import { canTransition } from '../services/projectLifecycleService.js';

const router = express.Router();

router.use(verifyAuthToken);

// GET /api/projects
router.get('/', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const allProjects = projectRepository.findAll();
  
  if (user.role === 'admin') {
    return res.json(allProjects);
  }

  // Find projects where user is a member
  const userProjects = allProjects.filter(p => {
    const members = projectRepository.getMembers(p.id);
    return p.ownerId === user.id || members.some(m => m.userId === user.id);
  });
  
  res.json(userProjects);
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const project = projectRepository.findById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const members = projectRepository.getMembers(project.id);
  const isMember = project.ownerId === user.id || members.some(m => m.userId === user.id);
  if (!isMember && user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(project);
});

// POST /api/projects/from-analysis/:analysisId
router.post('/from-analysis/:analysisId', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const analysis = projectRepository.getAnalysisHistoryById(req.params.analysisId);
  if (!analysis) return res.status(404).json({ error: "Analysis not found" });

  if (analysis.userId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (analysis.projectId) {
    return res.status(400).json({ error: "Analysis already converted to a project", projectId: analysis.projectId });
  }

  const { input, fullResult } = analysis;
  
  // Create Project
  const projectCode = generateProjectCode();
  const project = projectRepository.create({
    projectCode,
    ownerId: user.id,
    title: `پروژه \${input.targets?.join(', ') || 'انرژی'} - \${input.city || 'نامشخص'}`,
    projectType: input.targets?.includes('solar') ? 'SOLAR' : 'GENERATOR',
    status: 'ANALYSIS',
    location: {
      country: 'IR',
      province: input.province || '',
      city: input.city || '',
      address: ''
    },
    site: {
      type: input.locationType || 'residential',
      areaM2: input.area || 0,
      usableAreaM2: input.usableArea || 0
    },
    energyRequirement: {
      monthlyConsumptionKwh: fullResult.engineResult?.dailyConsumptionEstimate?.monthlyKwh || 0,
      gridConnected: input.gridConnected ?? true,
      gridStable: input.gridStable ?? true,
    },
    targetCapacityKw: fullResult.engineResult?.solar?.finalKwp || 0,
    estimatedBudgetIRR: fullResult.estimatedTotalCost || fullResult.engineResult?.solar?.estimatedTotalCost || 0,
    sourceAnalysisId: analysis.id
  });

  projectRepository.updateAnalysisHistoryProjectId(analysis.id, project.id);

  projectRepository.addMember({
    projectId: project.id,
    userId: user.id,
    role: 'OWNER',
    status: 'ACTIVE'
  });

  projectRepository.addActivity({
    projectId: project.id,
    actorUserId: user.id,
    eventType: 'PROJECT_CREATED',
    entityType: 'EnergyProject',
    entityId: project.id,
    metadata: { sourceAnalysisId: analysis.id }
  });

  res.json(project);
});

// POST /api/projects/:id/status
router.post('/:id/status', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const project = projectRepository.findById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (project.ownerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { status } = req.body;
  if (!canTransition(project.status, status)) {
    return res.status(400).json({ error: "Invalid status transition" });
  }

  const updated = projectRepository.update(project.id, { status });
  
  projectRepository.addActivity({
    projectId: project.id,
    actorUserId: user.id,
    eventType: 'STATUS_CHANGED',
    entityType: 'EnergyProject',
    entityId: project.id,
    metadata: { oldStatus: project.status, newStatus: status }
  });

  res.json(updated);
});

// GET /api/projects/:id/members
router.get('/:id/members', (req, res) => {
  res.json(projectRepository.getMembers(req.params.id));
});

// GET /api/projects/:id/documents
router.get('/:id/documents', (req, res) => {
  res.json(projectRepository.getDocuments(req.params.id));
});

// GET /api/projects/:id/activity
router.get('/:id/activity', (req, res) => {
  res.json(projectRepository.getActivities(req.params.id));
});

export default router;
