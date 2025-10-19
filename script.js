// script.js - Complete Backend-Integrated Version

/* === App logic & Backend integration ===
   - Uses backend API instead of localStorage
   - JWT token stored in localStorage for auth
   - All data stored in database
*/

const API_BASE = window.location.origin + '/api';
// ================ STATE & LANGUAGE ================
let currentLanguage = 'en';

// Language dictionary
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.advisor': 'AI Advisor',
    'nav.account': 'Account',
    
    // Home Section
    'home.title': 'Your AI Financial',
    'home.gradient': 'Companion',
    'home.subtitle': 'Take control of your finances with intelligent insights, personalized recommendations, and real-time tracking.',
    'home.cta': 'Get Started',
    'home.card1.title': 'Track Expenses',
    'home.card1.desc': 'Add expenses to visualize where money goes.',
    'home.card2.title': 'Smart Insights',
    'home.card2.desc': 'Receive tailored tips and goal nudges.',
    
    // Dashboard Section
    'dashboard.title': 'Financial Dashboard',
    'dashboard.income.title': 'Monthly Income',
    'dashboard.income.placeholder': '5000',
    'dashboard.income.save': 'Save',
    'dashboard.income.current': 'Current Income',
    'dashboard.goal.title': 'Savings Goal',
    'dashboard.goal.placeholder': '10000',
    'dashboard.goal.set': 'Set Goal',
    'dashboard.goal.progress': 'Progress',
    'dashboard.expense.title': 'Add Expense',
    'dashboard.expense.name': 'Description',
    'dashboard.expense.amount': 'Amount (₹)',
    'dashboard.expense.add': 'Add',
    'dashboard.expense.clear': 'Clear All',
    'dashboard.expense.categories.food': '🍔 Food & Dining',
    'dashboard.expense.categories.transport': '🚗 Transportation',
    'dashboard.expense.categories.entertainment': '🎬 Entertainment',
    'dashboard.expense.categories.utilities': '💡 Utilities',
    'dashboard.expense.categories.shopping': '🛍️ Shopping',
    'dashboard.expense.categories.health': '🏥 Healthcare',
    'dashboard.expense.categories.other': '📦 Other',
    'dashboard.recent.title': 'Recent Expenses',
    'dashboard.recent.total': 'Total',
    'dashboard.recent.placeholder': 'No expenses yet. Start tracking your spending!',
    'dashboard.chart.title': 'Spending by Category',
    'dashboard.insights.title': '💡 Smart Insights',
    'dashboard.insights.placeholder': 'Start tracking your expenses to get personalized insights!',
    
    // Auth Section
    'auth.welcome': 'Welcome to FineFlex',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.income': 'Monthly Income (₹)',
    'auth.goal': 'Savings Goal (₹)',
    'auth.apikey': 'OpenAI API Key (optional)',
    'auth.create': 'Create Account',
    'auth.welcomeUser': 'Welcome,',
    'auth.logout': 'Logout',
    'auth.saveKey': 'Save API Key',
    
    // Advisor Section
    'advisor.title': 'AI Financial Advisor',
    'advisor.aiName': 'FineFlex AI',
    'advisor.tagline': 'Always here to help',
    'advisor.recommendations': 'Personalized Recommendations',
    'advisor.recommendations.placeholder': 'Add your income and expenses to get personalized financial advice.',
    'advisor.chat.title': 'Chat with FineFlex AI 💬',
    'advisor.chat.placeholder': 'Ask FineFlex AI anything...',
    'advisor.chat.ask': 'Ask',
    
    // Footer
    'footer': '© 2025 FineFlex — All data stored in database.'
  },
  
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.advisor': 'एआई सलाहकार',
    'nav.account': 'खाता',
    
    // Home Section
    'home.title': 'आपका एआई वित्तीय',
    'home.gradient': 'साथी',
    'home.subtitle': 'बुद्धिमान अंतर्दृष्टि, व्यक्तिगत सिफारिशें और रीयल-टाइम ट्रैकिंग के साथ अपने वित्त पर नियंत्रण रखें।',
    'home.cta': 'शुरू करें',
    'home.card1.title': 'खर्च ट्रैक करें',
    'home.card1.desc': 'देखें कि पैसा कहाँ जा रहा है।',
    'home.card2.title': 'स्मार्ट अंतर्दृष्टि',
    'home.card2.desc': 'व्यक्तिगत सुझाव और लक्ष्य अनुस्मारक प्राप्त करें।',
    
    // Dashboard Section
    'dashboard.title': 'वित्तीय डैशबोर्ड',
    'dashboard.income.title': 'मासिक आय',
    'dashboard.income.placeholder': '5000',
    'dashboard.income.save': 'सेव करें',
    'dashboard.income.current': 'वर्तमान आय',
    'dashboard.goal.title': 'बचत लक्ष्य',
    'dashboard.goal.placeholder': '10000',
    'dashboard.goal.set': 'लक्ष्य सेट करें',
    'dashboard.goal.progress': 'प्रगति',
    'dashboard.expense.title': 'खर्च जोड़ें',
    'dashboard.expense.name': 'विवरण',
    'dashboard.expense.amount': 'राशि (₹)',
    'dashboard.expense.add': 'जोड़ें',
    'dashboard.expense.clear': 'सभी साफ करें',
    'dashboard.expense.categories.food': '🍔 भोजन',
    'dashboard.expense.categories.transport': '🚗 परिवहन',
    'dashboard.expense.categories.entertainment': '🎬 मनोरंजन',
    'dashboard.expense.categories.utilities': '💡 उपयोगिताएँ',
    'dashboard.expense.categories.shopping': '🛍️ खरीदारी',
    'dashboard.expense.categories.health': '🏥 स्वास्थ्य',
    'dashboard.expense.categories.other': '📦 अन्य',
    'dashboard.recent.title': 'हाल के खर्च',
    'dashboard.recent.total': 'कुल',
    'dashboard.recent.placeholder': 'अभी तक कोई खर्च नहीं। अपना खर्च ट्रैक करना शुरू करें!',
    'dashboard.chart.title': 'श्रेणी के अनुसार खर्च',
    'dashboard.insights.title': '💡 स्मार्ट अंतर्दृष्टि',
    'dashboard.insights.placeholder': 'व्यक्तिगत अंतर्दृष्टि प्राप्त करने के लिए अपने खर्च को ट्रैक करना शुरू करें!',
    
    // Auth Section
    'auth.welcome': 'FineFlex में आपका स्वागत है',
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.username': 'यूजरनेम',
    'auth.income': 'मासिक आय (₹)',
    'auth.goal': 'बचत लक्ष्य (₹)',
    'auth.apikey': 'OpenAI API Key (वैकल्पिक)',
    'auth.create': 'खाता बनाएं',
    'auth.welcomeUser': 'स्वागत है,',
    'auth.logout': 'लॉगआउट',
    'auth.saveKey': 'API Key सेव करें',
    
    // Advisor Section
    'advisor.title': 'एआई वित्तीय सलाहकार',
    'advisor.aiName': 'FineFlex AI',
    'advisor.tagline': 'हमेशा मदद के लिए तैयार',
    'advisor.recommendations': 'व्यक्तिगत सिफारिशें',
    'advisor.recommendations.placeholder': 'व्यक्तिगत वित्तीय सलाह प्राप्त करने के लिए अपनी आय और खर्च जोड़ें।',
    'advisor.chat.title': 'FineFlex AI से बात करें 💬',
    'advisor.chat.placeholder': 'FineFlex AI से कुछ भी पूछें...',
    'advisor.chat.ask': 'पूछें',
    
    // Footer
    'footer': '© 2024 FineFlex — सभी डेटा डेटाबेस में संग्रहीत।'
  }
};

// ================ NAVIGATION ================
function navigateToSection(id){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => { 
    if(a.getAttribute('href') === '#' + id) a.classList.add('active') 
  });
}

// ================ AUTHENTICATION ================
function showAuthTab(which){
  document.getElementById('login-form').style.display = which === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = which === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', which==='login');
  document.getElementById('tab-register').classList.toggle('active', which==='register');
}

async function handleRegister(){
  const username = document.getElementById('register-username').value.trim() || 'User';
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const monthly_income = Number(document.getElementById('register-income').value) || 0;
  const savings_goal = Number(document.getElementById('register-goal').value) || 0;
  const openai_key = document.getElementById('openai-key').value.trim();

  if (!email || !password) {
    alert('Email and password are required');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, monthly_income, savings_goal })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      if (openai_key) {
        await saveOpenAIKey(openai_key);
      }
      refreshUI();
      alert('Account created successfully!');
      navigateToSection('dashboard');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
}

async function handleLogin(){
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Email and password are required');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      refreshUI();
      alert('Logged in successfully!');
      navigateToSection('dashboard');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

async function handleLogout(){
  localStorage.removeItem('token');
  refreshUI();
  navigateToSection('home');
  alert('Logged out successfully');
}

// ================ OPENAI KEY MANAGEMENT ================
async function saveOpenAIKey(key){
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ openai_key: key })
    });

    if (!response.ok) {
      console.error('Failed to save OpenAI key');
    }
  } catch (error) {
    console.error('Error saving OpenAI key:', error);
  }
}

async function saveOpenAIKeyFromInput(){
  const key = document.getElementById('openai-key').value.trim();
  if (key) {
    await saveOpenAIKey(key);
    alert('OpenAI key saved successfully!');
  } else {
    alert('No key entered.');
  }
}

// ================ INCOME & GOAL MANAGEMENT ================
async function saveIncome(){
  const income = Number(document.getElementById('income-input').value) || 0;
  await updateUserSettings({ monthly_income: income });
}

async function saveSavingsGoal(){
  const savings_goal = Number(document.getElementById('goal-input').value) || 0;
  await updateUserSettings({ savings_goal });
}

async function updateUserSettings(settings){
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (response.ok) {
      refreshUI();
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings');
    }
  } catch (error) {
    alert('Error saving settings: ' + error.message);
  }
}

// ================ EXPENSES MANAGEMENT ================
async function getExpenses(){
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE}/expenses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

async function addExpense(e){
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  const name = document.getElementById('expense-name').value.trim();
  const amount = Number(document.getElementById('expense-amount').value) || 0;
  const category = document.getElementById('expense-category').value || 'other';

  if(!name || amount <= 0){
    alert('Enter valid expense name and amount.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, amount, category })
    });

    if (response.ok) {
      document.getElementById('expense-name').value = '';
      document.getElementById('expense-amount').value = '';
      refreshUI();
      /*alert('Expense added successfully!'); */
    } else {
      alert('Failed to add expense'); 
    }
  } catch (error) {
    alert('Error adding expense: ' + error.message);
  }
}

async function deleteExpense(id){
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      refreshUI();
      /*alert('Expense deleted successfully!'); */
    } else {
      alert('Failed to delete expense');
    }
  } catch (error) {
    alert('Error deleting expense: ' + error.message);
  }
}

async function clearAllExpenses(){
  if(!confirm('Clear all expenses? This cannot be undone.')) return;
  
  const expenses = await getExpenses();
  for (const expense of expenses) {
    await deleteExpense(expense.id);
  }
  refreshUI();
}

// ================ CHART FUNCTIONALITY ================
let expensesChart = null;

async function updateChart(){
  const data = await getExpenses();
  const categories = {};
  data.forEach(e => categories[e.category] = (categories[e.category]||0) + Number(e.amount));
  const labels = Object.keys(categories);
  const values = Object.values(categories);
  const ctx = document.getElementById('expenses-chart').getContext('2d');
  
  if(expensesChart) expensesChart.destroy();
  
  expensesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values, 
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#C9CBCF'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255,255,255,0.8)',
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

// ================ UI MANAGEMENT ================
async function refreshUI(){
  const token = localStorage.getItem('token');
  
  if(token){
    try {
      const userResponse = await fetch(`${API_BASE}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.ok) {
        const user = await userResponse.json();
        const userName = document.getElementById('user-name');
        const userInfo = document.getElementById('user-info');
        const authTabs = document.getElementById('auth-tabs');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        // Safely update elements that exist
        if (userName) userName.textContent = user.username || 'User';
        if (userInfo) userInfo.style.display = 'block';
        if (authTabs) authTabs.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        
        // Update OpenAI key field if it exists
        const openaiKeyInput = document.getElementById('openai-key');
        if (openaiKeyInput && user.openai_key) {
          openaiKeyInput.value = user.openai_key;
        }
      } else {
        throw new Error('Failed to fetch user');
      }

      // Get stats
      const statsResponse = await fetch(`${API_BASE}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        updateDashboard(stats);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }

  await updateExpensesList();
  updateChart();
  generateInsights();
  updateAdvisor();
}

function showLoginScreen(){
  const userInfo = document.getElementById('user-info');
  const authTabs = document.getElementById('auth-tabs');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  
  // Only modify elements that exist
  if (userInfo) userInfo.style.display = 'none';
  if (authTabs) authTabs.style.display = 'block';
  if (loginForm) loginForm.style.display = 'block';
  if (registerForm) registerForm.style.display = 'none';
  if (tabLogin) tabLogin.classList.add('active');
  if (tabRegister) tabRegister.classList.remove('active');
}

function updateDashboard(stats){
  // Use ₹ for Indian Rupees
  document.getElementById('income-display').textContent = '₹' + (stats.monthly_income || 0).toLocaleString();
  document.getElementById('goal-amount').textContent = '₹' + (stats.savings_goal || 0).toLocaleString();
  document.getElementById('saved-amount').textContent = '₹' + (stats.saved_amount || 0).toLocaleString();
  
  const pct = stats.goal_percentage || 0;
  document.getElementById('goal-percentage').textContent = Math.round(pct) + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
  
  document.getElementById('total-expenses').textContent = '₹' + (stats.total_expenses || 0).toFixed(2);
}

async function updateExpensesList(){
  const expenses = await getExpenses();
  const list = document.getElementById('expenses-list');
  list.innerHTML = '';
  
  if(expenses.length === 0){
    const lang = translations[currentLanguage];
    list.innerHTML = `<div class="placeholder">${lang['dashboard.recent.placeholder']}</div>`;
  } else {
    expenses.slice(0, 10).forEach(exp => {
      const div = document.createElement('div'); 
      div.className='expense-item';
      div.innerHTML = `<div style="display:flex;gap:.6rem;align-items:center">
        <div style="font-size:1.1rem">📌</div>
        <div>
          <div style="font-weight:700">${escapeHtml(exp.name)}</div>
          <div style="font-size:.85rem;color:var(--text-secondary)">${escapeHtml(exp.category)} • ${new Date(exp.date).toLocaleDateString()}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:.6rem">
        <div class="expense-amount">₹${Number(exp.amount).toFixed(2)}</div>
        <button onclick="deleteExpense(${exp.id})" style="padding:.4rem;border-radius:6px;border:1px solid var(--danger);background:transparent;color:var(--danger);cursor:pointer">Delete</button>
      </div>`;
      list.appendChild(div);
    });
  }
}

// ================ INSIGHTS GENERATION ================
async function generateInsights(){
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const statsResponse = await fetch(`${API_BASE}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!statsResponse.ok) return;
    
    const stats = await statsResponse.json();
    const expenses = await getExpenses();
    
    const income = stats.monthly_income || 0;
    const goal = stats.savings_goal || 0;
    const total = stats.total_expenses || 0;
    const saved = stats.saved_amount || 0;
    
    const recs = [];

    if(income <= 0) recs.push('Set your monthly income in the Account or Dashboard so FineFlex can give tailored advice.');
    if(expenses.length === 0) recs.push('Add expenses—FineFlex will analyze categories and spot savings opportunities.');
    if(total > income) recs.push('Your expenses exceed your income this month. Consider trimming variable costs (food, entertainment).');
    if(saved > 0 && goal > 0){
      const months = Math.ceil(Math.max(0, goal - saved)/Math.max(1, saved));
      recs.push(`With current savings rate, estimated time to reach goal: ${months} month(s). Try increasing monthly savings by 10% to speed this up.`);
    } else if (goal > 0 && saved <= 0) {
      recs.push('You are not currently saving towards your goal. Consider reducing discretionary spending or increasing income.');
    } else {
      recs.push('Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Adjust to match your income variability.');
    }

    const container = document.getElementById('insights-grid');
    container.innerHTML = '';
    recs.slice(0,5).forEach(r => {
      const node = document.createElement('div'); 
      node.className='ai-message';
      node.innerHTML = `<div style="display:flex;gap:.6rem;align-items:flex-start">
        <div style="font-size:1.2rem;margin-top:2px">💡</div>
        <div style="color:var(--text-secondary);line-height:1.4">${r}</div>
      </div>`;
      container.appendChild(node);
    });
  } catch (error) {
    console.error('Error generating insights:', error);
  }
}

// ================ AI ADVISOR ================
function updateAdvisor() {
  const recommendationsList = document.getElementById('recommendations-list');
  const lang = translations[currentLanguage];
  
  if (!localStorage.getItem('token')) {
    recommendationsList.innerHTML = `<div class="placeholder">${lang['advisor.recommendations.placeholder']}</div>`;
    return;
  }
  
  // Recommendations will be populated by generateInsights
}

async function handleAskAI(){
  const q = document.getElementById('user-question').value.trim();
  if(!q){ 
    alert('Type a question for FineFlex AI.'); 
    return; 
  }
  
  setAiResponse('Thinking...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    setAiResponse('Please login first to use the AI advisor.');
    return;
  }

  try {
    // First, check if user has an API key
    const userResponse = await fetch(`${API_BASE}/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to get user data');
    }
    
    const user = await userResponse.json();
    
    if (!user.openai_key) {
      setAiResponse(`
        <div class="ai111-message">
          <h4>API Key Required</h4>
          <p>To use the AI Financial Advisor, you need to add your OpenAI API key.</p>
          <p>Please go to the <strong>Account</strong> section and add your OpenAI API key in the settings.</p>
          <p><em>You can get an API key from <a href="https://platform.openai.com/api-keys" target="_blank" style="color: var(--neon-blue);">OpenAI's website</a></em></p>
        </div>
      `);
      return;
    }

    // Show loading state
    document.getElementById('ask-ai-btn').disabled = true;
    document.getElementById('ask-ai-btn').textContent = 'Thinking...';

    // Make the API call to our backend
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: q })
    });

    const data = await response.json();
    
    if (response.ok) {
      setAiResponse(data.response);
    } else {
      throw new Error(data.error || 'Failed to get AI response');
    }
    
  } catch (error) {
    console.error('AI Error:', error);
    
    // Fallback to predefined responses if API fails
    const statsResponse = await fetch(`${API_BASE}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      const expenses = await getExpenses();
      const context = {
        income: stats.monthly_income || 0,
        goal: stats.savings_goal || 0,
        recentExpenses: expenses.slice(0, 6)
      };
      const fallbackText = fallbackAssistant(q, context);
      setAiResponse(`
        <div class="ai-message">
          <p><strong>Note:</strong> Using fallback mode. ${error.message}</p>
          <hr style="margin: 10px 0; border-color: var(--border);">
          ${formatMarkdownToHtml(fallbackText).replace('<div class="ai-message">', '').replace('</div>', '')}
        </div>
      `);
    } else {
      setAiResponse(`Error: ${error.message}. Please try again.`);
    }
  } finally {
    // Re-enable the button
    document.getElementById('ask-ai-btn').disabled = false;
    document.getElementById('ask-ai-btn').textContent = translations[currentLanguage]['advisor.chat.ask'];
  }
  
  // Clear the input
  document.getElementById('user-question').value = '';
}

function setAiResponse(text) {
  const out = document.getElementById('ai-response');
  out.innerHTML = formatMarkdownToHtml(text);
}

function formatMarkdownToHtml(md) {
  if (!md) return "";

  // Escape HTML to prevent script injection
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Basic Markdown formatting replacements
  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")       // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>")                   // Italic
    .replace(/### (.*?)(\n|$)/g, "<h4>$1</h4>")             // H3 → h4
    .replace(/## (.*?)(\n|$)/g, "<h3>$1</h3>")              // H2 → h3
    .replace(/# (.*?)(\n|$)/g, "<h2>$1</h2>")               // H1 → h2
    .replace(/\n- (.*?)(?=\n|$)/g, "<ul><li>$1</li></ul>")  // Bulleted list
    .replace(/\n\d+\. (.*?)(?=\n|$)/g, "<ol><li>$1</li></ol>") // Numbered list
    .replace(/\n/g, "<br>");                                // Line breaks

  // Merge adjacent UL/OL lists
  html = html.replace(/<\/ul>\s*<ul>/g, "").replace(/<\/ol>\s*<ol>/g, "");

  return `<div class="ai-message">${html}</div>`;
}

// Fallback AI assistant
function fallbackAssistant(question, data){
  const q = (question||'').toLowerCase();

  // common keywords
  const mentions = {
    save: q.includes('save') || q.includes('savings') || q.includes('save more'),
    budget: q.includes('budget') || q.includes('plan') || q.includes('allocate'),
    income: q.includes('income') || q.includes('earn') || q.includes('pay'),
    expense: q.includes('expense') || q.includes('spend') || q.includes('expenses'),
    emergency: q.includes('emergency') || q.includes('fund') || q.includes('rainy day'),
    reduce: q.includes('cut') || q.includes('reduce') || q.includes('trim')
  };

  const income = Number(data.income || 0);
  const goal = Number(data.goal || 0);
  const recent = (data.recentExpenses || []);

  // Build response pieces
  const pieces = [];

  if(mentions.income){
    pieces.push(`Your recorded monthly income is ₹${income.toLocaleString()}. If your income varies, track highest and lowest months and plan savings based on a conservative (lower) month.`);
  }

  if(mentions.save || mentions.emergency){
    if(goal > 0){
      const totalSpent = recent.reduce((s,e)=>s+Number(e.amount),0);
      const estimatedSaved = Math.max(0, income - totalSpent);
      pieces.push(`Your savings goal is ₹${goal.toLocaleString()}. Based on your current month (estimated saved ₹${estimatedSaved.toFixed(2)}), you would reach the goal in ~${estimatedSaved > 0 ? Math.ceil((goal)/estimatedSaved) + ' month(s)' : 'an undefined time — increase savings or income'}.`);
    } else {
      pieces.push('Set a concrete savings goal in the Account tab (e.g., emergency fund = 3 months of essentials).');
    }
    pieces.push('Start by building a small buffer: target ₹200-₹500 as immediate emergency savings, then scale to 3 months of essential expenses.');
  }

  if(mentions.budget || mentions.reduce || mentions.expense){
    // category suggestions from recent expenses
    const catTotals = {};
    recent.forEach(it => catTotals[it.category] = (catTotals[it.category]||0) + Number(it.amount));
    const top = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];
    if(top) pieces.push(`Top recent spending: ${top[0]} — ₹${top[1].toFixed(2)}. Consider cutting discretionary spending in that category by 10-20% and re-route to savings.`);
    pieces.push('Try a simple budget: 50% needs, 30% wants, 20% savings — adjust for irregular income. In low-income months prioritize essentials and pause non-urgent subscriptions.');
  }

  if(pieces.length === 0){
    // Generic helpful answer referencing data
    pieces.push(`You asked: "${question}". Based on your data: income ₹${income.toLocaleString()}, recent ${recent.length} expense(s).`);
    if(recent.length > 0){
      pieces.push('A quick tip: track small daily expenses — they add up. Export or review weekly and set a weekly limit.');
    } else {
      pieces.push('Add a few expenses so I can give a more tailored suggestion (e.g., groceries, transport).');
    }
  }

  // Add final actionable steps
  pieces.push('Actionable steps: 1) Track all expenses for 1 month, 2) Create a small weekly spending limit, 3) Move a small automatic transfer to savings each payday.');
  return pieces.join('\n\n');
}

// ================ LANGUAGE SUPPORT ================
function changeLanguage(lang) {
  currentLanguage = lang;
  
  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if ((lang === 'en' && btn.textContent.includes('ENGLISH')) || 
        (lang === 'hi' && btn.textContent.includes('हिंदी'))) {
      btn.classList.add('active');
    }
  });
  
  updateTextContent();
  localStorage.setItem('fineflex-language', lang);
}

function updateTextContent() {
  const t = translations[currentLanguage];
  
  // Navigation
  updateElementText('[href="#home"]', t['nav.home']);
  updateElementText('[href="#dashboard"]', t['nav.dashboard']);
  updateElementText('[href="#advisor"]', t['nav.advisor']);
  updateElementText('[href="#auth"]', t['nav.account']);
  
  // Home Section
  updateElementText('.hero-title', t['home.title']);
  updateElementText('.gradient-text', t['home.gradient']);
  updateElementText('.hero-subtext', t['home.subtitle']);
  updateElementText('.cta-button', t['home.cta']);
  
  const heroCards = document.querySelectorAll('.hero-cards .dashboard-card');
  if (heroCards.length >= 2) {
    updateElementText('.hero-cards .dashboard-card:nth-child(1) h3', t['home.card1.title']);
    updateElementText('.hero-cards .dashboard-card:nth-child(1) p', t['home.card1.desc']);
    updateElementText('.hero-cards .dashboard-card:nth-child(2) h3', t['home.card2.title']);
    updateElementText('.hero-cards .dashboard-card:nth-child(2) p', t['home.card2.desc']);
  }
  
  // Dashboard Section
  updateElementText('#dashboard h2', t['dashboard.title']);
  
  const dashboardCards = document.querySelectorAll('#dashboard .dashboard-card');
  if (dashboardCards.length > 0) {
    // Monthly Income card
    updateElementText('#dashboard .dashboard-card:nth-child(1) h3', t['dashboard.income.title']);
    updateElementText('#income-input', t['dashboard.income.placeholder'], 'placeholder');
    updateElementText('#dashboard .dashboard-card:nth-child(1) .save-button', t['dashboard.income.save']);
    updateElementText('#dashboard .dashboard-card:nth-child(1) .summary-line span', t['dashboard.income.current']);
    
    // Savings Goal card
    updateElementText('#dashboard .dashboard-card:nth-child(2) h3', t['dashboard.goal.title']);
    updateElementText('#goal-input', t['dashboard.goal.placeholder'], 'placeholder');
    updateElementText('#dashboard .dashboard-card:nth-child(2) .save-button', t['dashboard.goal.set']);
    updateElementText('#dashboard .dashboard-card:nth-child(2) .goal-header span:first-child', t['dashboard.goal.progress']);
    
    // Add Expense card
    updateElementText('#dashboard .dashboard-card:nth-child(3) h3', t['dashboard.expense.title']);
    updateElementText('#expense-name', t['dashboard.expense.name'], 'placeholder');
    updateElementText('#expense-amount', t['dashboard.expense.amount'], 'placeholder');
    updateElementText('.add-expense-button', t['dashboard.expense.add']);
    updateElementText('.clear-btn', t['dashboard.expense.clear']);
    
    // Recent Expenses card
    updateElementText('#dashboard .dashboard-card:nth-child(4) h3', t['dashboard.recent.title']);
    updateElementText('#dashboard .dashboard-card:nth-child(4) .expenses-header div', t['dashboard.recent.total'] + ': ');
    
    // Spending by Category card
    updateElementText('#dashboard .dashboard-card:nth-child(5) h3', t['dashboard.chart.title']);
    
    // Smart Insights card
    updateElementText('#dashboard .insights-card h3', t['dashboard.insights.title']);
  }
  
  // Update category options
  const categorySelect = document.getElementById('expense-category');
  if (categorySelect) {
    categorySelect.innerHTML = `
      <option value="food">${t['dashboard.expense.categories.food']}</option>
      <option value="transport">${t['dashboard.expense.categories.transport']}</option>
      <option value="entertainment">${t['dashboard.expense.categories.entertainment']}</option>
      <option value="utilities">${t['dashboard.expense.categories.utilities']}</option>
      <option value="shopping">${t['dashboard.expense.categories.shopping']}</option>
      <option value="health">${t['dashboard.expense.categories.health']}</option>
      <option value="other">${t['dashboard.expense.categories.other']}</option>
    `;
  }
  
  // Update placeholder text for expenses list
  const placeholder = document.querySelector('.expenses-list .placeholder');
  if (placeholder) {
    placeholder.textContent = t['dashboard.recent.placeholder'];
  }
  
  // Update insights placeholder
  const insightsPlaceholder = document.getElementById('insights-grid');
  if (insightsPlaceholder && insightsPlaceholder.textContent.includes('Start tracking')) {
    insightsPlaceholder.innerHTML = `<div class="placeholder">${t['dashboard.insights.placeholder']}</div>`;
  }
  
  // Auth Section
  updateElementText('#auth h2', t['auth.welcome']);
  updateElementText('#tab-login', t['auth.login']);
  updateElementText('#tab-register', t['auth.register']);
  updateElementText('#login-email', t['auth.email'], 'placeholder');
  updateElementText('#login-password', t['auth.password'], 'placeholder');
  updateElementText('#register-username', t['auth.username'], 'placeholder');
  updateElementText('#register-email', t['auth.email'], 'placeholder');
  updateElementText('#register-password', t['auth.password'], 'placeholder');
  updateElementText('#register-income', t['auth.income'], 'placeholder');
  updateElementText('#register-goal', t['auth.goal'], 'placeholder');
  updateElementText('#openai-key', t['auth.apikey'], 'placeholder');
  updateElementText('#register-form .auth-button', t['auth.create']);
  updateElementText('#user-info h3', t['auth.welcomeUser']);
  updateElementText('.logout-btn', t['auth.logout']);
  updateElementText('#user-info .auth-button', t['auth.saveKey']);
  
  // Advisor Section
  updateElementText('#advisor h2', t['advisor.title']);
  updateElementText('.advisor-header strong', t['advisor.aiName']);
  updateElementText('.advisor-header p', t['advisor.tagline']);
  updateElementText('#advisor h4:nth-of-type(1)', t['advisor.recommendations']);
  
  const recommendationsPlaceholder = document.getElementById('recommendations-list');
  if (recommendationsPlaceholder && recommendationsPlaceholder.textContent.includes('Add your income')) {
    recommendationsPlaceholder.innerHTML = `<div class="placeholder">${t['advisor.recommendations.placeholder']}</div>`;
  }
  
  updateElementText('#advisor h4:nth-of-type(2)', t['advisor.chat.title']);
  updateElementText('#user-question', t['advisor.chat.placeholder'], 'placeholder');
  updateElementText('#ask-ai-btn', t['advisor.chat.ask']);
  
  // Footer
  updateElementText('footer', t['footer']);
}

// Helper function to update element text or placeholder
function updateElementText(selector, text, attribute = 'textContent') {
  const element = document.querySelector(selector);
  if (element) {
    if (attribute === 'placeholder') {
      element.placeholder = text;
    } else {
      element.textContent = text;
    }
  }
}

function initializeLanguage() {
  const savedLanguage = localStorage.getItem('fineflex-language') || 'en';
  changeLanguage(savedLanguage);
}

// ================ UTILITY FUNCTIONS ================
function escapeHtml(s){ 
  return (''+s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); 
}

// ================ INITIALIZATION ================
window.addEventListener('DOMContentLoaded', function () {
  refreshUI();
  initializeLanguage();

  // Add enter key support for AI chat
  const questionInput = document.getElementById('user-question');
  if (questionInput) {
    questionInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAskAI();
      }
    });
  }
  
  // Add enter key support for expense form
  const expenseAmount = document.getElementById('expense-amount');
  if (expenseAmount) {
    expenseAmount.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.add-expense-button').click();
      }
    });
  }
});