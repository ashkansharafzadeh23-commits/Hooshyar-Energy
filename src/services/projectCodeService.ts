import { db } from '../db/index.js';

export function generateProjectCode(): string {
  const allProjects = db.getEnergyProjects();
  const count = allProjects.length + 1;
  const padded = count.toString().padStart(6, '0');
  return `HSE-IR-\${padded}`;
}
