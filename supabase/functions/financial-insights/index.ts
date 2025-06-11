
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please check your Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get comprehensive financial data with user filtering
    const [salaryRes, expensesRes, budgetsRes, goalsRes, transactionsRes] = await Promise.all([
      supabase.from('salary_records').select('*').eq('user_id', userId).order('received_date', { ascending: false }),
      supabase.from('expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('financial_goals').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false })
    ]);

    console.log('Raw data fetched:', {
      salaries: salaryRes.data?.length || 0,
      expenses: expensesRes.data?.length || 0,
      budgets: budgetsRes.data?.length || 0,
      goals: goalsRes.data?.length || 0,
      transactions: transactionsRes.data?.length || 0
    });

    const financialData = {
      salaries: salaryRes.data || [],
      expenses: expensesRes.data || [],
      budgets: budgetsRes.data || [],
      goals: goalsRes.data || [],
      transactions: transactionsRes.data || []
    };

    // Enhanced validation function
    const validateAmount = (amount: any): number => {
      if (amount === null || amount === undefined || amount === '') return 0;
      const parsed = Number(amount);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    };

    // Calculate income with deduplication logic
    const salaryIncome = financialData.salaries
      .filter(s => s.amount && validateAmount(s.amount) > 0)
      .reduce((sum, s) => sum + validateAmount(s.amount), 0);

    // Only count transaction income if no salary records exist, or if they're clearly different
    const transactionIncome = financialData.transactions
      .filter(t => t.type === 'income' && validateAmount(t.amount) > 0)
      .reduce((sum, t) => sum + validateAmount(t.amount), 0);

    // Use salary records as primary source, transactions as secondary
    const totalIncome = salaryIncome > 0 ? salaryIncome : transactionIncome;
    
    console.log('Income calculation:', {
      salaryIncome,
      transactionIncome,
      totalIncomeUsed: totalIncome,
      source: salaryIncome > 0 ? 'salary_records' : 'transactions'
    });

    // Calculate expenses - combine both sources as they represent different types
    const legacyExpenses = financialData.expenses
      .filter(e => validateAmount(e.amount) > 0)
      .reduce((sum, e) => sum + validateAmount(e.amount), 0);
    
    const transactionExpenses = financialData.transactions
      .filter(t => t.type === 'expense' && validateAmount(t.amount) > 0)
      .reduce((sum, t) => sum + validateAmount(t.amount), 0);
    
    const totalExpenses = legacyExpenses + transactionExpenses;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;

    console.log('Expense calculation:', {
      legacyExpenses,
      transactionExpenses,
      totalExpenses,
      netSavings,
      savingsRate: savingsRate.toFixed(1) + '%'
    });

    // Enhanced category breakdown - combine both sources properly
    const categoryExpenses = {};
    
    // Add legacy expenses with validation
    financialData.expenses.forEach(expense => {
      const amount = validateAmount(expense.amount);
      if (expense.category && amount > 0) {
        const category = expense.category.trim();
        categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
      }
    });

    // Add transaction expenses with validation
    financialData.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const amount = validateAmount(transaction.amount);
        if (transaction.category && amount > 0) {
          const category = transaction.category.trim();
          categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
        }
      });

    // Enhanced budget analysis with better validation
    const budgetAnalysis = financialData.budgets
      .filter(budget => validateAmount(budget.monthly_limit) > 0)
      .map(budget => {
        const spent = validateAmount(budget.current_spent);
        const limit = validateAmount(budget.monthly_limit);
        return {
          category: budget.category,
          spent: Math.round(spent),
          limit: Math.round(limit),
          percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0
        };
      });

    // Enhanced goal analysis
    const goalProgress = financialData.goals
      .filter(g => validateAmount(g.target_amount) > 0)
      .map(g => {
        const current = validateAmount(g.current_amount);
        const target = validateAmount(g.target_amount);
        return {
          title: g.title,
          progress: target > 0 ? Math.round((current / target) * 100) : 0,
          current: Math.round(current),
          target: Math.round(target)
        };
      });

    // Create clean data for AI with proper rounding
    const dataForAI = {
      totalIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      netSavings: Math.round(netSavings),
      savingsRate: Math.round(savingsRate * 10) / 10, // Round to 1 decimal
      categoryBreakdown: Object.entries(categoryExpenses)
        .filter(([_, amount]) => amount > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6) // Limit to top 6 categories
        .map(([category, amount]) => [category, Math.round(amount)]),
      budgetStatus: budgetAnalysis,
      goalProgress: goalProgress,
      dataQuality: {
        hasTransactions: financialData.transactions.length > 0,
        hasExpenses: financialData.expenses.length > 0,
        hasSalaries: financialData.salaries.length > 0,
        hasBudgets: financialData.budgets.length > 0,
        hasGoals: financialData.goals.length > 0,
        incomeSource: salaryIncome > 0 ? 'salary_records' : 'transactions',
        totalRecords: financialData.salaries.length + financialData.expenses.length + financialData.transactions.length
      }
    };

    console.log('Final data for AI:', dataForAI);

    // Enhanced system prompt with stricter requirements
    const systemPrompt = `You are a financial insights AI for an Indian user. Analyze the provided financial data and generate EXACTLY 4 insights as a JSON array.

CRITICAL FORMATTING REQUIREMENTS:
1. ALWAYS use ₹ symbol for ALL currency amounts (NEVER use $ or any other symbol)
2. Format large amounts with Indian comma system: ₹1,35,284 (not ₹135,284)
3. Use EXACT numbers from the provided data - do not estimate or round differently
4. Each insight must have: type, title, description, metric

EXACT DATA TO USE:
- Total Income: ₹${dataForAI.totalIncome.toLocaleString('en-IN')}
- Total Expenses: ₹${dataForAI.totalExpenses.toLocaleString('en-IN')}
- Net Savings: ₹${dataForAI.netSavings.toLocaleString('en-IN')}
- Savings Rate: ${dataForAI.savingsRate}%

TOP EXPENSE CATEGORIES:
${dataForAI.categoryBreakdown.map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`).join('\n')}

INSIGHT TYPES:
- "positive": for good financial indicators (savings rate >15%, low high-priority expenses)
- "warning": for concerning patterns (savings rate <10%, high discretionary spending)
- "suggestion": for actionable improvements

TITLE RULES: Maximum 4 words, descriptive
DESCRIPTION RULES: 1-2 sentences with specific amounts and percentages from data
METRIC RULES: Always include relevant ₹ amounts or percentages

Generate insights about:
1. Savings rate analysis
2. Highest expense category concerns/observations
3. Budget utilization or spending patterns
4. Goal progress or financial recommendations

Respond with ONLY valid JSON array - no markdown, no explanations.`;

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 4 financial insights for this data: ${JSON.stringify(dataForAI)}` }
        ],
        temperature: 0.1, // Very low temperature for consistency
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    let content = data.choices[0].message.content;
    
    // Enhanced content cleaning
    content = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*`+|`+\s*$/g, '')
      .trim();
    
    console.log('Cleaned content:', content);
    
    try {
      const insights = JSON.parse(content);
      
      // Validate insights structure
      if (!Array.isArray(insights) || insights.length !== 4) {
        throw new Error('Invalid insights format - expected array of 4 insights');
      }
      
      // Validate each insight
      insights.forEach((insight, index) => {
        if (!insight.type || !insight.title || !insight.description) {
          throw new Error(`Invalid insight at index ${index} - missing required fields`);
        }
      });

      return new Response(JSON.stringify({ 
        insights, 
        summary: dataForAI,
        debug: {
          calculationMethod: {
            income: dataForAI.dataQuality.incomeSource,
            expenseCombination: 'legacy + transactions',
            deduplication: 'salary prioritized over transaction income'
          },
          validation: {
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate: savingsRate.toFixed(1) + '%',
            categoryCount: Object.keys(categoryExpenses).length
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content that failed to parse:', content);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
    
  } catch (error) {
    console.error('Error in financial-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
