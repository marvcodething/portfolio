/**
 * Token Tracker for Portfolio RAG Chatbot
 * Purpose: Monitor token usage and enforce monthly budget limits ($0.60/month target)
 * Key Methods: getCurrentUsage(), addTokens(), canMakeRequest(), getUsageStats()
 * Integration: Used by marvinChatbot.ts to enforce budget constraints
 * Optimization: Prevents budget overruns through proactive monitoring and limits
 */

// Type definitions for token tracking
export interface TokenUsage {
  totalTokens: number;               // Total tokens used this month
  totalCost: number;                 // Total cost in USD this month
  requestCount: number;              // Number of requests this month
  lastReset: string;                 // Last monthly reset date (ISO string)
  dailyUsage: DailyUsage[];         // Daily breakdown
}

export interface DailyUsage {
  date: string;                      // Date in YYYY-MM-DD format
  tokens: number;                    // Tokens used on this date
  cost: number;                      // Cost incurred on this date
  requests: number;                  // Number of requests on this date
}

export interface BudgetLimits {
  monthlyBudget: number;             // Monthly budget limit in USD
  dailyBudget: number;               // Daily budget limit in USD
  maxTokensPerRequest: number;       // Maximum tokens per single request
  maxRequestsPerDay: number;         // Maximum requests per day
  warningThreshold: number;          // Warning threshold (0.8 = 80% of budget)
}

export interface UsageStats {
  currentUsage: TokenUsage;
  budgetLimits: BudgetLimits;
  remainingBudget: number;
  remainingDailyBudget: number;
  usagePercentage: number;
  dailyUsagePercentage: number;
  isNearLimit: boolean;
  canMakeRequest: boolean;
  projectedMonthlyUsage: number;
}

export interface TokenTransaction {
  timestamp: string;
  tokens: number;
  cost: number;
  operation: 'embedding' | 'chat_completion' | 'keyword_search';
  route: 'exact' | 'keyword' | 'category' | 'full';
  success: boolean;
}

// Default budget configuration ($0.60/month target)
const DEFAULT_BUDGET_LIMITS: BudgetLimits = {
  monthlyBudget: 0.60,              // $0.60 monthly limit
  dailyBudget: 0.025,               // ~$0.025 daily limit (allowing for variance)
  maxTokensPerRequest: 1000,        // Reasonable per-request limit
  maxRequestsPerDay: 200,           // ~8000 requests/month / 31 days
  warningThreshold: 0.8,            // Warning at 80% usage
};

// Token cost rates (Gemini pricing as of 2024)
const TOKEN_COSTS = {
  EMBEDDING: 0,                     // Free tier
  CHAT_INPUT: 0.000000075,         // $0.075 per 1M input tokens
  CHAT_OUTPUT: 0.0000003,          // $0.30 per 1M output tokens
} as const;

// Storage keys for browser localStorage
const STORAGE_KEYS = {
  USAGE: 'marvin_token_usage',
  TRANSACTIONS: 'marvin_token_transactions',
  SETTINGS: 'marvin_budget_settings',
} as const;

/**
 * Gets current token usage statistics
 * Purpose: Retrieve current month's usage data from localStorage
 * Returns: TokenUsage object with current statistics
 * Error Handling: Returns default usage if storage is corrupted
 * Optimization: Client-side tracking eliminates server dependency
 */
export function getCurrentUsage(): TokenUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (!stored) {
      return initializeUsage();
    }

    const usage: TokenUsage = JSON.parse(stored);
    
    // Check if we need to reset for new month
    if (shouldResetUsage(usage.lastReset)) {
      return resetMonthlyUsage();
    }

    return usage;
    
  } catch (error) {
    console.error('Error loading token usage:', error);
    return initializeUsage();
  }
}

/**
 * Adds token usage to current tracking
 * Purpose: Record token consumption for budget monitoring
 * Parameters: tokens - number of tokens used, cost - cost in USD, operation - type of operation
 * Returns: updated TokenUsage object
 * Error Handling: Validates input parameters, handles storage failures
 * Optimization: Efficient updates with daily aggregation
 */
export function addTokens(
  tokens: number,
  cost: number,
  operation: 'embedding' | 'chat_completion' | 'keyword_search',
  route: 'exact' | 'keyword' | 'category' | 'full' = 'full'
): TokenUsage {
  if (tokens < 0 || cost < 0) {
    throw new Error('Tokens and cost must be non-negative');
  }

  try {
    const currentUsage = getCurrentUsage();
    const today = getTodayString();
    
    // Update totals
    currentUsage.totalTokens += tokens;
    currentUsage.totalCost += cost;
    currentUsage.requestCount += 1;
    
    // Update daily usage
    let todayUsage = currentUsage.dailyUsage.find(day => day.date === today);
    if (!todayUsage) {
      todayUsage = {
        date: today,
        tokens: 0,
        cost: 0,
        requests: 0,
      };
      currentUsage.dailyUsage.push(todayUsage);
    }
    
    todayUsage.tokens += tokens;
    todayUsage.cost += cost;
    todayUsage.requests += 1;
    
    // Keep only last 31 days of daily usage
    currentUsage.dailyUsage = currentUsage.dailyUsage
      .filter(day => isWithinDays(day.date, 31))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Save updated usage
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(currentUsage));
    
    // Log transaction
    logTransaction({
      timestamp: new Date().toISOString(),
      tokens,
      cost,
      operation,
      route,
      success: true,
    });
    
    return currentUsage;
    
  } catch (error) {
    console.error('Error adding tokens:', error);
    
    // Log failed transaction
    logTransaction({
      timestamp: new Date().toISOString(),
      tokens,
      cost,
      operation,
      route,
      success: false,
    });
    
    throw new Error('Failed to record token usage');
  }
}

/**
 * Checks if a request can be made within budget limits
 * Purpose: Prevent budget overruns by checking limits before expensive operations
 * Parameters: estimatedTokens - expected token usage, estimatedCost - expected cost
 * Returns: boolean indicating if request is within limits
 * Error Handling: Defaults to false for safety if checks fail
 * Optimization: Fast pre-flight check prevents wasted API calls
 */
export function canMakeRequest(estimatedTokens: number = 500, estimatedCost: number = 0.001): boolean {
  try {
    const usage = getCurrentUsage();
    const limits = getBudgetLimits();
    const today = getTodayString();
    
    // Check monthly budget
    if (usage.totalCost + estimatedCost > limits.monthlyBudget) {
      console.warn('Request would exceed monthly budget');
      return false;
    }
    
    // Check daily budget
    const todayUsage = usage.dailyUsage.find(day => day.date === today);
    const todayCost = todayUsage?.cost || 0;
    if (todayCost + estimatedCost > limits.dailyBudget) {
      console.warn('Request would exceed daily budget');
      return false;
    }
    
    // Check daily request limit
    const todayRequests = todayUsage?.requests || 0;
    if (todayRequests >= limits.maxRequestsPerDay) {
      console.warn('Request would exceed daily request limit');
      return false;
    }
    
    // Check per-request token limit
    if (estimatedTokens > limits.maxTokensPerRequest) {
      console.warn('Request would exceed per-request token limit');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error checking request limits:', error);
    return false; // Fail safe
  }
}

/**
 * Gets comprehensive usage statistics
 * Purpose: Provide detailed analytics for monitoring and optimization
 * Returns: UsageStats object with all relevant metrics
 * Error Handling: Provides safe defaults for calculation errors
 * Optimization: Helps identify usage patterns and optimization opportunities
 */
export function getUsageStats(): UsageStats {
  try {
    const currentUsage = getCurrentUsage();
    const budgetLimits = getBudgetLimits();
    const today = getTodayString();
    
    // Calculate remaining budgets
    const remainingBudget = Math.max(0, budgetLimits.monthlyBudget - currentUsage.totalCost);
    
    const todayUsage = currentUsage.dailyUsage.find(day => day.date === today);
    const todayCost = todayUsage?.cost || 0;
    const remainingDailyBudget = Math.max(0, budgetLimits.dailyBudget - todayCost);
    
    // Calculate usage percentages
    const usagePercentage = (currentUsage.totalCost / budgetLimits.monthlyBudget) * 100;
    const dailyUsagePercentage = (todayCost / budgetLimits.dailyBudget) * 100;
    
    // Check if near limits
    const isNearLimit = usagePercentage >= (budgetLimits.warningThreshold * 100);
    
    // Project monthly usage based on current daily rate
    const daysThisMonth = new Date().getDate();
    const avgDailyCost = currentUsage.totalCost / daysThisMonth;
    const daysInMonth = getDaysInCurrentMonth();
    const projectedMonthlyUsage = avgDailyCost * daysInMonth;
    
    return {
      currentUsage,
      budgetLimits,
      remainingBudget,
      remainingDailyBudget,
      usagePercentage,
      dailyUsagePercentage,
      isNearLimit,
      canMakeRequest: canMakeRequest(),
      projectedMonthlyUsage,
    };
    
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return getDefaultStats();
  }
}

/**
 * Gets budget limit configuration
 * Purpose: Retrieve current budget settings with user customization support
 * Returns: BudgetLimits object
 * Error Handling: Returns defaults if custom settings are invalid
 */
export function getBudgetLimits(): BudgetLimits {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      return DEFAULT_BUDGET_LIMITS;
    }
    
    const customLimits: BudgetLimits = JSON.parse(stored);
    
    // Validate custom limits
    if (validateBudgetLimits(customLimits)) {
      return customLimits;
    }
    
    return DEFAULT_BUDGET_LIMITS;
    
  } catch (error) {
    console.error('Error loading budget limits:', error);
    return DEFAULT_BUDGET_LIMITS;
  }
}

/**
 * Updates budget limit configuration
 * Purpose: Allow users to customize their budget constraints
 * Parameters: limits - new budget limits to apply
 * Returns: boolean indicating if update was successful
 * Error Handling: Validates limits before applying
 */
export function setBudgetLimits(limits: Partial<BudgetLimits>): boolean {
  try {
    const currentLimits = getBudgetLimits();
    const newLimits = { ...currentLimits, ...limits };
    
    if (!validateBudgetLimits(newLimits)) {
      throw new Error('Invalid budget limits');
    }
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newLimits));
    return true;
    
  } catch (error) {
    console.error('Error setting budget limits:', error);
    return false;
  }
}

/**
 * Estimates cost for token usage
 * Purpose: Calculate expected cost for different types of operations
 * Parameters: inputTokens - input token count, outputTokens - output token count, operation - operation type
 * Returns: estimated cost in USD
 * Optimization: Helps make informed routing decisions
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  operation: 'embedding' | 'chat_completion' | 'keyword_search'
): number {
  switch (operation) {
    case 'embedding':
      return 0; // Free tier
      
    case 'chat_completion':
      return (inputTokens * TOKEN_COSTS.CHAT_INPUT) + (outputTokens * TOKEN_COSTS.CHAT_OUTPUT);
      
    case 'keyword_search':
      return 0; // No API calls
      
    default:
      return 0;
  }
}

/**
 * Gets recent transaction history
 * Purpose: Provide transaction log for debugging and analysis
 * Parameters: limit - maximum number of transactions to return
 * Returns: array of recent TokenTransaction objects
 * Error Handling: Returns empty array if no transactions found
 */
export function getTransactionHistory(limit: number = 50): TokenTransaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!stored) {
      return [];
    }
    
    const transactions: TokenTransaction[] = JSON.parse(stored);
    return transactions
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error loading transaction history:', error);
    return [];
  }
}

/**
 * Resets monthly usage for new billing period
 * Purpose: Clear usage statistics at start of new month
 * Returns: new TokenUsage object
 * Error Handling: Preserves transaction history on reset
 */
export function resetMonthlyUsage(): TokenUsage {
  const newUsage: TokenUsage = {
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    lastReset: new Date().toISOString(),
    dailyUsage: [],
  };
  
  try {
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(newUsage));
    console.log('Monthly usage reset successfully');
    return newUsage;
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    return newUsage;
  }
}

// Helper functions

function initializeUsage(): TokenUsage {
  return {
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    lastReset: new Date().toISOString(),
    dailyUsage: [],
  };
}

function shouldResetUsage(lastReset: string): boolean {
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  
  return lastResetDate.getMonth() !== now.getMonth() || 
         lastResetDate.getFullYear() !== now.getFullYear();
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function validateBudgetLimits(limits: BudgetLimits): boolean {
  return limits.monthlyBudget > 0 &&
         limits.dailyBudget > 0 &&
         limits.maxTokensPerRequest > 0 &&
         limits.maxRequestsPerDay > 0 &&
         limits.warningThreshold > 0 &&
         limits.warningThreshold <= 1 &&
         limits.dailyBudget <= limits.monthlyBudget;
}

function logTransaction(transaction: TokenTransaction): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const transactions: TokenTransaction[] = stored ? JSON.parse(stored) : [];
    
    transactions.push(transaction);
    
    // Keep only last 1000 transactions
    if (transactions.length > 1000) {
      transactions.splice(0, transactions.length - 1000);
    }
    
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error logging transaction:', error);
  }
}

function getDefaultStats(): UsageStats {
  return {
    currentUsage: initializeUsage(),
    budgetLimits: DEFAULT_BUDGET_LIMITS,
    remainingBudget: DEFAULT_BUDGET_LIMITS.monthlyBudget,
    remainingDailyBudget: DEFAULT_BUDGET_LIMITS.dailyBudget,
    usagePercentage: 0,
    dailyUsagePercentage: 0,
    isNearLimit: false,
    canMakeRequest: true,
    projectedMonthlyUsage: 0,
  };
}

/**
 * Test token tracker functionality
 * Purpose: Verify tracking operations are working correctly
 * Returns: boolean indicating if tracker is functional
 */
export function testTokenTracker(): boolean {
  try {
    const initialUsage = getCurrentUsage();
    const canMake = canMakeRequest(100, 0.001);
    const stats = getUsageStats();
    
    return typeof initialUsage.totalTokens === 'number' &&
           typeof canMake === 'boolean' &&
           typeof stats.usagePercentage === 'number';
           
  } catch (error) {
    console.error('Token tracker test failed:', error);
    return false;
  }
}