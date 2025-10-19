// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { initializeDatabase, db } = require('./database');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.static(__dirname));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database
initializeDatabase();

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, monthly_income, savings_goal } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (user) return res.status(400).json({ error: 'User already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      db.run(
        `INSERT INTO users (username, email, password, monthly_income, savings_goal) 
         VALUES (?, ?, ?, ?, ?)`,
        [username || 'User', email, hashedPassword, monthly_income || 0, savings_goal || 0],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          
          // Generate token
          const token = jwt.sign({ userId: this.lastID }, process.env.JWT_SECRET || 'fallback_secret');
          
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { 
              id: this.lastID, 
              username: username || 'User', 
              email, 
              monthly_income: monthly_income || 0, 
              savings_goal: savings_goal || 0 
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret');
    
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        monthly_income: user.monthly_income,
        savings_goal: user.savings_goal
      }
    });
  });
});

// Protected routes
app.get('/api/user', auth, (req, res) => {
  db.get('SELECT id, username, email, monthly_income, savings_goal, openai_key FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Expenses routes
app.get('/api/expenses', auth, (req, res) => {
  db.all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [req.userId], (err, expenses) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(expenses);
  });
});

app.post('/api/expenses', auth, (req, res) => {
  const { name, amount, category } = req.body;
  
  if (!name || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid name and amount are required' });
  }

  db.run(
    'INSERT INTO expenses (user_id, name, amount, category, date) VALUES (?, ?, ?, ?, ?)',
    [req.userId, name, amount, category || 'other', new Date().toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get('SELECT * FROM expenses WHERE id = ?', [this.lastID], (err, expense) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(expense);
      });
    }
  );
});

app.delete('/api/expenses/:id', auth, (req, res) => {
  db.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' }); 
  });
});

// User settings
app.put('/api/user/settings', auth, (req, res) => {
  const { monthly_income, savings_goal, openai_key } = req.body;
  
  const updates = [];
  const values = [];
  
  if (monthly_income !== undefined) {
    updates.push('monthly_income = ?');
    values.push(monthly_income);
  }
  
  if (savings_goal !== undefined) {
    updates.push('savings_goal = ?');
    values.push(savings_goal);
  }
  
  if (openai_key !== undefined) {
    updates.push('openai_key = ?');
    values.push(openai_key);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  values.push(req.userId);
  
  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Settings updated successfully' });
    }
  );
});

app.get('/api/stats', auth, (req, res) => {
  // Get user data and expense stats
  db.get('SELECT monthly_income, savings_goal FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    db.all(
      `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date >= date('now','start of month') 
       GROUP BY category`,
      [req.userId],
      (err, categoryTotals) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const totalExpenses = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
        const saved = Math.max(0, (user.monthly_income || 0) - totalExpenses);
        const goalPercentage = user.savings_goal > 0 ? Math.min(100, (saved / user.savings_goal) * 100) : 0;
        
        res.json({
          monthly_income: user.monthly_income,
          savings_goal: user.savings_goal,
          total_expenses: totalExpenses,
          saved_amount: saved,
          goal_percentage: goalPercentage,
          category_totals: categoryTotals
        });
      }
    );
  });
});

// Add OpenAI integration route - USING SERVER'S API KEY
app.post('/api/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const gemini_key = process.env.GEMINI_API_KEY;

    if (!gemini_key) {
      return res.status(500).json({
        error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.'
      });
    }

    // Get user stats for context
    db.get('SELECT monthly_income, savings_goal FROM users WHERE id = ?', [req.userId], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Get expenses for context
      db.all(
        `SELECT name, amount, category FROM expenses 
         WHERE user_id = ? AND date >= date('now','start of month') 
         ORDER BY date DESC LIMIT 5`,
        [req.userId],
        async (err, expenses) => {
          if (err) return res.status(500).json({ error: err.message });

          const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
          const saved = Math.max(0, (user.monthly_income || 0) - totalExpenses);

          const financialContext = `
            User Financial Summary:
            - Monthly Income: ₹${user.monthly_income || 0}
            - Savings Goal: ₹${user.savings_goal || 0}
            - Current Month Expenses: ₹${totalExpenses || 0}
            - Amount Saved: ₹${saved || 0}
            - Savings Rate: ${user.monthly_income ? ((saved / user.monthly_income) * 100).toFixed(1) : 0}%
            - Recent Expenses: ${expenses.slice(0, 5).map(e => `${e.name}: ₹${e.amount} (${e.category})`).join(', ')}
          `;

          try {
            // ✅ Use the latest Gemini endpoint and model name
            // ✅ Correct Gemini model + endpoint
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${gemini_key}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `
You are FineFlex AI, a helpful financial advisor.
Use this financial context to give personalized advice:
${financialContext}

Be concise, friendly, and focus on practical, actionable tips.
User's question: ${message}
              `
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    })
  }
);



            if (!geminiResponse.ok) {
              const errorData = await geminiResponse.json();
              throw new Error(errorData.error?.message || 'Gemini API error');
            }

            const geminiData = await geminiResponse.json();

// Extract text safely
let aiResponse =
  geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
  geminiData?.candidates?.[0]?.output_text ||
  geminiData?.candidates?.[0]?.content?.text ||
  null;

if (aiResponse) {
  res.json({ response: aiResponse.trim() });
} else {
  console.warn("⚠️ Gemini gave no text. Full response:", geminiData);
  res.json({
    response: "Sorry, I couldn’t generate a complete response this time. Try rephrasing your question!"
  });
}



          } catch (error) {
            console.error('Gemini API error:', error);

            // Fallback to mock AI response if Gemini fails
            const mockResponse = generateMockAIResponse(message, user, expenses);
            res.json({ response: mockResponse });
          }
        }
      );
    });
  } catch (err) {
    console.error('Unexpected error in /api/chat:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Smart mock AI function as fallback
function generateMockAIResponse(question, user, expenses) {
  const income = user.monthly_income || 0;
  const goal = user.savings_goal || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const saved = Math.max(0, income - totalExpenses);
  
  const q = question.toLowerCase();
  
  if (q.includes('save') || q.includes('saving')) {
    return `Based on your current financial situation:
• Monthly Income: ₹${income}
• Current Savings: ₹${saved}
• Savings Goal: ₹${goal}

I recommend setting aside 20% of your income (₹${income * 0.2}) each month. Consider automating transfers to your savings account right after you receive your income.`;
  
  } else if (q.includes('budget') || q.includes('spend')) {
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    
    let advice = `Your spending breakdown:\n`;
    Object.entries(categories).forEach(([cat, amt]) => {
      advice += `• ${cat}: ₹${amt}\n`;
    });
    
    advice += `\nTry the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`;
    return advice;
    
  } else if (q.includes('invest') || q.includes('grow')) {
    return `For your income of ₹${income}, consider these investment options:
1. Emergency Fund: 3-6 months of expenses (₹${totalExpenses * 4})
2. Mutual Funds: Start with ₹${Math.min(5000, income * 0.1)} monthly SIP
3. Fixed Deposits: Safe option for short-term goals`;
    
  } else if (q.includes('debt') || q.includes('loan')) {
    return `For debt management:
• Prioritize high-interest debts first
• Consider debt consolidation if you have multiple loans
• Aim to keep total EMI under 40% of your monthly income`;
    
  } else {
    return `I understand you're asking about "${question}". As your financial advisor, I can see:
• Your monthly income: ₹${income}
• Current expenses: ₹${totalExpenses}
• Savings progress: ₹${saved} of ₹${goal} goal

For personalized advice, consider tracking all your expenses and setting clear financial goals. Would you like specific advice on savings, budgeting, or investments?`;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});