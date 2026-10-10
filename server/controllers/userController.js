import sql from "../configs/db.js";
import { sendSuccess } from "../middlewares/responseHandler.js";
import { NotFoundError, ValidationError } from "../middlewares/errorHandler.js";
import * as localDb from "../db/localDb.js";


export const getUserCreations = async (req, res, next) => {
  try {
    const userId = req.userId;
    const creations = localDb.getUserCreations(userId);
    sendSuccess(res, { creations });
  } catch (error) {
    next(error);
  }
};

export const getPublishedCreations = async (req, res, next) => {
  try {
    const creations = localDb.getPublishedCreations();
    sendSuccess(res, { creations });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeCreation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    if (!id) {
      throw new ValidationError("Creation ID is required");
    }

    const likes = localDb.toggleLikeCreation(Number(id), userId);
    if (!likes) {
      throw new NotFoundError("Creation not found");
    }

    sendSuccess(res, { message: "Creation Liked Status Updated", likes });
  } catch (error) {
    next(error);
  }
};

export const getCredits = async (req, res, next) => {
  try {
    const userId = req.userId;
    const credits = localDb.getCredits(userId);
    sendSuccess(res, { credits });
  } catch (error) {
    next(error);
  }
};

export const getCommunityPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const posts = localDb.getPosts(category, search);
    sendSuccess(res, { posts });
  } catch (error) {
    next(error);
  }
};

export const getCommunityPostDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = localDb.getPostById(Number(id));
    if (!post) {
      throw new NotFoundError("Community post not found");
    }
    const replies = localDb.getRepliesForPost(Number(id));
    sendSuccess(res, { post, replies });
  } catch (error) {
    next(error);
  }
};

export const createCommunityPost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      throw new ValidationError("Title, content, and category are required");
    }

    const postId = localDb.createPost({ userId, title, content, category });
    sendSuccess(res, { message: "Question posted successfully", postId });
  } catch (error) {
    next(error);
  }
};

export const toggleCommunityPostUpvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const upvotes = localDb.togglePostUpvote(Number(id), userId);
    if (!upvotes) {
      throw new NotFoundError("Post not found");
    }

    sendSuccess(res, { message: "Upvote toggled", upvotes });
  } catch (error) {
    next(error);
  }
};

export const createCommunityReply = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new ValidationError("Reply content is required");
    }

    const replyId = localDb.createReply({ postId: Number(postId), userId, content });
    sendSuccess(res, { message: "Reply added successfully", replyId });
  } catch (error) {
    next(error);
  }
};

export const toggleCommunityReplyRecommendation = async (req, res, next) => {
  try {
    const { id: replyId } = req.params;
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Only administrators can recommend answers." });
    }

    const newStatus = localDb.toggleReplyRecommendation(Number(replyId));
    if (newStatus === null) {
      throw new NotFoundError("Reply not found");
    }

    sendSuccess(res, { message: newStatus ? "Answer recommended" : "Recommendation removed", is_recommended: newStatus });
  } catch (error) {
    next(error);
  }
};

// ── Admin Control Controllers ────────────────────────────────────────────────
export const adminGetUsers = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
    const users = localDb.getAllUsers();
    sendSuccess(res, { users });
  } catch (error) {
    next(error);
  }
};

export const adminAddUser = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
    const { email, password, fullName, role, plan, credits } = req.body;
    if (!email || !password || !fullName) {
      throw new ValidationError("Email, password, and fullName are required");
    }
    localDb.addUser({ email, password, fullName, role, plan, credits });
    sendSuccess(res, { message: "User added successfully" });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
    const { id } = req.params;
    localDb.deleteUser(id);
    sendSuccess(res, { message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCredits = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
    const { id } = req.params;
    const { credits } = req.body;
    if (credits === undefined) {
      throw new ValidationError("Credits amount is required");
    }
    localDb.updateUserCredits(id, Number(credits));
    sendSuccess(res, { message: "User credits updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUser = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
    const { id } = req.params;
    const { fullName, email, role, plan, credits, password } = req.body;
    if (!fullName || !email || !role || !plan || credits === undefined) {
      throw new ValidationError("fullName, email, role, plan, and credits are required");
    }
    localDb.updateUserAdmin(id, { fullName, email, role, plan, credits, password });
    sendSuccess(res, { message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const adminGetCreations = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
    const creations = localDb.getAllCreations();
    sendSuccess(res, { creations });
  } catch (error) {
    next(error);
  }
};

