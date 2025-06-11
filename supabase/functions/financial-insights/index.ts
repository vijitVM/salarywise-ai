
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

    console.log('Data fetched:', {
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

    // Calculate totals more accurately
    const totalSalaryIncome = financialData.salaries
      .filter(s => s.amount && !isNaN(Number(s.amount)))
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const totalLegacyExpenses = financialData.expenses
      .filter(e => e.amount && !isNaN(Number(e.amount)))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Transaction totals with validation
    const transactionIncome = financialData.transactions
      .filter(t => t.type === 'income' && t.amount && !isNaN(Number(t.amount)))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const transactionExpenses = financialData.transactions
      .filter(t => t.type === 'expense' && t.amount && !isNaN(Number(t.amount)))
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Combined totals
    const totalIncome = totalSalaryIncome + transactionIncome;
    const totalExpenses = totalLegacyExpenses + transactionExpenses;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;

    console.log('Calculated totals:', {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate: savingsRate.toFixed(1) + '%'
    });

    // Category breakdown with validation - combining both sources
    const categoryExpenses = {};
    
    // Add legacy expenses
    financialData.expenses.forEach(expense => {
      if (expense.category && expense.amount && !isNaN(Number(expense.amount))) {
        categoryExpenses[expense.category] = (categoryExpenses[expense.category] || 0) + Number(expense.amount);
      }
    });

    // Add transaction expenses
    financialData.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (transaction.category && transaction.amount && !isNaN(Number(transaction.amount))) {
          categoryExpenses[transaction.category] = (categoryExpenses[transaction.category] || 0) + Number(transaction.amount);
        }
      });

    // Get current month's data for more accurate insights
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const lastThreeMonths = new Date();
    lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);

    // Recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = financialData.transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= thirtyDaysAgo && t.amount && !isNaN(Number(t.amount));
    });

    const recentExpenses = financialData.expenses.filter(e => {
      const expenseDate = new Date(e.expense_date);
      return expenseDate >= thirtyDaysAgo && e.amount && !isNaN(Number(e.amount));
    });

    // Calculate monthly averages for better insights
    const recentSalaries = financialData.salaries
      .filter(s => s.amount && !isNaN(Number(s.amount)) && !s.is_bonus)
      .slice(0, 6);

    const avgMonthlySalary = recentSalaries.length > 0 
      ? recentSalaries.reduce((sum, s) => sum + Number(s.amount), 0) / recentSalaries.length 
      : 0;

    // Budget analysis with validation
    const budgetAnalysis = financialData.budgets
      .filter(budget => budget.monthly_limit && !isNaN(Number(budget.monthly_limit)))
      .map(budget => ({
        category: budget.category,
        spent: Number(budget.current_spent || 0),
        limit: Number(budget.monthly_limit),
        percentage: budget.monthly_limit > 0 ? (Number(budget.current_spent || 0) / Number(budget.monthly_limit)) * 100 : 0
      }));

    const dataForAI = {
      totalIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      netSavings: Math.round(netSavings),
      savingsRate: Math.round(savingsRate * 10) / 10,
      categoryBreakdown: Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([category, amount]) => [category, Math.round(amount)]),
      budgetStatus: budgetAnalysis,
      recentMonthlyExpenses: [
        ...recentExpenses.slice(0, 5).map(e => ({
          category: e.category,
          amount: Math.round(Number(e.amount || 0)),
          date: e.expense_date
        })),
        ...recentTransactions.filter(t => t.type === 'expense').slice(0, 5).map(t => ({
          category: t.category,
          amount: Math.round(Number(t.amount || 0)),
          date: t.transaction_date
        }))
      ].slice(0, 10),
      goalProgress: financialData.goals
        .filter(g => g.target_amount && !isNaN(Number(g.target_amount)))
        .map(g => ({
          title: g.title,
          progress: Number(g.target_amount) > 0 ? Math.round((Number(g.current_amount || 0) / Number(g.target_amount)) * 100) : 0,
          current: Math.round(Number(g.current_amount || 0)),
          target: Math.round(Number(g.target_amount))
        })),
      avgMonthlySalary: Math.round(avgMonthlySalary),
      recentSalaryCount: recentSalaries.length,
      dataQuality: {
        hasTransactions: financialData.transactions.length > 0,
        hasExpenses: financialData.expenses.length > 0,
        hasSalaries: financialData.salaries.length > 0,
        hasBudgets: financialData.budgets.length > 0,
        hasGoals: financialData.goals.length > 0,
        dataCompleteness: {
          totalRecords: financialData.salaries.length + financialData.expenses.length + financialData.transactions.length,
          hasRecentData: recentTransactions.length > 0 || recentExpenses.length > 0
        }
      }
    };

    console.log('Data for AI:', dataForAI);

    const systemPrompt = `You are a financial insights AI for an Indian user. Analyze the user's financial data and provide 3-4 key insights as an array of insight objects. Each insight should have:
- type: "positive", "warning", or "suggestion"
- title: Short descriptive title (max 4 words)
- description: 1-2 sentence explanation with specific details from their data
- metric: relevant number/percentage if applicable (ALWAYS use ₹ for currency, NEVER use $ or any other currency symbol)

CRITICAL REQUIREMENTS:
1. ALL currency amounts MUST use Indian Rupee symbol (₹) and proper formatting with commas for large numbers (e.g., ₹1,35,284)
2. ACCURACY IS PARAMOUNT - Only provide insights based on ACTUAL calculated data from the provided financial summary
3. Use the EXACT numbers provided in the data - do not estimate or approximate
4. Focus on actionable insights about spending patterns, savings rate, and category-specific observations
5. If the user has no data in a category (like budgets or goals), don't mention those categories
6. Base spending observations on the categoryBreakdown provided
7. Savings rate calculation: (₹${dataForAI.netSavings} / ₹${dataForAI.totalIncome}) × 100 = ${dataForAI.savingsRate}%

Key Financial Data:
- Total Income: ₹${dataForAI.totalIncome}
- Total Expenses: ₹${dataForAI.totalExpenses}  
- Net Savings: ₹${dataForAI.netSavings}
- Savings Rate: ${dataForAI.savingsRate}%
- Top Expense Categories: ${dataForAI.categoryBreakdown.map(([cat, amt]) => `${cat}: ₹${amt}`).join(', ')}

Data context: ${JSON.stringify(dataForAI.dataQuality)}

Respond with ONLY a valid JSON array of insight objects, no markdown formatting.`;

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
          { role: 'user', content: `Analyze this financial data: ${JSON.stringify(dataForAI)}` }
        ],
        temperature: 0.1,
        max_tokens: 800,
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
    
    // Clean up markdown formatting if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    console.log('Cleaned content:', content);
    
    const insights = JSON.parse(content);

    return new Response(JSON.stringify({ 
      insights, 
      summary: dataForAI,
      debug: {
        totalRecords: {
          salaries: financialData.salaries.length,
          expenses: financialData.expenses.length,
          transactions: financialData.transactions.length,
          budgets: financialData.budgets.length,
          goals: financialData.goals.length
        },
        calculations: {
          totalIncome,
          totalExpenses,
          netSavings,
          savingsRate: savingsRate.toFixed(1) + '%',
          topCategories: Object.entries(categoryExpenses).sort(([,a], [,b]) => b - a).slice(0, 5)
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
