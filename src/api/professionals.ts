import express from "express";
import { professionalRepository } from '../repositories/professionalRepository.js';

const professionalsRouter = express.Router();

export interface PublicProfessionalProfile {
  id: string;
  fullName: string;
  specialties: string[];
  serviceCities: string[];
  yearsExperience: number;
  bio: string;
  profileImageUrl: string;
  verified: boolean;
  status: string;
  createdAt: string;
}

export function toPublicProfessional(pro: any): PublicProfessionalProfile {
  return {
    id: pro.id,
    fullName: pro.fullName || "متخصص فنی خورشیدی",
    specialties: pro.specialties || [],
    serviceCities: pro.serviceCities || [],
    yearsExperience: pro.yearsExperience || 0,
    bio: pro.bio || "",
    profileImageUrl: pro.profileImageUrl || "",
    verified: pro.status === "approved",
    status: pro.status,
    createdAt: pro.createdAt,
  };
}

professionalsRouter.post("/register", (req, res) => {
  const {
    fullName,
    phone,
    specialties,
    serviceCities,
    yearsExperience,
    bio,
    profileImageUrl,
    certifications,
  } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: "نام و شماره همراه الزامی است." });
  }

  const newPro = professionalRepository.createProfessional({
    fullName,
    phone,
    specialties: Array.isArray(specialties) ? specialties : (specialties ? [specialties] : ['پنل‌های خورشیدی']),
    serviceCities: Array.isArray(serviceCities) ? serviceCities : (serviceCities ? [serviceCities] : []),
    yearsExperience: Number(yearsExperience) || 0,
    bio: bio || "",
    profileImageUrl: profileImageUrl || "",
    certifications: certifications || [],
    rating: null,
  });

  res.json({ 
    message: "ثبت‌نام با موفقیت انجام شد. پروفایل در انتظار بررسی است.", 
    professional: toPublicProfessional(newPro) 
  });
});

professionalsRouter.get("/:id", (req, res) => {
  const pro = professionalRepository.getProfessionalById(req.params.id);
  if (!pro) return res.status(404).json({ error: "متخصص یافت نشد." });
  res.json({ professional: toPublicProfessional(pro) });
});

professionalsRouter.get("/", (req, res) => {
  const pros = (professionalRepository.getProfessionals() || [])
    .filter(p => p.status === "approved")
    .map(toPublicProfessional);
  res.json({ professionals: pros });
});

export default professionalsRouter;
