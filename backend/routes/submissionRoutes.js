import express from "express";
import { submit, approve, getAllSubmissions, addMovie, addSeries, approvedMedia, rejectedMedia } from "../controllers/submissionController.js";

const router=express.Router();

router.post("/submit", submit);
router.post("/approve", approve);
router.get("/getAllSubmissions", getAllSubmissions);
router.post("/addMovie", addMovie);
router.post("/addSeries", addSeries);
router.post("/approvedMedia", approvedMedia);
router.post("/rejectedMedia", rejectedMedia);

export default router;

