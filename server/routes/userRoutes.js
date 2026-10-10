import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getPublishedCreations,
  getUserCreations,
  toggleLikeCreation,
  getCredits,
  getCommunityPosts,
  getCommunityPostDetail,
  createCommunityPost,
  toggleCommunityPostUpvote,
  createCommunityReply,
  toggleCommunityReplyRecommendation,
  adminGetUsers,
  adminAddUser,
  adminDeleteUser,
  adminUpdateCredits,
  adminUpdateUser,
  adminGetCreations,
} from "../controllers/userController.js";

const userRouter = express.Router();


userRouter.get("/get-user-creations", auth, getUserCreations);
userRouter.get("/get-published-creations", auth, getPublishedCreations);
userRouter.get("/get-credits", auth, getCredits);
userRouter.post("/toggle-like-creation", auth, toggleLikeCreation);

// Community Q&A forum routes
userRouter.get("/community/posts", auth, getCommunityPosts);
userRouter.get("/community/posts/:id", auth, getCommunityPostDetail);
userRouter.post("/community/posts", auth, createCommunityPost);
userRouter.post("/community/posts/:id/upvote", auth, toggleCommunityPostUpvote);
userRouter.post("/community/posts/:id/reply", auth, createCommunityReply);
userRouter.post("/community/replies/:id/recommend", auth, toggleCommunityReplyRecommendation);

// Admin Control Panel routes
userRouter.get("/admin/users", auth, adminGetUsers);
userRouter.post("/admin/users", auth, adminAddUser);
userRouter.put("/admin/users/:id", auth, adminUpdateUser);
userRouter.delete("/admin/users/:id", auth, adminDeleteUser);
userRouter.post("/admin/users/:id/credits", auth, adminUpdateCredits);
userRouter.get("/admin/creations", auth, adminGetCreations);

export default userRouter;
