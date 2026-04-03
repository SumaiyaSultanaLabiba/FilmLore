import express from "express";
import { signUp,login, editFullname, editEmail, editDOB, editProfilePicture, getStatistics, getMyBlogs, getMyComments, getSuggestions } from "../controllers/userController.js";

const router=express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/editFullname", editFullname);
router.post("/editEmail", editEmail);
router.post("/editDOB", editDOB);
router.post("/editProfilePicture", editProfilePicture);
router.get("/getStatistics", getStatistics);
router.post("/getMyBlogs", getMyBlogs);
router.post("/getMyComments", getMyComments);
router.post("/getSuggestions", getSuggestions);

export default router;

