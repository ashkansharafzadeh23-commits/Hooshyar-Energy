import { ProjectStatus } from '../types/project.js';

export const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ['ANALYSIS', 'CANCELLED'],
  ANALYSIS: ['FEASIBILITY', 'CANCELLED'],
  FEASIBILITY: ['READY_FOR_RFQ', 'CANCELLED'],
  READY_FOR_RFQ: ['RFQ_OPEN', 'CANCELLED'],
  RFQ_OPEN: ['BIDS_RECEIVED', 'CANCELLED'],
  BIDS_RECEIVED: ['EPC_SELECTED', 'CANCELLED'],
  EPC_SELECTED: ['CONTRACTING', 'CANCELLED'],
  CONTRACTING: ['FINANCING', 'PROCUREMENT', 'CANCELLED'],
  FINANCING: ['PROCUREMENT', 'CANCELLED'],
  PROCUREMENT: ['CONSTRUCTION', 'CANCELLED'],
  CONSTRUCTION: ['COMMISSIONING', 'CANCELLED'],
  COMMISSIONING: ['OPERATIONAL', 'CANCELLED'],
  OPERATIONAL: ['MAINTENANCE'],
  MAINTENANCE: ['OPERATIONAL'],
  CANCELLED: []
};

export function canTransition(current: ProjectStatus, target: ProjectStatus): boolean {
  if (current === target) return true;
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}
