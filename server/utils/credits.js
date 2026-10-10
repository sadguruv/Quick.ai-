import { clerkClient } from "@clerk/express";
import { CreditsError } from "../middlewares/errorHandler.js";
import CREDITS_CONFIG from "../configs/creditsConfig.js";

// In-memory store for mock mode persistence
const mockCreditStore = new Map();

/**
 * Get current credits for a user
 * @param {string} userId
 * @param {string} plan
 * @returns {Promise<number>}
 */
export const getCredits = async (userId, plan) => {
  if (plan === "premium" || plan === "service_provider" || userId === "provider-admin") {
    return Infinity;
  }

  // MOCK MODE: Use in-memory store
  if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.includes("sk_test_mock")) {
    if (!mockCreditStore.has(userId)) {
      mockCreditStore.set(userId, CREDITS_CONFIG.INITIAL_CREDITS);
    }
    return mockCreditStore.get(userId);
  }

  // REAL MODE: Fetch from Clerk Metadata
  try {
    const user = await clerkClient.users.getUser(userId);
    // If metadata doesn't exist, assume initial credits
    // Note: We are switching to "credits" (balance) instead of "free_usage"
    const credits = user.privateMetadata.credits;
    return credits !== undefined ? Number(credits) : CREDITS_CONFIG.INITIAL_CREDITS;
  } catch (error) {
    console.error("Failed to fetch user credits:", error);
    // Fallback to initial if fetch fails to avoid blocking user (or throw error?)
    // Safety first: give 0 if we can't verify? Or give Initial?
    // Let's assume Initial for safety against hard blocks, but log error.
    return CREDITS_CONFIG.INITIAL_CREDITS;
  }
};

/**
 * Deduct credits
 * @param {string} userId
 * @param {string} plan
 * @param {number} cost
 * @returns {Promise<number>} New Balance
 */
export const deductCredits = async (userId, plan, cost = CREDITS_CONFIG.COST_PER_OPERATION) => {
  if (plan === "premium" || plan === "service_provider" || userId === "provider-admin") {
    return Infinity;
  }

  const currentCredits = await getCredits(userId, plan);

  if (currentCredits < cost) {
    throw new CreditsError(`Insufficient credits. Required: ${cost}, Available: ${currentCredits}`);
  }

  const newBalance = currentCredits - cost;

  // MOCK MODE
  if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.includes("sk_test_mock")) {
    mockCreditStore.set(userId, newBalance);
    return newBalance;
  }

  // REAL MODE
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        credits: newBalance,
      },
    });
    return newBalance;
  } catch (error) {
    console.error("Failed to update credits:", error);
    throw new CreditsError("Failed to update credit balance.");
  }
};

/**
 * Check if user has sufficient credits without deducting
 */
export const hasSufficientCredits = async (plan, userId, cost = CREDITS_CONFIG.COST_PER_OPERATION) => {
  const credits = await getCredits(userId, plan);
  return credits >= cost;
};
