# 💼 SalaryWise AI - Personal Financial Management Dashboard

**SalaryWise AI** is a modern personal finance management app powered by AI. Built with **React**, **TypeScript**, and **Supabase**, it helps users track income, expenses, budgets, and financial goals — all wrapped in a sleek, responsive interface.

---

## 🚀 Overview

SalaryWise AI offers AI-powered insights and interactive tools to help users manage their money smarter. Key features include:

- Intelligent salary and transaction tracking  
- Category-based budgeting  
- Long-term financial goal management  
- AI-driven insights and expense categorization  
- Visual dashboards and real-time analytics  

---

## 🧠 Key Features

### 🏦 Salary Management
- Track salary records and bonuses  
- Monitor expected vs received payments  
- Visualize salary growth trends  
- Monthly comparisons and analytics  

### 💰 Transaction Tracking
- Record income and expenses  
- Auto-categorize with AI  
- Analytics with category breakdowns  
- Export data as needed  

### 📊 Budget Management
- Create monthly budgets by category  
- Track spending vs budget in real-time  
- Visual alerts for overspending  

### 🎯 Financial Goals
- Set savings targets and deadlines  
- Monitor goal progress visually  
- Get AI tips to hit your targets  

### 🤖 AI-Powered Insights
- Personalized financial analysis  
- Smart chatbot for Q&A and advice  
- AI-assisted categorization and data entry  
- Historical trend detection and forecasts  

### 📈 Dashboards & Visualizations
- Clean, interactive dashboards  
- Recharts-based graphs for trends and categories  
- Visual tracking for budgets and goals  

### 🔐 User Management
- Supabase Auth for secure sign-in  
- Per-user data isolation  
- Password reset & email verification  

### 🎨 UI & UX
- Responsive, mobile-friendly interface  
- Light/dark mode with Tailwind CSS  
- Floating AI chat assistant  
- Intuitive tabbed navigation  

---

## 🛠️ Tech Stack

### 🔧 Frontend
- React 18 + TypeScript  
- Vite for blazing-fast builds  
- Tailwind CSS + `shadcn/ui` components  
- React Router  
- TanStack React Query  
- Recharts (charts)  
- Lucide React (icons)  

### 🗄️ Backend & Database
- Supabase (PostgreSQL, Auth, Edge Functions)  
- Supabase RLS for data privacy  
- Edge Functions for secure AI access  

### 🧠 AI Integration
- OpenAI GPT-4.1 for financial analysis  
- AI-assisted categorization and insights  

---

## 🧩 Database Schema

| Table             | Purpose                                      |
|------------------|----------------------------------------------|
| `salary_records` | Tracks salaries, bonuses, and history        |
| `transactions`   | Unified income/expense ledger                |
| `expenses`       | Legacy expense data (transitioning to `transactions`) |
| `budgets`        | Category-based monthly spending limits       |
| `financial_goals`| User-defined financial objectives            |

---

## 🔒 Security & Privacy

- Row Level Security (RLS) for user data isolation  
- Supabase Auth for secure access  
- API secrets managed with Supabase secrets  
- CORS-enabled Edge Functions for safe AI calls  

---

## 🧑‍💻 Getting Started

### 🛠️ Run Locally

> Prerequisite: Node.js & npm ([Install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

```bash
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Go to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
