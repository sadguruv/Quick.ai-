/**
 * Configurable Credits System
 * All credit limits are configurable via environment variables
 * Defaults to production-safe values
 */

export const CREDITS_CONFIG = {
  // Maximum free credits for AI users (configurable)
  MAX_FREE_CREDITS: Number(process.env.MAX_FREE_CREDITS) || 100,
  
  // Initial credits for new AI users
  INITIAL_CREDITS: Number(process.env.INITIAL_CREDITS) || 100,
  
  // Credit cost per operation (configurable per operation type if needed)
  COST_PER_OPERATION: Number(process.env.COST_PER_OPERATION) || 1,
};

// Validate configuration
if (CREDITS_CONFIG.MAX_FREE_CREDITS < 1) {
  console.warn("⚠️  MAX_FREE_CREDITS must be at least 1. Using default: 100");
  CREDITS_CONFIG.MAX_FREE_CREDITS = 100;
}

if (CREDITS_CONFIG.INITIAL_CREDITS > CREDITS_CONFIG.MAX_FREE_CREDITS) {
  console.warn("⚠️  INITIAL_CREDITS cannot exceed MAX_FREE_CREDITS. Setting to MAX_FREE_CREDITS");
  CREDITS_CONFIG.INITIAL_CREDITS = CREDITS_CONFIG.MAX_FREE_CREDITS;
}

export default CREDITS_CONFIG;
