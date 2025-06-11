
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
      supabase.from('salary_records').select('*').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('financial_goals').select('*').eq('user_id', userId)
    ]);

    const financialData = {
      salaries: salaryRes.data || [],
      expenses: expensesRes.data || [],
      budgets: budgetsRes.data || [],
      goals: goalsRes.data || []
    };

    // Calculate key metrics
    const totalSalary = financialData.salaries.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpenses = financialData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBudget = financialData.budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);

    const systemPrompt = `You are a personal financial advisor AI assistant. You have access to the user's financial data and should provide helpful, accurate advice based on their information.

User's Financial Summary:
- Total Salary Records: ${financialData.salaries.length} (Total: ₹${totalSalary.toLocaleString()})
- Total Expenses: ${financialData.expenses.length} (Total: ₹${totalExpenses.toLocaleString()})
- Active Budgets: ${financialData.budgets.length} (Total Budget: ₹${totalBudget.toLocaleString()})
- Financial Goals: ${financialData.goals.length}

Recent Expenses: ${financialData.expenses.slice(-5).map(e => `₹${e.amount} - ${e.category} (${e.description || 'No description'})`).join(', ')}

Active Budgets: ${financialData.budgets.map(b => `${b.category}: ₹${b.current_spent}/${b.monthly_limit}`).join(', ')}

Goals: ${financialData.goals.map(g => `${g.title}: ₹${g.current_amount}/${g.target_amount}`).join(', ')}

Provide personalized financial advice, insights, and recommendations. Be conversational but professional. Always format currency amounts in Indian Rupees (₹). If the user asks about specific data, reference their actual financial records.`;

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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: {
        totalSalary,
        totalExpenses,
        totalBudget,
        savingsRate: totalSalary > 0 ? ((totalSalary - totalExpenses) / totalSalary * 100).toFixed(1) : 0
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
