import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Target, 
  Calendar, 
  Settings, 
  CheckCircle2, 
  Circle, 
  LayoutDashboard, 
  BarChart3, 
  Clock,
  ChevronRight,
  Plus,
  Sparkles,
  Search,
  User,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  Pause,
  RotateCcw,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  deadline: string;
  category: string;
  subtasks: SubTask[];
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  energyRequired: 'High' | 'Medium' | 'Low';
  duration: number;
  completed: boolean;
  category: string;
  day: number;
}

interface UserStats {
  xp: number;
  level: number;
  totalCompleted: number;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Revisão estratégica Q3', energyRequired: 'High', duration: 120, completed: false, category: 'Estratégia', day: 0 },
  { id: '2', title: 'Responder e-mails pendentes', energyRequired: 'Low', duration: 30, completed: false, category: 'Admin', day: 1 },
  { id: '3', title: 'Reunião com novos leads', energyRequired: 'Medium', duration: 60, completed: false, category: 'Vendas', day: 2 },
  { id: '4', title: 'Atualizar documentação técnica', energyRequired: 'High', duration: 90, completed: false, category: 'Desenvolvimento', day: 3 },
  { id: '5', title: 'Planejamento de conteúdo semanal', energyRequired: 'Medium', duration: 45, completed: false, category: 'Marketing', day: 4 },
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Lançamento Syncro v2.0',
    deadline: '2024-12-15',
    category: 'Produto',
    completed: false,
    subtasks: [
      { id: 's1', title: 'Refatoração da Engine IA', completed: true },
      { id: 's2', title: 'Beta Test com 100 usuários', completed: false },
      { id: 's3', title: 'Página de Vendas Landing', completed: false }
    ]
  }
];

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const XP_MAP = { High: 50, Medium: 30, Low: 15 };

// --- Main Application ---
export default function App() {
  // State
  const [energy, setEnergy] = useState<'High' | 'Medium' | 'Low'>('High');
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('syncro_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('syncro_goals');
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch (e) {
      return INITIAL_GOALS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('syncro_stats');
      return saved ? JSON.parse(saved) : { xp: 0, level: 1, totalCompleted: 0 };
    } catch (e) {
      return { xp: 0, level: 1, totalCompleted: 0 };
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [financeSummary, setFinanceSummary] = useState({ balance: 0, revenue: 0, expenses: 0, profit: 0, savedAmount: 0, savingsPercentage: 0 });
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);
  const [financeGoals, setFinanceGoals] = useState<Goal[]>([]);
  const [financeCategories, setFinanceCategories] = useState<any[]>([]);
  const [financeGroupers, setFinanceGroupers] = useState<any[]>([]);
  const [financeContacts, setFinanceContacts] = useState<any[]>([]);
  const [financeBudgets, setFinanceBudgets] = useState<any[]>([]);
  const [financeBusinessGoals, setFinanceBusinessGoals] = useState<any[]>([]);
  const [financeAlerts, setFinanceAlerts] = useState<any[]>([]);
  
  // Finance API Fetchers
  const fetchFinanceData = async () => {
    try {
      const [sumRes, transRes, goalsRes, catRes, grpRes, contRes, budgetRes, bgRes, alertRes] = await Promise.all([
        fetch('/api/finance/summary'),
        fetch('/api/finance/transactions'),
        fetch('/api/finance/goals'),
        fetch('/api/finance/categories'),
        fetch('/api/finance/groupers'),
        fetch('/api/finance/contacts'),
        fetch('/api/finance/budgets'),
        fetch('/api/finance/business-goals'),
        fetch('/api/finance/alerts')
      ]);

      const safeParse = async (res: Response, fallback: any) => {
        try {
          if (!res.ok) return fallback;
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return await res.json();
          }
          return fallback;
        } catch (e) {
          return fallback;
        }
      };

      setFinanceSummary(await safeParse(sumRes, { balance: 0, revenue: 0, expenses: 0, profit: 0, savedAmount: 0, savingsPercentage: 0 }));
      setFinanceTransactions(await safeParse(transRes, []));
      setFinanceGoals(await safeParse(goalsRes, []));
      setFinanceCategories(await safeParse(catRes, []));
      setFinanceGroupers(await safeParse(grpRes, []));
      setFinanceContacts(await safeParse(contRes, []));
      setFinanceBudgets(await safeParse(budgetRes, []));
      setFinanceBusinessGoals(await safeParse(bgRes, []));
      setFinanceAlerts(await safeParse(alertRes, []));
    } catch (e) {
      console.error("Failed to fetch finance data", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'finance') {
      fetchFinanceData();
    }
  }, [activeTab]);

  const handleAddTransaction = async (data: any) => {
    try {
      await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchFinanceData();
      notify("💰 Transação registrada");
    } catch (e) {
      notify("❌ Erro ao registrar transação");
    }
  };

  const handleResetFinance = async () => {
    setIsResetModalOpen(true);
  };

  const confirmResetFinance = async () => {
    try {
      const response = await fetch('/api/finance/reset', { method: 'DELETE' });
      if (response.ok) {
        await fetchFinanceData();
        setIsResetModalOpen(false);
        notify("🧹 Modo financeiro reiniciado com sucesso");
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      notify("❌ Erro ao sincronizar com o servidor");
    }
  };

  const handleAddCategory = async (data: any) => {
    await fetch('/api/finance/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchFinanceData();
  };

  const handleAddGrouper = async (data: any) => {
    await fetch('/api/finance/groupers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchFinanceData();
  };

  const handleAddContact = async (data: any) => {
    await fetch('/api/finance/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchFinanceData();
  };

  const handleDeleteTransaction = async (id: string) => {
    console.log("Deleting transaction:", id);
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify("🗑️ Transação excluída");
        fetchFinanceData();
      } else {
        console.error("Delete failed on server");
        notify("❌ Erro ao excluir");
      }
    } catch (e) {
      console.error("Delete error:", e);
      notify("❌ Erro de conexão");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify("🗑️ Categoria excluída");
        fetchFinanceData();
      }
    } catch (e) {
      notify("❌ Erro ao excluir");
    }
  };

  const handleDeleteGrouper = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/groupers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify("🗑️ Agrupador excluído");
        fetchFinanceData();
      }
    } catch (e) {
      notify("❌ Erro ao excluir");
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify("🗑️ Contato excluído");
        fetchFinanceData();
      }
    } catch (e) {
      notify("❌ Erro ao excluir");
    }
  };

  const [activeTimer, setActiveTimer] = useState<{ active: boolean; time: number; total: number } | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; message: string }[]>([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('syncro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('syncro_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('syncro_stats', JSON.stringify(stats));
  }, [stats]);

  // Achievement Check Logic
  const achievements: Achievement[] = [
    { 
      id: 'first_step', 
      title: 'Primeiro Passo', 
      description: 'Completou sua primeira tarefa.', 
      icon: <Target size={16} />, 
      unlocked: stats.totalCompleted >= 1 
    },
    { 
      id: 'hyperfocus', 
      title: 'Mestre do Foco', 
      description: 'Completou 5 tarefas de alta energia.', 
      icon: <Zap size={16} />, 
      unlocked: tasks.filter(t => t.completed && t.energyRequired === 'High').length >= 5 
    },
    { 
      id: 'sprint_master', 
      title: 'Velocista Q3', 
      description: 'Atingiu o nível 5 de produtividade.', 
      icon: <BarChart3 size={16} />, 
      unlocked: stats.level >= 5 
    }
  ];

  // Actions
  const notify = (message: string) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const getRequiredXP = (level: number) => (level + 1) * 100;

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        const gained = XP_MAP[t.energyRequired as keyof typeof XP_MAP];
        
        setStats(prevStats => {
          let newXp = isCompleting ? prevStats.xp + gained : prevStats.xp - gained;
          let newLevel = prevStats.level;
          let totalComp = isCompleting ? prevStats.totalCompleted + 1 : prevStats.totalCompleted - 1;

          // Level Up
          while (newXp >= getRequiredXP(newLevel)) {
            newXp -= getRequiredXP(newLevel);
            newLevel += 1;
            notify(`🆙 NÍVEL UP! Agora você é Nível ${newLevel}`);
          }

          // Level Down (if task unchecked and XP goes below 0)
          while (newXp < 0 && newLevel > 1) {
            newLevel -= 1;
            newXp += getRequiredXP(newLevel);
          }

          if (newXp < 0) newXp = 0;

          if (isCompleting) {
            notify(`+${gained} XP: ${t.title}`);
          } else {
            notify(`-${gained} XP: Removido`);
          }

          return {
            ...prevStats,
            xp: newXp,
            level: newLevel,
            totalCompleted: Math.max(0, totalComp)
          };
        });

        return { ...t, completed: isCompleting };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    setIsAddingTask(false);
    setActiveTab('calendar');
    notify("🎯 Novo objetivo sincronizado");
  };

  const optimizeWithAI = () => {
    const sorted = [...tasks].sort((a, b) => {
      const energyMap = { High: 3, Medium: 2, Low: 1 };
      if (energy === 'High') return energyMap[b.energyRequired] - energyMap[a.energyRequired];
      return energyMap[a.energyRequired] - energyMap[b.energyRequired];
    });
    setTasks(sorted);
    notify("🤖 Pipeline otimizado para sua energia");
  };

  return (
    <div className="flex h-screen bg-black text-slate-400 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} alertsCount={financeAlerts.length} />
      
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Notifications */}
        <div className="fixed top-24 right-8 z-[100] space-y-2 pointer-events-none">
          <AnimatePresence>
            {notifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/50"
              >
                <Zap size={14} className="fill-current" />
                {n.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Header 
          energy={energy} 
          setEnergy={setEnergy} 
          onAddTask={() => setIsAddingTask(true)} 
        />

        <div className="p-8 max-w-6xl mx-auto w-full space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardView 
                energy={energy} 
                tasks={tasks} 
                stats={stats}
                achievements={achievements}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onOptimize={optimizeWithAI}
                setActiveTab={setActiveTab}
                onStartTimer={(t: Task) => setActiveTimer({ active: true, time: t.duration * 60, total: t.duration * 60 })}
              />
            )}
            {activeTab === 'goals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="roadmap">
                <RoadmapView 
                  achievements={achievements} 
                  goals={goals} 
                  onUpdateGoal={(updatedGoal: Goal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g))}
                  onDeleteGoal={(id: string) => setGoals(prev => prev.filter(g => g.id !== id))}
                  onAddGoal={(goal: Goal) => { setGoals(prev => [...prev, goal]); notify("🚩 Meta estratégica definida"); }}
                />
              </motion.div>
            )}
            {activeTab === 'calendar' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="calendar">
                <CalendarView tasks={tasks} />
              </motion.div>
            )}
            {activeTab === 'insights' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="insights">
                <InsightsView tasks={tasks} stats={stats} />
              </motion.div>
            )}
            {activeTab === 'finance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="finance">
                <FinanceView 
                  summary={financeSummary} 
                  transactions={financeTransactions} 
                  goals={financeGoals} 
                  categories={financeCategories}
                  groupers={financeGroupers}
                  contacts={financeContacts}
                  budgets={financeBudgets}
                  businessGoals={financeBusinessGoals}
                  alerts={financeAlerts}
                  isResetModalOpen={isResetModalOpen}
                  setIsResetModalOpen={setIsResetModalOpen}
                  onAddTransaction={handleAddTransaction}
                  onReset={handleResetFinance}
                  onConfirmReset={confirmResetFinance}
                  onAddCategory={handleAddCategory}
                  onAddGrouper={handleAddGrouper}
                  onAddContact={handleAddContact}
                  onDeleteTransaction={handleDeleteTransaction}
                  onDeleteCategory={handleDeleteCategory}
                  onDeleteGrouper={handleDeleteGrouper}
                  onDeleteContact={handleDeleteContact}
                  onFetchData={fetchFinanceData}
                  notify={notify}
                />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="settings">
                <SettingsView 
                  stats={stats} 
                  financeSettings={{ savingsPercentage: financeSummary.savingsPercentage }}
                  onUpdateFinanceSettings={async (newSettings: any) => {
                    await fetch('/api/finance/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newSettings)
                    });
                    fetchFinanceData();
                    notify("⚙️ Configurações financeiras atualizadas");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AddTaskModal 
        isOpen={isAddingTask} 
        onClose={() => setIsAddingTask(false)} 
        onAdd={handleAddTask} 
      />

      <TimerOverlay 
        timer={activeTimer} 
        onClose={() => setActiveTimer(null)} 
      />
    </div>
  );
}

// --- Sub-Views & Components ---

function Sidebar({ activeTab, setActiveTab, stats, alertsCount = 0 }: { activeTab: string; setActiveTab: (t: string) => void; stats: UserStats; alertsCount?: number }) {
  const reqXp = (stats.level + 1) * 100;
  const xpPercentage = (stats.xp / reqXp) * 100;

  return (
    <aside className="w-64 border-r border-[#141B26] flex flex-col p-6 space-y-8 bg-[#080808]">
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Zap size={12} className="text-slate-950 fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tighter text-white">SYNCRO<span className="text-emerald-500 font-mono">_</span></span>
      </div>

      <div className="px-2 space-y-4">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Nível {stats.level}</span>
          <span className="text-[9px] text-slate-500 font-mono">{stats.xp} / {reqXp} XP</span>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<Target size={18} />} label="Roadmap" active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
        <NavItem icon={<Calendar size={18} />} label="Cronograma" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <NavItem icon={<BarChart3 size={18} />} label="Velocidade" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
        <NavItem icon={<Wallet size={18} />} label="Financeiro" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} badge={alertsCount > 0 ? alertsCount : undefined} />
      </nav>

      <div className="space-y-4 pt-8 border-t border-[#1E293B]">
        <NavItem icon={<Settings size={18} />} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900/50 cursor-pointer transition-all border border-transparent hover:border-emerald-500/10 active:scale-95">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <User size={16} className="text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Strategy Lead</span>
            <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-tighter">Rank: Elite</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ energy, setEnergy, onAddTask }: any) {
  return (
    <header className="h-20 border-b border-[#1E293B] px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4 bg-slate-900/40 px-4 py-2 rounded-full border border-[#1E293B]">
        <Search size={16} className="text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar objetivos..." 
          className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 placeholder:text-slate-600 font-mono text-white"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sinc. Energia:</span>
          <div className="flex gap-1 p-1 bg-slate-900/80 rounded-full border border-[#1E293B]">
            {(['Low', 'Medium', 'High'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setEnergy(level)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${
                  energy === level 
                    ? 'bg-emerald-500 text-slate-950 px-4' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {level === 'Low' ? 'Baixa' : level === 'Medium' ? 'Mid' : 'Pico'}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={onAddTask}
          className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Novo Objetivo</span>
        </button>
      </div>
    </header>
  );
}

function DashboardView({ energy, tasks, stats, achievements, onToggle, onDelete, onOptimize, onStartTimer, setActiveTab }: any) {
  const focusTask = tasks.find((t: any) => !t.completed && t.energyRequired === energy) || tasks.find((t: any) => !t.completed);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest block mb-2">01. Perspectiva</span>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
            Otimize para <br/>
            <span className="text-slate-500 italic">Alta Performance.</span>
          </h1>
        </div>
        <div className="text-right border-l border-slate-800 pl-6 py-2 hidden sm:block">
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-1">Métrica Norte</p>
          <p className="text-slate-300 text-sm font-medium">Eficiência: {stats.totalCompleted > 0 ? "Otimizada" : "Calibrando..."}</p>
        </div>
      </header>

      <section className="bg-[#0D0D0D] border border-[#1E293B] rounded-[32px] p-10 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles size={160} className="text-emerald-500" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Syncro AI Engine</span>
          </div>

          {focusTask ? (
            <div className="space-y-4">
              <h3 className="text-4xl font-semibold tracking-tight text-white leading-tight max-w-2xl">
                Próximo Alvo: <span className="text-emerald-400 font-thin">/</span> {focusTask.title}
              </h3>
              <p className="text-slate-400 text-lg max-w-xl border-l-2 border-emerald-500/30 pl-4 leading-relaxed">
                Tarefa de energia <span className="text-white font-semibold">{(focusTask.energyRequired as string).toUpperCase()}</span>. Finalizá-la concederá <span className="text-emerald-400 font-bold">+{XP_MAP[focusTask.energyRequired as keyof typeof XP_MAP]} XP</span>.
              </p>
            </div>
          ) : (
            <h3 className="text-3xl font-medium tracking-tight text-white italic font-serif">Pipeline vazio. Sua produtividade está em dia.</h3>
          )}

          <div className="flex flex-wrap items-center gap-6 md:gap-10 pt-4">
            <div className="flex flex-col">
              <span className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">Duração Est.</span>
              <span className="text-xl text-slate-200">{focusTask?.duration || 0}m</span>
            </div>
            <div className="flex flex-col">
               <span className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">Recompensa</span>
               <span className="text-xl text-emerald-500 font-mono">
                {focusTask ? `+${XP_MAP[focusTask.energyRequired as keyof typeof XP_MAP]} XP` : "0 XP"}
               </span>
            </div>
            <div className="flex-1" />
            {focusTask && (
              <button 
                onClick={() => onStartTimer(focusTask)}
                className="bg-white text-slate-950 px-10 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
              >
                Ativar Hyperfocus
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest">02. Fluxo de Trabalho</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{tasks.filter((t: any) => !t.completed).length} Pendentes</span>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task: any, idx: number) => (
                <TaskItem key={task.id} task={task} idx={idx} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-6 shadow-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                <Sparkles size={18} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Otimização IA</span>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Sua carga cognitiva atual sugere priorizar tarefas de {(energy as string).toUpperCase()} energia para ganho máximo de XP.
                </p>
              </div>
            </div>
            <button 
              onClick={onOptimize}
              className="w-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/30 py-3 rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-all text-emerald-400 flex items-center justify-center gap-2"
            >
              <Zap size={14} /> Reordenar por Prioridade
            </button>
          </div>
          
          <div className="bg-[#0D0D0D] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Conquistas Recentes</span>
            <div className="space-y-3">
              {achievements.filter((a: any) => a.unlocked).slice(0, 3).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-emerald-500">{a.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">{a.title}</span>
                    <span className="text-[9px] text-slate-500">Desbloqueado</span>
                  </div>
                </div>
              ))}
              {achievements.filter((a: any) => a.unlocked).length === 0 && (
                 <p className="text-[10px] text-slate-600 italic">Continue completando tarefas para ganhar emblemas.</p>
              )}
            </div>
            <button 
              onClick={() => setActiveTab('goals')}
              className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest hover:underline"
            >
              Ver Todas as Conquistas
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskItem({ task, idx, onToggle, onDelete }: any) {
  const xp = XP_MAP[task.energyRequired as keyof typeof XP_MAP];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => onToggle(task.id)}
      className={`group p-5 bg-[#0D0D0D] border border-[#1E293B] rounded-2xl transition-all cursor-pointer flex items-center justify-between hover:border-emerald-500/30 ${task.completed ? 'opacity-40 border-slate-900' : 'hover:bg-[#111111] shadow-lg'}`}
    >
      <div className="flex items-center gap-5">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-800 group-hover:border-emerald-500/50'}`}>
          {task.completed && <CheckCircle2 size={12} className="text-slate-950" />}
        </div>
        <div>
          <h4 className={`text-sm font-semibold tracking-wide ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</h4>
          <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] uppercase tracking-widest">
            <span className="text-emerald-500/70 border border-emerald-500/20 px-2 rounded">{task.category}</span>
            <span className="text-slate-600 flex items-center gap-1"><Clock size={10} /> {task.duration}m</span>
            {!task.completed && <span className="text-emerald-400">+{xp} XP</span>}
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all">
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

function CalendarView({ tasks }: { tasks: Task[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <header>
        <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest block mb-1">Agenda Sync</span>
        <h2 className="text-3xl font-bold text-white tracking-tight">Cronograma de Fluxo</h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {WEEK_DAYS.map((day, idx) => (
          <div key={day} className="space-y-4">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block text-center py-2 bg-slate-900/40 rounded-lg">{day}</span>
            <div className="bg-[#0D0D0D] border border-[#1E293B] rounded-2xl min-h-[300px] p-2 space-y-2">
              {tasks.filter(t => t.day === idx).map(t => (
                <div 
                  key={t.id} 
                  className={`p-3 rounded-xl text-[9px] font-bold uppercase leading-tight border transition-all ${
                    t.completed 
                      ? 'opacity-30 border-slate-900 bg-black text-slate-700' 
                      : `bg-slate-900/50 border-emerald-500/20 text-emerald-500 ${t.energyRequired === 'High' ? 'border-emerald-500/50' : ''}`
                  }`}
                >
                  <div className="mb-2 truncate">{t.title}</div>
                  <div className="flex justify-between items-center opacity-60">
                    <span>{t.duration}m</span>
                    <span>{t.energyRequired === 'High' ? '⚡️⚡️' : '⚡️'}</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.day === idx).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-5 py-20">
                  <Plus size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function InsightsView({ tasks, stats }: { tasks: Task[]; stats: UserStats }) {
  const data = [
    { name: 'Seg', val: 40 }, { name: 'Ter', val: 65 }, { name: 'Qua', val: 45 },
    { name: 'Qui', val: 80 }, { name: 'Sex', val: 95 }, { name: 'Sáb', val: 50 }, { name: 'Dom', val: 30 }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
       <header>
          <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest block mb-1">Métricas de Maestria</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">Análise de Performance</h2>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0D0D0D] border border-[#1E293B] rounded-3xl p-8 h-[350px]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-10 flex items-center gap-2">
              <Zap size={16} className="text-emerald-500" /> Fluxo de Atividade (Semana)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #1e293b', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <StatCard label="Nível Produtividade" value={`Lv. ${stats.level}`} sub={`${stats.xp} XP acumulado`} />
            <StatCard label="Carga de Trabalho" value="Elite" sub="Média High Energy" />
            <StatCard label="Sprint Atual" value="08h" sub="Tempo focado hoje" />
            <StatCard label="Total Objetivos" value={stats.totalCompleted.toString()} sub="Histórico vitalício" />
          </div>
       </div>
    </motion.div>
  );
}

function RoadmapView({ achievements, goals, onUpdateGoal, onDeleteGoal, onAddGoal }: { 
  achievements: Achievement[]; 
  goals: Goal[]; 
  onUpdateGoal: (g: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onAddGoal: (g: Goal) => void;
}) {
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const toggleSubtask = (goal: Goal, subtaskId: string) => {
    const updatedSubtasks = goal.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const allCompleted = updatedSubtasks.every(s => s.completed);
    onUpdateGoal({ ...goal, subtasks: updatedSubtasks, completed: allCompleted });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest block mb-1">03. Progressão</span>
          <h2 className="text-4xl font-bold text-white tracking-tight">Arquitetura de Metas</h2>
        </div>
        <button 
          onClick={() => setIsAddingGoal(true)}
          className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={14} /> Definir Nova Meta
        </button>
      </header>

      <section className="space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
          <Target size={18} className="text-emerald-500" />
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Roadmap Estratégico</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {goals.map((goal) => {
            const completedCount = goal.subtasks.filter(s => s.completed).length;
            const progress = (completedCount / goal.subtasks.length) * 100;

            return (
              <motion.div 
                key={goal.id}
                layout
                className={`bg-[#0D0D0D] border rounded-[32px] p-8 space-y-6 relative group transition-all ${goal.completed ? 'border-emerald-500/40' : 'border-[#1E293B] hover:border-slate-700'}`}
              >
                <button 
                  onClick={() => onDeleteGoal(goal.id)}
                  className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                      {goal.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 uppercase">
                      <Calendar size={12} /> {goal.deadline}
                    </span>
                  </div>
                  <h4 className={`text-2xl font-bold tracking-tight ${goal.completed ? 'text-emerald-400' : 'text-white'}`}>
                    {goal.title}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-500">Progresso</span>
                    <span className="text-emerald-500 font-mono">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full ${goal.completed ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-emerald-600'}`}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Milestones</span>
                  {goal.subtasks.map((sub) => (
                    <div 
                      key={sub.id} 
                      onClick={() => toggleSubtask(goal, sub.id)}
                      className="flex items-center gap-3 cursor-pointer group/sub"
                    >
                      <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${sub.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-800 group-hover/sub:border-emerald-500/50'}`}>
                        {sub.completed && <CheckCircle2 size={10} className="text-slate-950" />}
                      </div>
                      <span className={`text-xs ${sub.completed ? 'text-slate-600 line-through' : 'text-slate-400 group-hover/sub:text-slate-200'}`}>
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {goals.length === 0 && (
            <div className="col-span-2 py-20 bg-slate-950/50 rounded-[32px] border border-dashed border-slate-900 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700">
                <Target size={24} />
              </div>
              <p className="text-slate-600 font-medium italic">Nenhuma meta estratégica definida para o roadmap.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
          <Sparkles size={18} className="text-emerald-500" />
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Emblemas de Conquista</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-8 rounded-[32px] border transition-all relative overflow-hidden group ${
                achievement.unlocked 
                  ? 'bg-[#0D0D0D] border-emerald-500/30 shadow-2xl' 
                  : 'bg-black border-slate-950 grayscale opacity-30 cursor-not-allowed'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${achievement.unlocked ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-900'}`}>
                <div className={achievement.unlocked ? 'text-slate-950' : 'text-slate-600'}>
                  {achievement.icon}
                </div>
              </div>
              
              <h4 className={`text-xl font-bold mb-2 tracking-tight ${achievement.unlocked ? 'text-white' : 'text-slate-600'}`}>
                {achievement.title}
              </h4>
              <p className={`text-xs leading-relaxed ${achievement.unlocked ? 'text-slate-400' : 'text-slate-800'}`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AddGoalModal isOpen={isAddingGoal} onClose={() => setIsAddingGoal(false)} onAdd={onAddGoal} />
    </motion.div>
  );
}

function AddGoalModal({ isOpen, onClose, onAdd }: any) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Estratégico');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState(['']);

  if (!isOpen) return null;

  const handleAddGoal = () => {
    if (!title || !deadline) return;
    const finalSubtasks = subtasks.filter(s => s.trim() !== '').map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      title: s,
      completed: false
    }));

    onAdd({
      id: (Date.now() + Math.random()).toString(),
      title,
      category,
      deadline,
      subtasks: finalSubtasks,
      completed: false
    });
    onClose();
    setTitle('');
    setDeadline('');
    setSubtasks(['']);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#080808] border border-slate-900 w-full max-w-xl rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>

        <div className="space-y-1">
          <h4 className="text-2xl font-bold text-white tracking-tighter">Definir Meta de Longo Prazo</h4>
          <p className="text-slate-500 text-xs">A arquitetura de sucesso começa com marcos claros.</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest ml-1">Título da Meta</label>
            <input 
              autoFocus 
              placeholder="Ex: Lançamento do novo App"
              className="w-full bg-black border border-slate-900 p-5 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-medium placeholder:text-slate-800"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest ml-1">Categoria</label>
              <select 
                className="w-full bg-black border border-slate-900 p-5 rounded-2xl text-white outline-none focus:border-emerald-500 appearance-none font-medium"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Profissional">Profissional</option>
                <option value="Saúde">Saúde</option>
                <option value="Finanças">Finanças</option>
                <option value="Aprendizado">Aprendizado</option>
                <option value="Estratégico">Estratégico</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest ml-1">Prazo Final</label>
              <input 
                type="date"
                className="w-full bg-black border border-slate-900 p-5 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-medium"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">Milestones (Sub-tarefas)</label>
              <button 
                onClick={() => setSubtasks([...subtasks, ''])}
                className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-400"
              >
                <Plus size={12} /> Adicionar Marco
              </button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {subtasks.map((st, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    placeholder={`Milestone ${idx + 1}`}
                    className="flex-1 bg-black border border-slate-900 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-400 transition-all"
                    value={st}
                    onChange={e => {
                      const newST = [...subtasks];
                      newST[idx] = e.target.value;
                      setSubtasks(newST);
                    }}
                  />
                  {subtasks.length > 1 && (
                    <button 
                      onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}
                      className="p-3 text-slate-800 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleAddGoal}
          className="w-full bg-white text-slate-950 py-5 rounded-[22px] font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-[0.98] mt-4"
        >
          Sincronizar Meta com o Roadmap
        </button>
      </motion.div>
    </div>
  );
}

// --- Modals & Overlays ---

function AddTaskModal({ isOpen, onClose, onAdd }: any) {
  const [title, setTitle] = useState('');
  const [energy, setEnergy] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [day, setDay] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0D0D0D] border border-[#1E293B] w-full max-w-md rounded-[32px] p-8 space-y-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <h4 className="text-xl font-bold text-white tracking-tighter">Novo Objetivo</h4>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">O que será feito?</label>
            <input 
              autoFocus 
              className="w-full bg-black border border-[#1E293B] p-4 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-medium placeholder:text-slate-800"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">Dia do Planejamento</label>
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((d, i) => (
                <button key={i} onClick={() => setDay(i)} className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${day === i ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-black border-[#1E293B] text-slate-600'}`}>{d[0]}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">Energia & XP</label>
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as const).map(lev => (
                <button 
                  key={lev}
                  onClick={() => setEnergy(lev)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase transition-all border flex flex-col items-center gap-1 ${energy === lev ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-black border-[#1E293B] text-slate-600'}`}
                >
                  <span>{lev}</span>
                  <span className="text-[8px] opacity-70">+{XP_MAP[lev]} XP</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            if (!title) return;
            onAdd({ id: (Date.now() + Math.random()).toString(), title, energyRequired: energy, duration: 45, completed: false, category: 'Estratégico', day });
          }}
          className="w-full bg-white text-slate-950 py-5 rounded-[22px] font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-[0.98]"
        >
          Confirmar Objetivo
        </button>
      </motion.div>
    </div>
  );
}

function TimerOverlay({ timer, onClose }: any) {
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (timer) {
      setTimeLeft(timer.time);
      intervalRef.current = setInterval(() => {
        setTimeLeft(v => v > 0 ? v - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer]);

  if (!timer) return null;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12">
        <div className="text-[180px] font-mono font-bold text-white tracking-tighter leading-none select-none tabular-nums drop-shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          {m}:{s < 10 ? `0${s}` : s}
        </div>
        <button onClick={onClose} className="mt-8 px-12 py-5 bg-[#0D0D0D] border border-[#1E293B] text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all">
          Encerrar Fluxo
        </button>
      </motion.div>
    </div>
  );
}

function FinanceView({ 
  summary, 
  transactions, 
  goals, 
  categories, 
  groupers, 
  contacts, 
  budgets,
  businessGoals,
  alerts,
  isResetModalOpen, 
  setIsResetModalOpen, 
  onAddTransaction, 
  onReset, 
  onConfirmReset, 
  onAddCategory, 
  onAddGrouper, 
  onAddContact,
  onDeleteTransaction,
  onDeleteCategory,
  onDeleteGrouper,
  onDeleteContact,
  onFetchData,
  notify
}: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [isManagingGroups, setIsManagingGroups] = useState(false);
  const [isManagingContacts, setIsManagingContacts] = useState(false);
  const [isManagingBudgets, setIsManagingBudgets] = useState(false);
  const [isManagingBusinessGoals, setIsManagingBusinessGoals] = useState(false);
  const [isManagingFinanceGoals, setIsManagingFinanceGoals] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <span className="text-emerald-500 font-mono text-xs uppercase tracking-widest block mb-1">04. Capital</span>
          <h2 className="text-4xl font-bold text-white tracking-tight">Gestão Corporativa</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onReset}
            className="border border-rose-500/30 text-rose-500 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
          >
            <Trash2 size={14} /> Zerar Histórico
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-white text-slate-950 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={14} /> Registrar Transação
          </button>
        </div>
      </header>

      {/* AI Alerts Section */}
      <AnimatePresence>
        {alerts && alerts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Alertas Ativos • {new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert: any) => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-5 rounded-2xl border flex gap-4 ${
                    alert.type === 'danger' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${alert.type === 'danger' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-tighter ${alert.type === 'danger' ? 'text-rose-400' : 'text-amber-400'}`}>
                      AI Alert: {alert.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button onClick={() => setIsManagingCats(true)} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-emerald-500/50 hover:text-white transition-all">Categorias</button>
        <button onClick={() => setIsManagingGroups(true)} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-emerald-500/50 hover:text-white transition-all">Agrupadores</button>
        <button onClick={() => setIsManagingContacts(true)} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-emerald-500/50 hover:text-white transition-all">Contatos</button>
        <button onClick={() => setIsManagingBudgets(true)} className="p-4 bg-slate-900/40 border border-emerald-500/20 rounded-2xl text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all">Orçamentos</button>
        <button onClick={() => setIsManagingBusinessGoals(true)} className="p-4 bg-slate-900/40 border border-amber-500/20 rounded-2xl text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all">Metas de Negócio</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Faturamento" value={`R$ ${summary.revenue.toLocaleString()}`} icon={<ArrowUpRight size={20} className="text-emerald-500" />} />
        <StatCard label="Despesas" value={`R$ ${summary.expenses.toLocaleString()}`} icon={<ArrowDownLeft size={20} className="text-rose-500" />} />
        <StatCard 
          label="Rentabilidade" 
          value={`R$ ${summary.profit.toLocaleString()}`} 
          sub={`Margem: ${summary.revenue > 0 ? Math.round((summary.profit / summary.revenue) * 100) : 0}%`} 
          icon={<TrendingUp size={20} className="text-emerald-400" />} 
          isLoss={summary.profit < 0}
        />
        <StatCard 
          label="Provisionado" 
          value={`R$ ${summary.savedAmount.toLocaleString()}`} 
          sub={`${summary.savingsPercentage}% do Lucro`}
          icon={<Target size={20} className="text-amber-400" />} 
        />
      </div>

      <div className="bg-[#0D0D0D] border border-slate-900 p-6 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
            <Settings size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tighter">Porcentagem de Poupança</h4>
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Defina quanto do lucro líquido será destinado às metas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={summary.savingsPercentage} 
            onChange={async (e) => {
              const val = parseInt(e.target.value);
              await fetch('/api/finance/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savingsPercentage: val })
              });
              onFetchData();
            }}
            className="w-48 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-lg font-bold font-mono text-emerald-500 w-12">{summary.savingsPercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Planejamento de Custos (Budgets) UI */}
          {budgets && budgets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <span className="text-amber-500 font-mono text-[10px] uppercase tracking-widest">Planejamento de Custos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map((b: any) => {
                  const percentage = (b.spent / b.amount) * 100;
                  return (
                    <div key={b.id} className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-white">{b.categoryName}</span>
                        <span className="text-[10px] font-mono text-slate-500">R$ {b.spent.toLocaleString()} / {b.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          className={`h-full ${percentage > 100 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                      <p className="text-[9px] text-slate-600 uppercase font-mono tracking-tighter">
                        {percentage > 100 ? '⚠️ Orçamento Excedido' : `${Math.round(percentage)}% consumido`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-900 pb-4 pt-4">
            <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest">Extrato Recente</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{transactions.length} registros</span>
          </div>

          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((t: any) => (
                <div key={t.id} className="bg-[#0D0D0D] border border-slate-900 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{t.description}</h4>
                      <span className="text-[10px] text-slate-600 uppercase font-mono">{t.category} • {t.contact || 'S/ Contato'} • {t.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-sm font-bold font-mono ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteTransaction(t.id);
                      }} 
                      className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Excluir Transação"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 border border-dashed border-slate-900 rounded-3xl text-center">
                <p className="text-xs text-slate-600 uppercase tracking-widest font-mono">Nenhuma transação registrada este mês.</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Business goals (Margin, etc) */}
          <div className="bg-[#0D0D0D] border border-slate-900 rounded-[32px] p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-amber-400">
               <TrendingUp size={16} /> Metas de Alta Gestão
            </h3>
            <div className="space-y-6">
              {businessGoals && businessGoals.map((bg: any) => (
                <div key={bg.id} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-white uppercase tracking-tighter">{bg.title}</span>
                    <span className={`text-[10px] font-mono font-bold ${bg.current >= bg.target ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {Math.round(bg.current)}% / {bg.target}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((bg.current / bg.target) * 100, 100)}%` }}
                      className={`h-full ${bg.current >= bg.target ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}
                    />
                    <div className="absolute top-0 bottom-0 border-l border-white/20" style={{ left: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsManagingBusinessGoals(true)}
              className="w-full text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-slate-400 py-3 rounded-xl hover:bg-slate-800 transition-all"
            >
              Calibrar Parâmetros de Gestão
            </button>
          </div>

          <div className="bg-[#0D0D0D] border border-slate-900 rounded-[32px] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-emerald-500" /> Roadmap de Sonhos
              </h3>
              <button 
                onClick={() => setIsManagingFinanceGoals(true)}
                className="p-2 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
              >
                <Settings size={14} />
              </button>
            </div>
            <div className="space-y-6">
              {goals && goals.length > 0 ? (
                goals.map((goal: any) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-bold text-white">{goal.title}</span>
                        <span className="text-[9px] font-mono text-slate-500">R$ {goal.current.toLocaleString()} / {goal.target.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-600 italic">Nenhuma meta de roadmap definida.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddTransactionModal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        onAdd={onAddTransaction} 
        categories={categories} 
        contacts={contacts} 
        notify={notify}
      />
      <ManageCategoriesModal 
        isOpen={isManagingCats} 
        onClose={() => setIsManagingCats(false)} 
        categories={categories} 
        groupers={groupers} 
        onAdd={onAddCategory} 
        onDelete={onDeleteCategory}
      />
      <ManageGroupersModal 
        isOpen={isManagingGroups} 
        onClose={() => setIsManagingGroups(false)} 
        groupers={groupers} 
        onAdd={onAddGrouper} 
        onDelete={onDeleteGrouper}
      />
      <ManageContactsModal 
        isOpen={isManagingContacts} 
        onClose={() => setIsManagingContacts(false)} 
        contacts={contacts} 
        onAdd={onAddContact} 
        onDelete={onDeleteContact}
      />
      <ManageBudgetsModal 
        isOpen={isManagingBudgets}
        onClose={() => setIsManagingBudgets(false)}
        categories={categories}
        budgets={budgets}
        onAdd={async (data: any) => {
          await fetch('/api/finance/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          onFetchData();
        }}
        onDelete={async (id: string) => {
          await fetch(`/api/finance/budgets/${id}`, { method: 'DELETE' });
          onFetchData();
        }}
      />
      <ManageBusinessGoalsModal 
        isOpen={isManagingBusinessGoals}
        onClose={() => setIsManagingBusinessGoals(false)}
        businessGoals={businessGoals}
        onAdd={async (data: any) => {
          await fetch('/api/finance/business-goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          onFetchData();
        }}
        onUpdate={async (id: string, data: any) => {
          await fetch(`/api/finance/business-goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          onFetchData();
        }}
        onDelete={async (id: string) => {
          await fetch(`/api/finance/business-goals/${id}`, { method: 'DELETE' });
          onFetchData();
        }}
      />
      <ManageFinanceGoalsModal 
        isOpen={isManagingFinanceGoals}
        onClose={() => setIsManagingFinanceGoals(false)}
        goals={goals}
        onAdd={async (data: any) => {
          await fetch('/api/finance/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          onFetchData();
        }}
        onUpdate={async (id: string, data: any) => {
          await fetch(`/api/finance/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          onFetchData();
        }}
        onDelete={async (id: string) => {
          await fetch(`/api/finance/goals/${id}`, { method: 'DELETE' });
          onFetchData();
        }}
      />
      <ResetVerificationModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={onConfirmReset} />
    </motion.div>
  );
}

function ManageBudgetsModal({ isOpen, onClose, categories, budgets, onAdd, onDelete }: any) {
  const [catId, setCatId] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white tracking-tighter">Planejamento de Custos</h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Defina limites mensais para categorias específicas</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] uppercase text-slate-600 font-bold ml-1">Categoria de Despesa</label>
            <select 
              className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white text-xs outline-none focus:border-emerald-500"
              value={catId}
              onChange={e => setCatId(e.target.value)}
            >
              <option value="">Selecionar...</option>
              {categories.filter((c: any) => c.type === 'expense').map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] uppercase text-slate-600 font-bold ml-1">Limite do Orçamento (R$)</label>
            <input 
              type="number"
              placeholder="Ex: 2000"
              className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500 font-mono"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { onAdd({ categoryId: catId, amount: parseFloat(amount) }); setCatId(''); setAmount(''); }}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all font-bold"
          >
            Fixar Orçamento Mensal
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {budgets.map((b: any) => (
            <div key={b.id} className="flex justify-between items-center p-3 border border-slate-900 rounded-xl group/item bg-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-white">{b.categoryName}</span>
                <span className="text-[9px] font-mono text-emerald-500">Limite: R$ {b.amount.toLocaleString()}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(b.id);
                }} 
                className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManageFinanceGoalsModal({ isOpen, onClose, goals, onAdd, onUpdate, onDelete }: any) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const goal = goals.find((g: any) => g.id === editingId);
      if (goal) {
        setTitle(goal.title);
        setTarget(goal.target.toString());
        setDeadline(goal.deadline || '');
      }
    } else {
      setTitle('');
      setTarget('');
      setDeadline('');
    }
  }, [editingId, goals]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const data = { title, target: parseFloat(target), deadline };
    if (editingId) {
      onUpdate(editingId, data);
      setEditingId(null);
    } else {
      onAdd(data);
    }
    setTitle('');
    setTarget('');
    setDeadline('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white tracking-tighter">
            {editingId ? 'Editar Meta' : 'Roadmap de Sonhos'}
          </h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Gerencie suas metas de poupança e investimentos</p>
        </div>
        
        <div className="space-y-4">
          <input 
            placeholder="Título da Meta"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input 
            type="number"
            placeholder="Valor Alvo (R$)"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500 font-mono"
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
          <input 
            type="date"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit}
              className={`flex-1 ${editingId ? 'bg-emerald-500' : 'bg-white text-slate-950'} py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all`}
            >
              {editingId ? 'Salvar Alteração' : 'Criar Nova Meta'}
            </button>
            {editingId && (
              <button 
                onClick={() => setEditingId(null)}
                className="bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all"
              >
                Voltar
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 custom-scrollbar border-t border-slate-900 pt-6">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-4">Suas Metas</span>
          {goals.map((g: any) => (
            <div key={g.id} className="flex justify-between items-center p-4 border border-slate-900 rounded-2xl group/item bg-black/40 hover:border-slate-700 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">{g.title}</span>
                <span className="text-[9px] font-mono text-emerald-500">Alvo: R$ {g.target.toLocaleString()}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                <button 
                  onClick={() => setEditingId(g.id)}
                  className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => onDelete(g.id)}
                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManageBusinessGoalsModal({ isOpen, onClose, businessGoals, onAdd, onUpdate, onDelete }: any) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const goal = businessGoals.find((bg: any) => bg.id === editingId);
      if (goal) {
        setTitle(goal.title);
        setTarget(goal.target.toString());
      }
    } else {
      setTitle('');
      setTarget('');
    }
  }, [editingId, businessGoals]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (editingId) {
      onUpdate(editingId, { title, target: parseFloat(target) });
      setEditingId(null);
    } else {
      onAdd({ title, target: parseFloat(target), type: 'profit_margin' });
    }
    setTitle('');
    setTarget('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white tracking-tighter">
            {editingId ? 'Editar Diretriz' : 'Diretrizes de Negócio'}
          </h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Defina KPIs estratégicos para a saúde da empresa</p>
        </div>
        
        <div className="space-y-4">
          <input 
            placeholder="Ex: Margem de Lucro Anual"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="space-y-1">
            <label className="text-[8px] uppercase text-slate-600 font-bold ml-1">Meta Percentual (%)</label>
            <input 
              type="number"
              placeholder="Ex: 30"
              className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500 font-mono"
              value={target}
              onChange={e => setTarget(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit}
              className={`flex-1 ${editingId ? 'bg-emerald-500' : 'bg-amber-500'} text-slate-950 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all`}
            >
              {editingId ? 'Salvar Alteração' : 'Sincronizar Nova Meta'}
            </button>
            {editingId && (
              <button 
                onClick={() => setEditingId(null)}
                className="bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar border-t border-slate-900 pt-6">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-4">Metas Ativas</span>
          {businessGoals.map((bg: any) => (
            <div key={bg.id} className="flex justify-between items-center p-4 border border-slate-900 rounded-2xl group/item bg-black/40 hover:border-slate-700 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">{bg.title}</span>
                <span className="text-[9px] font-mono text-amber-500">Alvo: {bg.target}%</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                <button 
                  onClick={() => setEditingId(bg.id)}
                  className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => onDelete(bg.id)}
                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {businessGoals.length === 0 && (
            <p className="text-[10px] text-slate-600 italic text-center py-4">Nenhuma meta estratégica definida.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetVerificationModal({ isOpen, onClose, onConfirm }: any) {
  const [phrase, setPhrase] = useState('');
  const TARGET_PHRASE = "Quero reiniciar o modo financeiro";

  if (!isOpen) return null;

  const isCorrect = phrase.trim().toLowerCase() === TARGET_PHRASE.toLowerCase();

  const handleClose = () => {
    setPhrase('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#080808] border-2 border-rose-500/20 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={handleClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-white tracking-tighter">Confirmação de Segurança</h4>
          <p className="text-xs text-slate-500 leading-relaxed italic">Esta ação é irreversível. Todos os dados financeiros serão permanentemente apagados.</p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            Digite: <span className="text-white select-none">{TARGET_PHRASE}</span>
          </p>
          <input 
            placeholder="Digite a frase aqui..."
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-rose-500 transition-all uppercase text-xs"
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            autoFocus
          />
        </div>

        <button 
          disabled={!isCorrect}
          onClick={() => {
            onConfirm();
            setPhrase('');
          }}
          className={`w-full py-5 rounded-[22px] font-bold uppercase text-[10px] tracking-widest transition-all ${isCorrect ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}`}
        >
          Resetar Todo o Histórico
        </button>
      </motion.div>
    </div>
  );
}

function ManageCategoriesModal({ isOpen, onClose, categories, groupers, onAdd, onDelete }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('income');
  const [grouperId, setGrouperId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <h4 className="text-xl font-bold text-white tracking-tighter">Gerenciar Categorias</h4>
        
        <div className="space-y-4">
          <input 
            placeholder="Nome da categoria"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <select 
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
          <select 
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={grouperId}
            onChange={e => setGrouperId(e.target.value)}
          >
            <option value="">Nenhum Agrupador</option>
            {groupers.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button 
            onClick={() => { onAdd({ name, type, grouperId }); setName(''); }}
            className="w-full bg-emerald-500 text-slate-950 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
          >
            Adicionar Categoria
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {categories.map((c: any) => (
            <div key={c.id} className="flex justify-between items-center p-3 border border-slate-900 rounded-xl group/item bg-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-white">{c.name}</span>
                <span className={`text-[8px] font-bold uppercase ${c.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{c.type === 'income' ? 'Receita' : 'Despesa'}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }} 
                className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManageGroupersModal({ isOpen, onClose, groupers, onAdd, onDelete }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('income');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <h4 className="text-xl font-bold text-white tracking-tighter">Gerenciar Agrupadores</h4>
        
        <div className="space-y-4">
          <input 
            placeholder="Nome do agrupador"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <select 
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
          <button 
            onClick={() => { onAdd({ name, type }); setName(''); }}
            className="w-full bg-emerald-500 text-slate-950 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
          >
            Adicionar Agrupador
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {groupers.map((g: any) => (
            <div key={g.id} className="flex justify-between items-center p-3 border border-slate-900 rounded-xl group/item bg-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-white">{g.name}</span>
                <span className={`text-[8px] font-bold uppercase ${g.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{g.type === 'income' ? 'Receita' : 'Despesa'}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(g.id);
                }} 
                className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManageContactsModal({ isOpen, onClose, contacts, onAdd, onDelete }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('client');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <h4 className="text-xl font-bold text-white tracking-tighter">Clientes e Fornecedores</h4>
        
        <div className="space-y-4">
          <input 
            placeholder="Nome do contato"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <select 
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="client">Cliente</option>
            <option value="supplier">Fornecedor</option>
          </select>
          <button 
            onClick={() => { onAdd({ name, type }); setName(''); }}
            className="w-full bg-emerald-500 text-slate-950 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
          >
            Adicionar Contato
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {contacts.map((c: any) => (
            <div key={c.id} className="flex justify-between items-center p-3 border border-slate-900 rounded-xl group/item bg-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-white">{c.name}</span>
                <span className={`text-[8px] font-bold uppercase ${c.type === 'client' ? 'text-emerald-500' : 'text-rose-500'}`}>{c.type === 'client' ? 'Cliente' : 'Fornecedor'}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }} 
                className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddTransactionModal({ isOpen, onClose, onAdd, categories = [], contacts = [], notify }: any) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');

  const filteredCategories = categories.filter((c: any) => c.type === type);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategory(filteredCategories[0].name);
    }
    setContact('');
  }, [type, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#080808] border border-slate-900 w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-900 rounded-full transition-all text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        <h4 className="text-xl font-bold text-white tracking-tighter">Registrar Transação</h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-black border border-slate-900 rounded-2xl">
            <button onClick={() => setType('income')} className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${type === 'income' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}>Entrada</button>
            <button onClick={() => setType('expense')} className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${type === 'expense' ? 'bg-rose-500 text-slate-950' : 'text-slate-500'}`}>Saída</button>
          </div>

          <input 
            placeholder="Descrição da transação"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />

          <input 
            type="number"
            placeholder="Valor (R$)"
            className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white outline-none focus:border-emerald-500 font-mono"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] uppercase text-slate-600 font-bold ml-1">Categoria</label>
              <select 
                className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white text-xs outline-none focus:border-emerald-500"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {filteredCategories.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                {filteredCategories.length === 0 && <option value="">Sem categorias</option>}\
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase text-slate-600 font-bold ml-1">
                {type === 'income' ? 'Cliente' : 'Fornecedor'}
              </label>
              <select 
                className="w-full bg-black border border-slate-900 p-4 rounded-2xl text-white text-xs outline-none focus:border-emerald-500"
                value={contact}
                onChange={e => setContact(e.target.value)}
              >
                <option value="">Nenhum</option>
                {contacts.filter((c: any) => type === 'income' ? c.type === 'client' : c.type === 'supplier').map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            if (!desc || !amount) {
              notify("⚠️ Preencha descrição e valor");
              return;
            }
            if (!contact && contacts.filter((c: any) => type === 'income' ? c.type === 'client' : c.type === 'supplier').length > 0) {
              notify(`⚠️ Selecione um ${type === 'income' ? 'cliente' : 'fornecedor'}`);
              return;
            }
            onAdd({ description: desc, amount: parseFloat(amount), type, category, contact });
            onClose();
            setDesc('');
            setAmount('');
            setContact('');
          }}
          className="w-full bg-white text-slate-950 py-5 rounded-[22px] font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all font-bold"
        >
          Confirmar Lançamento
        </button>
      </motion.div>
    </div>
  );
}

// --- Utilities ---

function NavItem({ icon, label, active = false, onClick, badge }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-transparent relative ${active ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-600 hover:bg-slate-900/50 hover:text-slate-300'}`}>
      <div className={active ? 'text-slate-950' : 'text-emerald-500/40'}>{icon}</div>
      {label}
      {badge && (
        <span className="absolute right-3 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg animate-pulse">
          {badge}
        </span>
      )}
      {active && !badge && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function SettingsView({ stats, financeSettings, onUpdateFinanceSettings }: any) {
  return (
    <div className="space-y-12 pb-20">
      <header>
        <h2 className="text-4xl font-bold text-white tracking-tighter uppercase mb-2">Painel de <span className="text-emerald-500">Configurações</span></h2>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Personalize sua experiência estratégica e financeira</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Settings */}
        <section className="bg-[#0D0D0D] border border-slate-900 rounded-[40px] p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Perfil Professional</h3>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Identidade Visual e Rank</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rank Atual</label>
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl text-white font-bold flex items-center justify-between">
                <span>Elite Strategy Lead</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">Ativo</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nível de Sincronização</label>
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl text-white font-bold flex items-center justify-between font-mono">
                <span>Nível {stats.level}</span>
                <span className="text-slate-500">{stats.xp} XP acumulado</span>
              </div>
            </div>
          </div>
        </section>

        {/* Finance Settings */}
        <section className="bg-[#0D0D0D] border border-slate-900 rounded-[40px] p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Motor Financeiro</h3>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Algoritmo de Destinação de Lucro</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Porcentagem de Poupança</label>
                <span className="text-2xl font-bold text-emerald-500 font-mono">{financeSettings.savingsPercentage}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={financeSettings.savingsPercentage} 
                onChange={(e) => onUpdateFinanceSettings({ savingsPercentage: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-800"
              />
              <p className="text-[10px] text-slate-600 leading-relaxed font-mono italic">
                * Este percentual define automaticamente qt. do lucro líquido será alocado para suas metas no roadmap financeiro.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* System Status */}
      <section className="bg-[#0D0D0D] border border-slate-900 rounded-[40px] p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Status do Sistema</h3>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Infraestrutura Syncro_</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/50 border border-slate-900 p-6 rounded-3xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Versão</span>
            <span className="text-white font-mono font-bold">2.4.0-Stable</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 p-6 rounded-3xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Latência API</span>
            <span className="text-white font-mono font-bold">14ms</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 p-6 rounded-3xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Criptografia</span>
            <span className="text-emerald-500 font-mono font-bold uppercase">AES-256-GCM</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub, icon, isLoss = false }: any) {
  return (
    <div className={`border rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 shadow-2xl relative overflow-hidden group ${
      isLoss 
        ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)] animate-pulse' 
        : 'bg-[#0D0D0D] border-slate-900 hover:border-emerald-500/30'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isLoss ? 'text-rose-500' : 'text-slate-600'}`}>{label}</span>
        <div className={`transition-opacity ${isLoss ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
          {isLoss ? <TrendingUp size={20} className="text-rose-500 rotate-180" /> : icon}
        </div>
      </div>
      <div className="text-white">
        <span className={`text-3xl font-bold tracking-tighter ${isLoss ? 'text-rose-400' : ''}`}>{value}</span>
        {sub && <p className={`text-[10px] mt-2 uppercase tracking-tighter font-mono ${isLoss ? 'text-rose-500/70 font-bold' : 'text-slate-600'}`}>{sub}</p>}
      </div>
    </div>
  );
}
