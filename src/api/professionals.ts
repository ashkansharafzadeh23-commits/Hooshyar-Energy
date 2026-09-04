import express from "express";
import { db } from "../db/index.js";

const professionalsRouter = express.Router();

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
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const newPro = db.createProfessional({
    fullName,
    phone,
    specialties: specialties || [],
    serviceCities: serviceCities || [],
    yearsExperience: yearsExperience || 0,
    bio: bio || "",
    profileImageUrl: profileImageUrl || "",
    certifications: certifications || [],
    rating: null,
  });

  res.json({ message: "Registration successful. Pending admin review.", professional: newPro });
});

professionalsRouter.get("/:id", (req, res) => {
  const pro = db.getProfessionalById(req.params.id);
  if (!pro) return res.status(404).json({ error: "Professional not found" });
  res.json({ professional: pro });
});

professionalsRouter.get("/", (req, res) => {
  const pros = db.getProfessionals().filter(p => p.status === "approved");
  res.json({ professionals: pros });
});

export default professionalsRouter;
