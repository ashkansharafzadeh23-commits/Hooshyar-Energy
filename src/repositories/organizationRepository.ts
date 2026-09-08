import { db } from '../db/index.js';
import { Organization } from '../types/organization.js';

export const organizationRepository = {
  findAll: () => db.getOrganizations(),
  findById: (id: string) => db.getOrganizationById(id),
  create: (org: Omit<Organization, "id" | "createdAt" | "updatedAt">) => db.createOrganization(org)
};
