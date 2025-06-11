
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

    // Get comprehensive financial data including transactions
    const [salaryRes, expensesRes, budgetsRes, goalsRes, transactionsRes] = await Promise.all([
      supabase.from('salary_records').select('*').eq('user_id', userId).order('received_date', { ascending: false }),
      supabase.from('expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('financial_goals').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false })
    ]);

    const financialData = {
      salaries: salaryRes.data || [],
      expenses: expensesRes.data || [],
      budgets: budgetsRes.data || [],
      goals: goalsRes.data || [],
      transactions: transactionsRes.data || []
    };

    // Calculate insights data
    const totalIncome = financialData.salaries.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpenses = financialData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Add transaction totals
    const transactionIncome = financialData.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const transactionExpenses = financialData.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    
    const combinedIncome = totalIncome + transactionIncome;
    const combinedExpenses = totalExpenses + transactionExpenses;
    const savingsRate = combinedIncome > 0 ? ((combinedIncome - combinedExpenses) / combinedIncome * 100) : 0;

    // Category breakdown from both sources
    const categoryExpenses = financialData.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const transactionCategoryExpenses = financialData.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    // Combine category expenses
    const combinedCategoryExpenses = { ...categoryExpenses };
    Object.entries(transactionCategoryExpenses).forEach(([category, amount]) => {
      combinedCategoryExpenses[category] = (combinedCategoryExpenses[category] || 0) + amount;
    });

    // Budget analysis
    const budgetAnalysis = financialData.budgets.map(budget => ({
      category: budget.category,
      spent: budget.current_spent,
      limit: budget.monthly_limit,
      percentage: (budget.current_spent / budget.monthly_limit) * 100
    }));

    // Monthly salary breakdown
    const monthlySalaries = financialData.salaries.reduce((acc, salary) => {
      const month = salary.salary_month;
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0, records: [] };
      }
      acc[month].total += Number(salary.amount);
      acc[month].count += 1;
      acc[month].records.push(salary);
      return acc;
    }, {} as Record<string, { total: number; count: number; records: any[] }>);

    const dataForAI = {
      totalIncome: combinedIncome,
      totalExpenses: combinedExpenses,
      savingsRate: savingsRate.toFixed(1),
      categoryBreakdown: Object.entries(combinedCategoryExpenses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      budgetStatus: budgetAnalysis,
      recentExpenses: [...financialData.expenses.slice(0, 5), ...financialData.transactions.filter(t => t.type === 'expense').slice(0, 5)],
      goalProgress: financialData.goals.map(g => ({
        title: g.title,
        progress: ((g.current_amount / g.target_amount) * 100).toFixed(1)
      })),
      monthlySalaryBreakdown: Object.entries(monthlySalaries).map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count
      }))
    };

    const systemPrompt = `You are a financial insights AI for an Indian user. Analyze the user's financial data and provide 3-4 key insights as an array of insight objects. Each insight should have:
- type: "positive", "warning", or "suggestion"
- title: Short descriptive title
- description: 1-2 sentence explanation with specific details from their data
- metric: relevant number/percentage if applicable (ALWAYS use ₹ for currency, NEVER use $ or any other currency symbol)

IMPORTANT: ALL currency amounts MUST be formatted with the Indian Rupee symbol (₹) and proper Indian number formatting with commas. For example: ₹1,50,000 instead of $1,500 or 150000.

Focus on actionable insights about spending patterns, budget performance, savings rate, goal progress, and salary trends. Use specific numbers from their data to make insights meaningful.

Respond with ONLY a valid JSON array of insight objects, no markdown formatting.`;

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Financial Data: ${JSON.stringify(dataForAI)}` }
        ],
        temperature: 0.3,
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

    return new Response(JSON.stringify({ insights, summary: dataForAI }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in financial-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
