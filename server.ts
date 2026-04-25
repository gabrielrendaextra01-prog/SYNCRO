import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DB_FILE = path.join(process.cwd(), "database.json");

// Função para carregar dados do arquivo JSON
function loadData() {
  const defaults = {
    transactions: [],
    goals: [],
    budgets: [],
    businessGoals: [],
    categories: [
      { id: 'c1', name: 'Serviços', type: 'income', grouperId: 'gr1' },
      { id: 'c2', name: 'Consultoria', type: 'income', grouperId: 'gr1' },
      { id: 'c3', name: 'Infra', type: 'expense', grouperId: 'gr2' },
      { id: 'c4', name: 'Marketplace', type: 'expense', grouperId: 'gr2' },
    ],
    groupers: [
      { id: 'gr1', name: 'Core Business', type: 'income' },
      { id: 'gr2', name: 'Operacional', type: 'expense' },
    ],
    contacts: [],
    settings: {
      savingsPercentage: 20,
      targetProfitMargin: 25
    }
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(content);
      
      // Deep merge for settings and ensure all top-level keys exist
      return {
        ...defaults,
        ...loaded,
        settings: { ...defaults.settings, ...(loaded.settings || {}) },
        budgets: loaded.budgets || defaults.budgets,
        businessGoals: loaded.businessGoals || defaults.businessGoals,
        transactions: loaded.transactions || defaults.transactions,
        goals: loaded.goals || defaults.goals,
        categories: loaded.categories || defaults.categories,
        groupers: loaded.groupers || defaults.groupers,
        contacts: loaded.contacts || defaults.contacts
      };
    } catch (e) {
      console.error("Erro ao ler o banco de dados, usando padrões", e);
    }
  }
  return defaults;
}

// Função para salvar dados no arquivo JSON
function saveData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Erro ao salvar no banco de dados", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Inicialização do Armazenamento Financeiro ---
  let financeData = loadData();
  
  // Salva o estado inicial se o arquivo não existir
  if (!fs.existsSync(DB_FILE)) {
    saveData(financeData);
  }

  // --- Rotas da API ---
  
  // Configurações
  app.get("/api/finance/settings", (req, res) => res.json(financeData.settings));
  app.post("/api/finance/settings", (req, res) => {
    financeData.settings = { ...financeData.settings, ...req.body };
    saveData(financeData);
    res.json(financeData.settings);
  });

  // Resetar Dados Financeiros (Apenas se solicitado pelo usuário)
  app.delete("/api/finance/reset", (req, res) => {
    financeData.transactions = [];
    saveData(financeData);
    console.log("Reset de histórico financeiro acionado");
    res.json({ message: "Histórico financeiro limpo", status: "success" });
  });

  // Deletar Transação
  app.delete("/api/finance/transactions/:id", (req, res) => {
    const { id } = req.params;
    financeData.transactions = financeData.transactions.filter((t: any) => t.id !== id);
    saveData(financeData);
    res.json({ message: "Transação deletada" });
  });

  // Categorias
  app.get("/api/finance/categories", (req, res) => res.json(financeData.categories));
  app.post("/api/finance/categories", (req, res) => {
    const newCat = { id: (Date.now() + Math.random()).toString(), ...req.body };
    financeData.categories.push(newCat);
    saveData(financeData);
    res.json(newCat);
  });
  app.delete("/api/finance/categories/:id", (req, res) => {
    const { id } = req.params;
    financeData.categories = financeData.categories.filter((c: any) => c.id !== id);
    saveData(financeData);
    res.json({ message: "Categoria deletada" });
  });

  // Agrupadores
  app.get("/api/finance/groupers", (req, res) => res.json(financeData.groupers));
  app.post("/api/finance/groupers", (req, res) => {
    const newGrp = { id: (Date.now() + Math.random()).toString(), ...req.body };
    financeData.groupers.push(newGrp);
    saveData(financeData);
    res.json(newGrp);
  });
  app.delete("/api/finance/groupers/:id", (req, res) => {
    const { id } = req.params;
    financeData.groupers = financeData.groupers.filter((g: any) => g.id !== id);
    saveData(financeData);
    res.json({ message: "Agrupador deletado" });
  });

  // Contatos (Clientes e Fornecedores)
  app.get("/api/finance/contacts", (req, res) => res.json(financeData.contacts));
  app.post("/api/finance/contacts", (req, res) => {
    const newContact = { id: (Date.now() + Math.random()).toString(), ...req.body };
    financeData.contacts.push(newContact);
    saveData(financeData);
    res.json(newContact);
  });
  app.delete("/api/finance/contacts/:id", (req, res) => {
    const { id } = req.params;
    financeData.contacts = financeData.contacts.filter((c: any) => c.id !== id);
    saveData(financeData);
    res.json({ message: "Contato deletado" });
  });

  // Resumo Financeiro
  app.get("/api/finance/summary", (req, res) => {
    const revenue = financeData.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    
    const expenses = financeData.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    
    const profit = revenue - expenses;
    const balance = revenue - expenses;
    const savingsPercentage = financeData.settings.savingsPercentage;
    const savedAmount = profit > 0 ? profit * (savingsPercentage / 100) : 0;

    res.json({
      balance,
      revenue,
      expenses,
      profit,
      savingsPercentage,
      savedAmount
    });
  });

  // Listar Transações
  app.get("/api/finance/transactions", (req, res) => {
    res.json(financeData.transactions);
  });

  // Criar Transação
  app.post("/api/finance/transactions", (req, res) => {
    const { description, type, amount, category, contact } = req.body;
    const newTransaction = {
      id: (Date.now() + Math.random()).toString(),
      date: new Date().toISOString().split('T')[0],
      description,
      type,
      amount: parseFloat(amount),
      category,
      contact: contact || ''
    };

    financeData.transactions.unshift(newTransaction);
    saveData(financeData);
    res.json(newTransaction);
  });

  // Metas Financeiras
  app.get("/api/finance/goals", (req, res) => {
    const revenue = financeData.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const expenses = financeData.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const profit = revenue - expenses;
    
    let totalAvailable = profit > 0 ? profit * (financeData.settings.savingsPercentage / 100) : 0;
    
    const calculatedGoals = financeData.goals.map((goal: any) => {
      const needed = goal.target;
      const allocated = Math.min(totalAvailable, needed);
      totalAvailable -= allocated;
      return { ...goal, current: allocated };
    });

    res.json(calculatedGoals);
  });

  app.post("/api/finance/goals", (req, res) => {
    const newGoal = { id: (Date.now() + Math.random()).toString(), current: 0, ...req.body };
    financeData.goals.push(newGoal);
    saveData(financeData);
    res.json(newGoal);
  });

  app.put("/api/finance/goals/:id", (req, res) => {
    const { id } = req.params;
    const index = financeData.goals.findIndex((g: any) => g.id === id);
    if (index !== -1) {
      financeData.goals[index] = { ...financeData.goals[index], ...req.body };
      saveData(financeData);
      res.json(financeData.goals[index]);
    } else {
      res.status(404).json({ message: "Meta financeira não encontrada" });
    }
  });

  app.delete("/api/finance/goals/:id", (req, res) => {
    const { id } = req.params;
    financeData.goals = financeData.goals.filter((g: any) => g.id !== id);
    saveData(financeData);
    res.json({ message: "Meta deletada" });
  });

  // Planejamento de Custos (Orçamentos)
  app.get("/api/finance/budgets", (req, res) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const calculatedBudgets = financeData.budgets.map((b: any) => {
      const category = financeData.categories.find((c: any) => c.id === b.categoryId);
      const spent = financeData.transactions
        .filter((t: any) => t.type === 'expense' && t.category === category?.name && t.date.startsWith(currentMonth))
        .reduce((acc: number, t: any) => acc + t.amount, 0);
      
      return { ...b, spent, categoryName: category?.name };
    });
    res.json(calculatedBudgets);
  });

  app.post("/api/finance/budgets", (req, res) => {
    const newBudget = { id: (Date.now() + Math.random()).toString(), ...req.body };
    financeData.budgets.push(newBudget);
    saveData(financeData);
    res.json(newBudget);
  });

  app.delete("/api/finance/budgets/:id", (req, res) => {
    const { id } = req.params;
    financeData.budgets = financeData.budgets.filter((b: any) => b.id !== id);
    saveData(financeData);
    res.json({ message: "Orçamento deletado" });
  });

  // Metas de Negócio (Margem de Lucro, etc)
  app.get("/api/finance/business-goals", (req, res) => {
    const revenue = financeData.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const expenses = financeData.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const profit = revenue - expenses;
    const currentMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const calculatedBusinessGoals = financeData.businessGoals.map((bg: any) => {
      if (bg.type === 'profit_margin') {
        return { ...bg, current: currentMargin };
      }
      return bg;
    });

    res.json(calculatedBusinessGoals);
  });

  app.post("/api/finance/business-goals", (req, res) => {
    const newBG = { id: (Date.now() + Math.random()).toString(), ...req.body };
    financeData.businessGoals.push(newBG);
    saveData(financeData);
    res.json(newBG);
  });

  app.put("/api/finance/business-goals/:id", (req, res) => {
    const { id } = req.params;
    const index = financeData.businessGoals.findIndex((bg: any) => bg.id === id);
    if (index !== -1) {
      financeData.businessGoals[index] = { ...financeData.businessGoals[index], ...req.body };
      saveData(financeData);
      res.json(financeData.businessGoals[index]);
    } else {
      res.status(404).json({ message: "Meta de negócio não encontrada" });
    }
  });

  app.delete("/api/finance/business-goals/:id", (req, res) => {
    const { id } = req.params;
    financeData.businessGoals = financeData.businessGoals.filter((bg: any) => bg.id !== id);
    saveData(financeData);
    res.json({ message: "Meta de negócio deletada" });
  });

  // Alertas de IA baseados em planejamento
  app.get("/api/finance/alerts", (req, res) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const alerts: any[] = [];

    // Alertas de Orçamento
    financeData.budgets.forEach((b: any) => {
      const category = financeData.categories.find((c: any) => c.id === b.categoryId);
      const spent = financeData.transactions
        .filter((t: any) => t.type === 'expense' && t.category === category?.name && t.date.startsWith(currentMonth))
        .reduce((acc: number, t: any) => acc + t.amount, 0);

      const percentage = (spent / b.amount) * 100;
      if (percentage >= 100) {
        alerts.push({
          id: `alert-budget-over-${b.id}`,
          type: 'danger',
          title: `Orçamento Estourado: ${category?.name}`,
          message: `Você ultrapassou o limite de R$ ${b.amount.toLocaleString()} em ${category?.name}. Gasto atual: R$ ${spent.toLocaleString()}.`,
          icon: 'AlertTriangle'
        });
      } else if (percentage >= 80) {
        alerts.push({
          id: `alert-budget-near-${b.id}`,
          type: 'warning',
          title: `Limite Próximo: ${category?.name}`,
          message: `Você atingiu ${Math.round(percentage)}% do orçamento de ${category?.name}.`,
          icon: 'Zap'
        });
      }
    });

    // Alertas de Margem de Lucro
    const revenue = financeData.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const expenses = financeData.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const profit = revenue - expenses;
    const currentMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    financeData.businessGoals.filter((bg: any) => bg.type === 'profit_margin').forEach((bg: any) => {
      if (currentMargin < bg.target) {
        alerts.push({
          id: `alert-margin-low-${bg.id}`,
          type: 'warning',
          title: `Atenção na Margem`,
          message: `Sua margem de lucro atual (${Math.round(currentMargin)}%) está abaixo da meta de ${bg.target}%.`,
          icon: 'TrendingDown'
        });
      }
    });

    res.json(alerts);
  });

  // --- Middleware do Vite para Desenvolvimento ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
