import { db } from '../db/index.js';
import { EnergyProject, ProjectMember, ProjectDocument, ProjectActivity } from '../types/project.js';

export const projectRepository = {
  findAll: () => db.getEnergyProjects(),
  findById: (id: string) => db.getEnergyProjectById(id),
  create: (project: Omit<EnergyProject, "id" | "createdAt" | "updatedAt">) => db.createEnergyProject(project),
  update: (id: string, updates: Partial<EnergyProject>) => db.updateEnergyProject(id, updates),
  
  getMembers: (projectId: string) => db.getProjectMembers(projectId),
  addMember: (member: Omit<ProjectMember, "id" | "createdAt">) => db.createProjectMember(member),
  
  getDocuments: (projectId: string) => db.getProjectDocuments(projectId),
  addDocument: (doc: Omit<ProjectDocument, "id" | "createdAt">) => db.createProjectDocument(doc),
  
  getActivities: (projectId: string) => db.getProjectActivities(projectId),
  addActivity: (activity: Omit<ProjectActivity, "id" | "createdAt">) => db.createProjectActivity(activity),

  getAnalysisHistoryById: (id: string) => db.getAnalysisHistoryById(id),
  updateAnalysisHistoryProjectId: (id: string, projectId: string) => db.updateAnalysisHistoryProjectId(id, projectId)
};
