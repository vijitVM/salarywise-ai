
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
    const { message, userId, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's financial data for context
    const [salaryRes, expensesRes, budgetsRes, goalsRes] = await Promise.all([
      supabase.from('salary_records').select('*').eq('user_id', userId).order('received_date', { ascending: false }),
      supabase.from('expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('financial_goals').select('*').eq('user_id', userId)
    ]);

    const financialData = {
      salaries: salaryRes.data || [],
      expenses: expensesRes.data || [],
      budgets: budgetsRes.data || [],
      goals: goalsRes.data || []
    };

    // Calculate detailed metrics including monthly breakdowns
    const totalSalary = financialData.salaries.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpenses = financialData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBudget = financialData.budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);

    // Group salaries by month for detailed breakdown
    const salariesByMonth = financialData.salaries.reduce((acc, salary) => {
      const month = salary.salary_month;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push({
        amount: Number(salary.amount),
        received_date: salary.received_date,
        description: salary.description,
        is_bonus: salary.is_bonus,
        pay_period: salary.pay_period
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate monthly totals
    const monthlyTotals = Object.entries(salariesByMonth).map(([month, records]) => {
      const totalForMonth = records.reduce((sum, record) => sum + record.amount, 0);
      const regularSalary = records.filter(r => !r.is_bonus).reduce((sum, record) => sum + record.amount, 0);
      const bonuses = records.filter(r => r.is_bonus).reduce((sum, record) => sum + record.amount, 0);
      
      return {
        month,
        total: totalForMonth,
        regularSalary,
        bonuses,
        recordCount: records.length,
        records
      };
    });

    // Group expenses by category and month
    const expensesByCategory = financialData.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const systemPrompt = `You are a personal financial advisor AI assistant. You have access to the user's comprehensive financial data and should provide helpful, accurate advice based on their specific information.

User's Financial Summary:
- Total Salary Records: ${financialData.salaries.length} entries (Total: ₹${totalSalary.toLocaleString()})
- Total Expenses: ${financialData.expenses.length} entries (Total: ₹${totalExpenses.toLocaleString()})
- Active Budgets: ${financialData.budgets.length} (Total Budget: ₹${totalBudget.toLocaleString()})
- Financial Goals: ${financialData.goals.length}

DETAILED MONTHLY SALARY BREAKDOWN:
${monthlyTotals.map(m => `${m.month}: ₹${m.total.toLocaleString()} (Regular: ₹${m.regularSalary.toLocaleString()}, Bonuses: ₹${m.bonuses.toLocaleString()}, ${m.recordCount} record(s))`).join('\n')}

INDIVIDUAL SALARY RECORDS:
${financialData.salaries.map(s => `${s.salary_month}: ₹${Number(s.amount).toLocaleString()} received on ${s.received_date} ${s.is_bonus ? '(BONUS)' : ''} - ${s.description || 'Regular salary'}`).join('\n')}

EXPENSE BREAKDOWN BY CATEGORY:
${Object.entries(expensesByCategory).map(([cat, amount]) => `${cat}: ₹${amount.toLocaleString()}`).join('\n')}

ACTIVE BUDGETS:
${financialData.budgets.map(b => `${b.category}: ₹${b.current_spent.toLocaleString()}/${Number(b.monthly_limit).toLocaleString()} (${(b.current_spent/Number(b.monthly_limit)*100).toFixed(1)}% used)`).join('\n')}

FINANCIAL GOALS:
${financialData.goals.map(g => `${g.title}: ₹${Number(g.current_amount).toLocaleString()}/${Number(g.target_amount).toLocaleString()} (${(Number(g.current_amount)/Number(g.target_amount)*100).toFixed(1)}% complete)`).join('\n')}

When answering questions:
1. Reference specific amounts and dates from their actual data
2. Provide month-by-month breakdowns when asked about specific periods
3. Be conversational but include precise financial figures
4. Always format currency amounts in Indian Rupees (₹)
5. When asked about specific months, provide exact amounts and details from their records
6. If asked about trends, analyze their actual data patterns`;

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
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: {
        totalSalary,
        totalExpenses,
        totalBudget,
        savingsRate: totalSalary > 0 ? ((totalSalary - totalExpenses) / totalSalary * 100).toFixed(1) : 0,
        monthlyBreakdown: monthlyTotals
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in financial-ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
