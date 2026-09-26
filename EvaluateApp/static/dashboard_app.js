/**
 * ZENITH STUDENT DASHBOARD — MAIN APPLICATION LOGIC
 * High-performance, offline-ready, accessible, modular JavaScript engine.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'zenith_student_dashboard_v1';

  // --- INITIAL SAMPLE DATA ---
  const DEFAULT_DATA = {
    student: {
      name: 'Meghana',
      streakDays: 5,
      lastActiveDate: '2026-09-26'
    },
    settings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakInterval: 4,
      soundEnabled: true,
      theme: 'light'
    },
    tasks: [
      {
        id: 't-1',
        title: 'Implement Dijkstra & Bellman-Ford Shortest Path Algorithms',
        subject: 'Computer Science',
        priority: 'urgent',
        dueDate: '2026-09-27',
        completed: false,
        pomoEstimated: 3,
        pomoCompleted: 1,
        notes: 'Include test graphs with directed and undirected weighted edges.'
      },
      {
        id: 't-2',
        title: 'Read Organic Chemistry: Reaction Mechanisms in Ch. 12',
        subject: 'Chemistry',
        priority: 'high',
        dueDate: '2026-09-28',
        completed: false,
        pomoEstimated: 2,
        pomoCompleted: 0,
        notes: 'Pay special attention to SN1 vs SN2 nucleophilic substitutions.'
      },
      {
        id: 't-3',
        title: 'Submit Analytical Essay on The Industrial Revolution',
        subject: 'World History',
        priority: 'medium',
        dueDate: '2026-09-30',
        completed: false,
        pomoEstimated: 4,
        pomoCompleted: 2,
        notes: 'Double check Chicago manual of style citations.'
      },
      {
        id: 't-4',
        title: "Calculus III Problem Set: Vector Fields & Green's Theorem",
        subject: 'Mathematics',
        priority: 'urgent',
        dueDate: '2026-09-26',
        completed: true,
        completedAt: '2026-09-26T14:30:00',
        pomoEstimated: 2,
        pomoCompleted: 2,
        notes: 'All 10 problems completed and verified.'
      },
      {
        id: 't-5',
        title: 'Create Visual Slides for Machine Learning Group Presentation',
        subject: 'Computer Science',
        priority: 'medium',
        dueDate: '2026-10-02',
        completed: false,
        pomoEstimated: 3,
        pomoCompleted: 0,
        notes: 'Need slides on Convolutional Neural Networks and Transfer Learning.'
      },
      {
        id: 't-6',
        title: 'Review Biology Flashcards on Cellular Respiration & ATP Cycle',
        subject: 'Biology',
        priority: 'low',
        dueDate: '2026-09-29',
        completed: true,
        completedAt: '2026-09-25T16:15:00',
        pomoEstimated: 1,
        pomoCompleted: 1,
        notes: 'Scored 94% on Quizlet flashcard set.'
      }
    ],
    notes: [
      {
        id: 'n-1',
        title: 'Data Structures: Graph Traversal Cheat Sheet',
        subject: 'Computer Science',
        tags: ['algorithms', 'graphs', 'cheatsheet'],
        pinned: true,
        updatedAt: '2026-09-26T15:20:00',
        content: `### Graph Traversal Overview

#### 1. Breadth-First Search (BFS)
- **Data Structure**: Queue (FIFO)
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Best for**: Shortest path in unweighted graphs, level-order traversal.

#### 2. Depth-First Search (DFS)
- **Data Structure**: Stack / Recursion
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Best for**: Cycle detection, topological sorting, finding connected components.

> **Key Rule:** Always mark vertices as visited upon discovery to avoid infinite loops!`
      },
      {
        id: 'n-2',
        title: "Calculus: Green's Theorem & Line Integrals Formula Reference",
        subject: 'Mathematics',
        tags: ['calculus', 'formulas', 'exam-prep'],
        pinned: true,
        updatedAt: '2026-09-25T11:45:00',
        content: `### Green's Theorem

Let C be a positively oriented, piecewise smooth simple closed curve, bounding region D:

∮_C (L dx + M dy) = ∬_D (∂M/∂x - ∂L/∂y) dA

#### Quick Checklist:
- Check orientation: Counterclockwise is positive.
- If clockwise, multiply integral by -1.
- Ensure partial derivatives ∂M/∂x and ∂L/∂y are continuous across region D.`
      },
      {
        id: 'n-3',
        title: 'Weekly Study Routine & High-Yield Habits',
        subject: 'General',
        tags: ['routine', 'productivity', 'habits'],
        pinned: false,
        updatedAt: '2026-09-24T09:15:00',
        content: `### Golden Study Principles

1. **Deep Work Blocks**: 2x 50-min or 4x 25-min Pomodoros early in the morning before emails/social media.
2. **Active Recall**: Test knowledge with book closed rather than passive re-reading.
3. **Spaced Repetition**: Revisit difficult questions at intervals of 1, 3, and 7 days.
4. **Evening Shutdown**: Write down tomorrow's Top 3 Most Important Tasks (MITs) before bed.`
      }
    ],
    history: [
      { day: 'Mon', date: '2026-09-21', focusMinutes: 125, sessions: 5, tasksDone: 3 },
      { day: 'Tue', date: '2026-09-22', focusMinutes: 150, sessions: 6, tasksDone: 2 },
      { day: 'Wed', date: '2026-09-23', focusMinutes: 90, sessions: 3, tasksDone: 2 },
      { day: 'Thu', date: '2026-09-24', focusMinutes: 175, sessions: 7, tasksDone: 4 },
      { day: 'Fri', date: '2026-09-25', focusMinutes: 130, sessions: 5, tasksDone: 3 },
      { day: 'Sat', date: '2026-09-26', focusMinutes: 80, sessions: 3, tasksDone: 2 },
      { day: 'Sun', date: '2026-09-27', focusMinutes: 100, sessions: 4, tasksDone: 2 }
    ],
    milestones: [
      { id: 'm-1', name: 'First Step', desc: 'Completed your very first task', icon: '🎯', target: 1, type: 'tasks' },
      { id: 'm-2', name: 'Focus Initiate', desc: 'Complete 10 Pomodoro sessions', icon: '⏱️', target: 10, type: 'sessions' },
      { id: 'm-3', name: 'Deep Diver', desc: 'Log over 10 hours (600 mins) of focus', icon: '🌊', target: 600, type: 'minutes' },
      { id: 'm-4', name: 'Consistency Star', desc: 'Maintain a 5-day study streak', icon: '🔥', target: 5, type: 'streak' },
      { id: 'm-5', name: 'Task Master', desc: 'Complete 15 study tasks', icon: '🏆', target: 15, type: 'tasks' },
      { id: 'm-6', name: 'Note Architect', desc: 'Write and organize 5 detailed study notes', icon: '📝', target: 5, type: 'notes' }
    ]
  };

  const MOTIVATIONAL_QUOTES = [
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
    { text: "Focus is a muscle. The more you practice single-tasking, the stronger it gets.", author: "Cal Newport" },
    { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
  ];

  // --- STATE CONTAINER ---
  let appState = {};

  // --- TIMER RUNTIME STATE ---
  let timerInterval = null;
  let timerMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
  let timerTimeLeft = 25 * 60;
  let timerTotalTime = 25 * 60;
  let timerIsRunning = false;
  let timerCurrentRound = 1; // 1 to 4
  let timerLinkedTask = null;

  // --- SOUND SYNTHESIZER (Web Audio API) ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChime(isBreak = false) {
    if (!appState.settings.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Create primary harmonic tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isBreak) {
        // Cheerful ascending chime
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc2.frequency.setValueAtTime(880.00, now + 0.15); // A5
      } else {
        // Deep peaceful meditation singing bowl chime
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now); // E5
      }

      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.7);
      osc2.stop(now + 1.7);
    } catch (e) {
      console.warn('Audio chime playback omitted:', e);
    }
  }

  // --- LOCAL STORAGE HELPERS ---
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        appState = JSON.parse(stored);
        // Ensure defaults for any newly added structure
        if (!appState.settings) appState.settings = { ...DEFAULT_DATA.settings };
        if (!appState.tasks) appState.tasks = [...DEFAULT_DATA.tasks];
        if (!appState.notes) appState.notes = [...DEFAULT_DATA.notes];
        if (!appState.history) appState.history = [...DEFAULT_DATA.history];
        if (!appState.milestones) appState.milestones = [...DEFAULT_DATA.milestones];
      } else {
        appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
        saveState();
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, icon = '✓') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span style="font-size:16px;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // --- NAVIGATION CONTROLLER ---
  function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    function switchView(targetViewId) {
      navItems.forEach(item => {
        const isActive = item.dataset.target === targetViewId;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      sections.forEach(sec => {
        sec.classList.toggle('active', sec.id === targetViewId);
      });

      // Close mobile sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');

      // Scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Refresh view-specific displays
      if (targetViewId === 'view-tasks') renderTasks();
      if (targetViewId === 'view-notes') renderNotesList();
      if (targetViewId === 'view-progress') renderProgressCharts();
      if (targetViewId === 'view-overview') renderOverview();
    }

    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) switchView(target);
      });
    });

    // Mobile sidebar toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    if (sidebarCloseBtn && sidebar) {
      sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
      });
    }

    // Expose programmatic view switcher
    window.navigateTo = switchView;
  }

  // --- THEME & ACCESSIBILITY CONTROLLER ---
  function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = appState.settings.theme || 'light';
    applyTheme(currentTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = appState.settings.theme === 'dark' ? 'light' : 'dark';
        appState.settings.theme = nextTheme;
        saveState();
        applyTheme(nextTheme);
        showToast(nextTheme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled', '🌓');
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  // --- MOTIVATIONAL QUOTES ---
  function initQuotes() {
    const quoteText = document.getElementById('mantra-quote-text');
    const quoteAuthor = document.getElementById('mantra-quote-author');
    const refreshBtn = document.getElementById('mantra-refresh-btn');

    function displayRandomQuote() {
      const q = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      if (quoteText) quoteText.textContent = `"${q.text}"`;
      if (quoteAuthor) quoteAuthor.textContent = `— ${q.author}`;
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', displayRandomQuote);
    }
    displayRandomQuote();
  }

  // --- 1. OVERVIEW DASHBOARD VIEW ---
  function renderOverview() {
    // 1. Calculate today metrics
    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const todayLog = appState.history[appState.history.length - 1] || { focusMinutes: 0, sessions: 0 };
    const todayHours = (todayLog.focusMinutes / 60).toFixed(1);

    // Update Overview Stats
    const ovTodayFocus = document.getElementById('ov-stat-focus');
    const ovTasksCompleted = document.getElementById('ov-stat-tasks');
    const ovStreak = document.getElementById('ov-stat-streak');
    const ovSessions = document.getElementById('ov-stat-sessions');

    if (ovTodayFocus) ovTodayFocus.textContent = `${todayLog.focusMinutes}m`;
    if (ovTasksCompleted) ovTasksCompleted.textContent = `${completedTasks} / ${totalTasks}`;
    if (ovStreak) ovStreak.textContent = `${appState.student.streakDays} Days`;
    if (ovSessions) ovSessions.textContent = `${todayLog.sessions}`;

    // Update Sidebar Badges
    const badgeTasks = document.getElementById('sidebar-badge-tasks');
    if (badgeTasks) badgeTasks.textContent = pendingTasks;
    const streakDisplay = document.getElementById('sidebar-streak-count');
    if (streakDisplay) streakDisplay.textContent = `${appState.student.streakDays} Day Streak`;

    // Overview Priority Tasks List (Limit to top 3 active)
    const priorityContainer = document.getElementById('overview-priority-tasks');
    if (priorityContainer) {
      const activeTasks = appState.tasks.filter(t => !t.completed).slice(0, 3);
      if (activeTasks.length === 0) {
        priorityContainer.innerHTML = `
          <div class="empty-state" style="padding:20px;">
            <div style="font-size:24px;">🎉</div>
            <div class="empty-title">All tasks completed!</div>
            <div class="empty-subtitle">Great job staying on top of your coursework.</div>
          </div>
        `;
      } else {
        priorityContainer.innerHTML = activeTasks.map(t => createTaskItemHTML(t)).join('');
        attachTaskEvents(priorityContainer);
      }
    }

    // Overview Recent Note
    const recentNoteBox = document.getElementById('overview-recent-note');
    if (recentNoteBox && appState.notes.length > 0) {
      const n = appState.notes[0];
      recentNoteBox.innerHTML = `
        <div style="cursor:pointer;" onclick="navigateTo('view-notes'); selectNote('${n.id}');">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span class="subject-tag">${n.subject}</span>
            <span style="font-size:11.5px; color:var(--text-muted);">${formatRelativeTime(n.updatedAt)}</span>
          </div>
          <h4 style="font-size:15px; font-weight:700; color:var(--text-main); margin-bottom:4px;">${escapeHTML(n.title)}</h4>
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
            ${escapeHTML(n.content.replace(/^[#\-*`> ]+/gm, ''))}
          </p>
        </div>
      `;
    }
  }

  // --- 2. TASKS CONTROLLER ---
  let currentTaskFilter = 'all'; // 'all', 'active', 'completed', 'today', 'overdue'
  let currentSubjectFilter = 'all';
  let currentSortBy = 'dueDate';
  let currentSearchQuery = '';

  function initTasks() {
    // Filter status buttons
    const filterTabs = document.querySelectorAll('.task-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTaskFilter = tab.dataset.filter;
        renderTasks();
      });
    });

    // Subject dropdown
    const subjectSelect = document.getElementById('tasks-subject-select');
    if (subjectSelect) {
      subjectSelect.addEventListener('change', (e) => {
        currentSubjectFilter = e.target.value;
        renderTasks();
      });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('tasks-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        renderTasks();
      });
    }

    // Search input
    const searchInput = document.getElementById('tasks-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        renderTasks();
      });
    }

    // Quick Add Bar
    const quickAddForm = document.getElementById('quick-add-task-form');
    const quickAddInput = document.getElementById('quick-add-input');
    if (quickAddForm && quickAddInput) {
      quickAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = quickAddInput.value.trim();
        if (!text) return;

        const newTask = {
          id: 't-' + Date.now(),
          title: text,
          subject: 'General',
          priority: 'medium',
          dueDate: getTodayDateString(),
          completed: false,
          pomoEstimated: 1,
          pomoCompleted: 0,
          notes: ''
        };

        appState.tasks.unshift(newTask);
        saveState();
        quickAddInput.value = '';
        renderTasks();
        renderOverview();
        showToast('Task added successfully', '✓');
      });
    }

    // Modal Add / Edit Task
    initTaskModal();
    renderTasks();
  }

  function getTodayDateString() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderTasks() {
    const container = document.getElementById('tasks-list-container');
    if (!container) return;

    // Populate dynamic subjects in filter dropdown
    populateSubjectDropdown();

    let filtered = appState.tasks.filter(task => {
      // 1. Status Filter
      const todayStr = getTodayDateString();
      if (currentTaskFilter === 'active' && task.completed) return false;
      if (currentTaskFilter === 'completed' && !task.completed) return false;
      if (currentTaskFilter === 'today' && task.dueDate !== todayStr) return false;
      if (currentTaskFilter === 'overdue' && (task.completed || task.dueDate >= todayStr)) return false;

      // 2. Subject Filter
      if (currentSubjectFilter !== 'all' && task.subject !== currentSubjectFilter) return false;

      // 3. Search Query
      if (currentSearchQuery) {
        const matchTitle = task.title.toLowerCase().includes(currentSearchQuery);
        const matchSubj = task.subject.toLowerCase().includes(currentSearchQuery);
        const matchNotes = (task.notes || '').toLowerCase().includes(currentSearchQuery);
        if (!matchTitle && !matchSubj && !matchNotes) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (currentSortBy === 'dueDate') {
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      }
      if (currentSortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      if (currentSortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No tasks found</div>
          <div class="empty-subtitle">Try adjusting your search query or filters, or add a new study goal above.</div>
          <button class="btn-primary" onclick="openTaskModal()">+ Add New Task</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => createTaskItemHTML(t)).join('');
    attachTaskEvents(container);

    // Update task counter pills
    const taskCountEl = document.getElementById('tasks-total-count');
    if (taskCountEl) {
      const activeCount = appState.tasks.filter(t => !t.completed).length;
      taskCountEl.textContent = `${activeCount} pending`;
    }
  }

  function populateSubjectDropdown() {
    const subjectSelect = document.getElementById('tasks-subject-select');
    if (!subjectSelect) return;

    const subjects = Array.from(new Set(appState.tasks.map(t => t.subject).filter(Boolean)));
    const curVal = subjectSelect.value;

    let options = `<option value="all">All Subjects</option>`;
    subjects.forEach(s => {
      options += `<option value="${escapeHTML(s)}" ${s === curVal ? 'selected' : ''}>${escapeHTML(s)}</option>`;
    });
    subjectSelect.innerHTML = options;
  }

  function createTaskItemHTML(task) {
    const todayStr = getTodayDateString();
    let dueClass = '';
    let dueLabel = task.dueDate || 'No Date';

    if (task.dueDate) {
      if (!task.completed && task.dueDate < todayStr) {
        dueClass = 'overdue';
        dueLabel = `Overdue: ${task.dueDate}`;
      } else if (task.dueDate === todayStr) {
        dueClass = 'today';
        dueLabel = 'Due Today';
      } else {
        dueLabel = `Due ${task.dueDate}`;
      }
    }

    return `
      <div class="task-item-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-left">
          <button class="task-checkbox-btn" aria-label="${task.completed ? 'Mark task incomplete' : 'Mark task complete'}">
            <svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <div class="task-body">
            <div class="task-title">${escapeHTML(task.title)}</div>
            <div class="task-meta-row">
              <span class="subject-tag">${escapeHTML(task.subject || 'General')}</span>
              <span class="priority-badge priority-${task.priority || 'medium'}">
                <span class="dot"></span>
                <span>${capitalize(task.priority || 'medium')}</span>
              </span>
              <span class="task-due-date ${dueClass}">
                📅 ${dueLabel}
              </span>
              <span class="task-pomo-count" title="${task.pomoCompleted || 0} of ${task.pomoEstimated || 1} Pomodoros logged">
                ⏱️ ${task.pomoCompleted || 0}/${task.pomoEstimated || 1} Pomo
              </span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn pomo-start" title="Focus on this task in Pomodoro" aria-label="Start Pomodoro for this task">
            🎯
          </button>
          <button class="task-action-btn edit" title="Edit task" aria-label="Edit task">
            ✏️
          </button>
          <button class="task-action-btn delete" title="Delete task" aria-label="Delete task">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  function attachTaskEvents(container) {
    // Checkbox toggle
    container.querySelectorAll('.task-checkbox-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.task-item-card');
        if (!card) return;
        const taskId = card.dataset.id;
        toggleTaskComplete(taskId);
      });
    });

    // Edit task
    container.querySelectorAll('.task-action-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.task-item-card');
        if (!card) return;
        const taskId = card.dataset.id;
        openTaskModal(taskId);
      });
    });

    // Delete task
    container.querySelectorAll('.task-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.task-item-card');
        if (!card) return;
        const taskId = card.dataset.id;
        deleteTask(taskId);
      });
    });

    // Link & Focus in Pomodoro
    container.querySelectorAll('.task-action-btn.pomo-start').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.task-item-card');
        if (!card) return;
        const taskId = card.dataset.id;
        const task = appState.tasks.find(t => t.id === taskId);
        if (task) {
          timerLinkedTask = task;
          updateAttachedTaskUI();
          window.navigateTo('view-pomodoro');
          showToast(`Linked Pomodoro to "${task.title}"`, '🎯');
        }
      });
    });
  }

  function toggleTaskComplete(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) {
      task.completedAt = new Date().toISOString();
      showToast(`Completed "${task.title}"! 🎉`, '✓');

      // Update today's history log
      const todayStr = getTodayDateString();
      let todayLog = appState.history.find(h => h.date === todayStr);
      if (!todayLog) {
        todayLog = { day: 'Today', date: todayStr, focusMinutes: 0, sessions: 0, tasksDone: 0 };
        appState.history.push(todayLog);
      }
      todayLog.tasksDone = (todayLog.tasksDone || 0) + 1;

      checkMilestones();
    } else {
      delete task.completedAt;
    }

    saveState();
    renderTasks();
    renderOverview();
    renderProgressCharts();
  }

  function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveState();
    renderTasks();
    renderOverview();
    renderProgressCharts();
    showToast('Task removed', '🗑️');
  }

  // --- TASK MODAL (ADD / EDIT) ---
  let editingTaskId = null;

  function initTaskModal() {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-modal-form');
    const closeBtn = document.getElementById('task-modal-close');
    const cancelBtn = document.getElementById('task-modal-cancel');
    const openAddBtn = document.getElementById('open-add-task-btn');

    if (openAddBtn) {
      openAddBtn.addEventListener('click', () => openTaskModal());
    }

    function closeModal() {
      if (modal) modal.classList.remove('active');
      editingTaskId = null;
      if (form) form.reset();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-input-title').value.trim();
        const subject = document.getElementById('task-input-subject').value.trim() || 'General';
        const priority = document.getElementById('task-input-priority').value;
        const dueDate = document.getElementById('task-input-due').value;
        const pomo = parseInt(document.getElementById('task-input-pomo').value, 10) || 1;
        const notes = document.getElementById('task-input-notes').value.trim();

        if (!title) return;

        if (editingTaskId) {
          // Edit existing
          const t = appState.tasks.find(item => item.id === editingTaskId);
          if (t) {
            t.title = title;
            t.subject = subject;
            t.priority = priority;
            t.dueDate = dueDate;
            t.pomoEstimated = pomo;
            t.notes = notes;
            showToast('Task updated successfully', '✓');
          }
        } else {
          // Create new
          const newTask = {
            id: 't-' + Date.now(),
            title,
            subject,
            priority,
            dueDate: dueDate || getTodayDateString(),
            completed: false,
            pomoEstimated: pomo,
            pomoCompleted: 0,
            notes
          };
          appState.tasks.unshift(newTask);
          showToast('New task added', '✓');
        }

        saveState();
        closeModal();
        renderTasks();
        renderOverview();
      });
    }

    window.openTaskModal = function (taskId = null) {
      editingTaskId = taskId;
      const modalTitle = document.getElementById('task-modal-title');
      const submitBtn = document.getElementById('task-modal-submit');

      if (taskId) {
        const t = appState.tasks.find(item => item.id === taskId);
        if (!t) return;
        if (modalTitle) modalTitle.textContent = 'Edit Task';
        if (submitBtn) submitBtn.textContent = 'Save Changes';

        document.getElementById('task-input-title').value = t.title;
        document.getElementById('task-input-subject').value = t.subject || 'General';
        document.getElementById('task-input-priority').value = t.priority || 'medium';
        document.getElementById('task-input-due').value = t.dueDate || '';
        document.getElementById('task-input-pomo').value = t.pomoEstimated || 1;
        document.getElementById('task-input-notes').value = t.notes || '';
      } else {
        if (modalTitle) modalTitle.textContent = 'Add New Task';
        if (submitBtn) submitBtn.textContent = 'Create Task';
        if (form) form.reset();
        document.getElementById('task-input-due').value = getTodayDateString();
      }

      if (modal) modal.classList.add('active');
      document.getElementById('task-input-title').focus();
    };
  }

  // --- 3. POMODORO TIMER CONTROLLER ---
  function initPomodoro() {
    timerTimeLeft = appState.settings.focusMinutes * 60;
    timerTotalTime = timerTimeLeft;

    // Mode Buttons
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        switchTimerMode(mode);
      });
    });

    // Control Buttons
    const startPauseBtn = document.getElementById('btn-timer-toggle');
    const resetBtn = document.getElementById('btn-timer-reset');
    const skipBtn = document.getElementById('btn-timer-skip');
    const soundToggleBtn = document.getElementById('btn-timer-sound');

    if (startPauseBtn) startPauseBtn.addEventListener('click', toggleTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (skipBtn) skipBtn.addEventListener('click', skipTimer);

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        appState.settings.soundEnabled = !appState.settings.soundEnabled;
        saveState();
        updateSoundButtonUI();
        showToast(appState.settings.soundEnabled ? 'Chime sound enabled' : 'Chime sound muted', '🔔');
        if (appState.settings.soundEnabled) playChime();
      });
    }

    // Quick Timer Settings Form
    const settingsForm = document.getElementById('timer-settings-form');
    if (settingsForm) {
      // Pre-fill inputs
      document.getElementById('setting-focus-min').value = appState.settings.focusMinutes;
      document.getElementById('setting-short-min').value = appState.settings.shortBreakMinutes;
      document.getElementById('setting-long-min').value = appState.settings.longBreakMinutes;

      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = parseInt(document.getElementById('setting-focus-min').value, 10);
        const s = parseInt(document.getElementById('setting-short-min').value, 10);
        const l = parseInt(document.getElementById('setting-long-min').value, 10);

        if (f > 0 && s > 0 && l > 0) {
          appState.settings.focusMinutes = f;
          appState.settings.shortBreakMinutes = s;
          appState.settings.longBreakMinutes = l;
          saveState();
          switchTimerMode(timerMode, true);
          showToast('Timer settings updated', '⏱️');
        }
      });
    }

    updateTimerDisplay();
    updateRoundsUI();
    updateSoundButtonUI();
  }

  function switchTimerMode(mode, forceReset = false) {
    if (timerIsRunning && !forceReset) {
      if (!confirm('A timer is currently running. Switch modes and reset?')) return;
    }

    clearInterval(timerInterval);
    timerIsRunning = false;
    timerMode = mode;

    let minutes = appState.settings.focusMinutes;
    if (mode === 'shortBreak') minutes = appState.settings.shortBreakMinutes;
    if (mode === 'longBreak') minutes = appState.settings.longBreakMinutes;

    timerTimeLeft = minutes * 60;
    timerTotalTime = timerTimeLeft;

    // Update Mode Tabs UI
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update Status Text
    const statusText = document.getElementById('timer-status-text');
    if (statusText) {
      if (mode === 'focus') statusText.textContent = 'Focus Session';
      if (mode === 'shortBreak') statusText.textContent = 'Short Break';
      if (mode === 'longBreak') statusText.textContent = 'Long Rest & Recharge';
    }

    // Change circle stroke color theme
    const progressCircle = document.getElementById('timer-progress-circle');
    if (progressCircle) {
      if (mode === 'focus') progressCircle.style.stroke = 'var(--primary)';
      if (mode === 'shortBreak') progressCircle.style.stroke = 'var(--teal)';
      if (mode === 'longBreak') progressCircle.style.stroke = 'var(--sage)';
    }

    updateTimerToggleIcon();
    updateTimerDisplay();
  }

  function toggleTimer() {
    if (timerIsRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    getAudioContext(); // Initialize audio context on first user gesture
    timerIsRunning = true;
    updateTimerToggleIcon();

    timerInterval = setInterval(() => {
      if (timerTimeLeft > 0) {
        timerTimeLeft--;
        updateTimerDisplay();
      } else {
        handleTimerComplete();
      }
    }, 1000);
  }

  function pauseTimer() {
    timerIsRunning = false;
    clearInterval(timerInterval);
    updateTimerToggleIcon();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerIsRunning = false;
    switchTimerMode(timerMode, true);
    showToast('Timer reset', '🔄');
  }

  function skipTimer() {
    clearInterval(timerInterval);
    timerIsRunning = false;
    if (timerMode === 'focus') {
      advanceAfterFocus();
    } else {
      switchTimerMode('focus', true);
    }
    showToast('Phase skipped', '⏭️');
  }

  function handleTimerComplete() {
    clearInterval(timerInterval);
    timerIsRunning = false;

    if (timerMode === 'focus') {
      playChime(false);
      logCompletedFocusSession();
      advanceAfterFocus();
      showToast('Focus session complete! Time for a well-deserved break! 🎉', '🔔');
    } else {
      playChime(true);
      switchTimerMode('focus', true);
      showToast('Break finished! Ready to dive into the next focus block?', '🎯');
    }
  }

  function advanceAfterFocus() {
    timerCurrentRound++;
    if (timerCurrentRound > appState.settings.longBreakInterval) {
      timerCurrentRound = 1;
      switchTimerMode('longBreak', true);
    } else {
      switchTimerMode('shortBreak', true);
    }
    updateRoundsUI();
  }

  function logCompletedFocusSession() {
    const focusMins = appState.settings.focusMinutes;
    const todayStr = getTodayDateString();

    let todayLog = appState.history.find(h => h.date === todayStr);
    if (!todayLog) {
      todayLog = { day: 'Today', date: todayStr, focusMinutes: 0, sessions: 0, tasksDone: 0 };
      appState.history.push(todayLog);
    }
    todayLog.focusMinutes = (todayLog.focusMinutes || 0) + focusMins;
    todayLog.sessions = (todayLog.sessions || 0) + 1;

    // If attached to a specific task, increment task pomo count
    if (timerLinkedTask) {
      const liveTask = appState.tasks.find(t => t.id === timerLinkedTask.id);
      if (liveTask) {
        liveTask.pomoCompleted = (liveTask.pomoCompleted || 0) + 1;
        renderTasks();
      }
    }

    saveState();
    checkMilestones();
    renderOverview();
    renderProgressCharts();
  }

  function updateTimerDisplay() {
    const m = Math.floor(timerTimeLeft / 60);
    const s = timerTimeLeft % 60;
    const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const display = document.getElementById('timer-digital-display');
    if (display) display.textContent = timeFormatted;

    // Update document title for background multitasking
    document.title = `(${timeFormatted}) ${capitalize(timerMode)} · Student Dashboard`;

    // Update Circular Progress SVG
    const circle = document.getElementById('timer-progress-circle');
    if (circle) {
      const circumference = 2 * Math.PI * 125; // 785.4
      const progress = timerTimeLeft / timerTotalTime;
      const offset = circumference * (1 - progress);
      circle.style.strokeDashoffset = offset;
    }
  }

  function updateTimerToggleIcon() {
    const icon = document.getElementById('timer-toggle-icon');
    const btn = document.getElementById('btn-timer-toggle');
    if (icon) {
      icon.textContent = timerIsRunning ? '⏸' : '▶';
    }
    if (btn) {
      btn.setAttribute('aria-label', timerIsRunning ? 'Pause Pomodoro Timer' : 'Start Pomodoro Timer');
    }
  }

  function updateRoundsUI() {
    const dotsContainer = document.getElementById('timer-rounds-dots');
    const countDisplay = document.getElementById('timer-sessions-count');

    if (dotsContainer) {
      let dotsHtml = '';
      for (let i = 1; i <= appState.settings.longBreakInterval; i++) {
        let cls = 'round-dot';
        if (i < timerCurrentRound) cls += ' completed';
        if (i === timerCurrentRound) cls += ' current';
        dotsHtml += `<div class="${cls}" title="Session ${i} of ${appState.settings.longBreakInterval}"></div>`;
      }
      dotsContainer.innerHTML = dotsHtml;
    }

    const todayLog = appState.history.find(h => h.date === getTodayDateString());
    if (countDisplay) {
      countDisplay.textContent = todayLog ? todayLog.sessions : 0;
    }
  }

  function updateSoundButtonUI() {
    const btn = document.getElementById('btn-timer-sound');
    if (btn) {
      btn.textContent = appState.settings.soundEnabled ? '🔔' : '🔕';
      btn.title = appState.settings.soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound';
    }
  }

  function updateAttachedTaskUI() {
    const banner = document.getElementById('timer-attached-banner');
    const taskNameSpan = document.getElementById('timer-attached-name');
    if (banner && taskNameSpan) {
      if (timerLinkedTask) {
        banner.style.display = 'inline-flex';
        taskNameSpan.textContent = timerLinkedTask.title;
      } else {
        banner.style.display = 'none';
      }
    }
  }

  window.clearAttachedTask = function () {
    timerLinkedTask = null;
    updateAttachedTaskUI();
    showToast('Unlinked task from timer', 'ℹ️');
  };

  // --- 4. NOTES CONTROLLER ---
  let selectedNoteId = null;
  let activeTagFilter = 'all';
  let noteSearchQuery = '';
  let noteAutoSaveTimer = null;

  function initNotes() {
    renderNotesTags();
    renderNotesList();

    // Search Notes
    const searchInput = document.getElementById('notes-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        noteSearchQuery = e.target.value.toLowerCase().trim();
        renderNotesList();
      });
    }

    // New Note Button
    const newNoteBtn = document.getElementById('btn-new-note');
    if (newNoteBtn) {
      newNoteBtn.addEventListener('click', createNewBlankNote);
    }

    // Editor Auto-save on Title, Subject, Content
    const titleInput = document.getElementById('editor-note-title');
    const subjectInput = document.getElementById('editor-note-subject');
    const textarea = document.getElementById('editor-textarea');

    [titleInput, subjectInput, textarea].forEach(el => {
      if (el) {
        el.addEventListener('input', scheduleAutoSave);
      }
    });

    // Formatting Toolbar Buttons
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        applyMarkdownFormat(action);
      });
    });

    // Note actions: Pin, Delete, Download
    const pinBtn = document.getElementById('btn-note-pin');
    const deleteBtn = document.getElementById('btn-note-delete');
    const exportBtn = document.getElementById('btn-note-export');

    if (pinBtn) pinBtn.addEventListener('click', togglePinSelectedNote);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteSelectedNote);
    if (exportBtn) exportBtn.addEventListener('click', exportSelectedNote);

    // Select first note if available
    if (appState.notes.length > 0) {
      selectNote(appState.notes[0].id);
    }
  }

  function renderNotesTags() {
    const container = document.getElementById('notes-tags-bar');
    if (!container) return;

    // Collect all tags
    const allTags = new Set();
    appState.notes.forEach(n => {
      if (n.tags) n.tags.forEach(t => allTags.add(t));
      if (n.subject) allTags.add(n.subject.toLowerCase());
    });

    let html = `<button class="notes-tag-pill ${activeTagFilter === 'all' ? 'active' : ''}" data-tag="all">All Notes</button>`;
    allTags.forEach(tag => {
      html += `<button class="notes-tag-pill ${activeTagFilter === tag ? 'active' : ''}" data-tag="${escapeHTML(tag)}">#${escapeHTML(tag)}</button>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.notes-tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.notes-tag-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeTagFilter = pill.dataset.tag;
        renderNotesList();
      });
    });
  }

  function renderNotesList() {
    const list = document.getElementById('notes-items-list');
    if (!list) return;

    let filtered = appState.notes.filter(note => {
      // 1. Tag / Subject filter
      if (activeTagFilter !== 'all') {
        const matchesTag = note.tags && note.tags.includes(activeTagFilter);
        const matchesSubj = note.subject && note.subject.toLowerCase() === activeTagFilter;
        if (!matchesTag && !matchesSubj) return false;
      }
      // 2. Search query
      if (noteSearchQuery) {
        const matchTitle = note.title.toLowerCase().includes(noteSearchQuery);
        const matchContent = note.content.toLowerCase().includes(noteSearchQuery);
        if (!matchTitle && !matchContent) return false;
      }
      return true;
    });

    // Pinned notes first, then latest updated
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px;">
          No matching notes found. Click <b>+ New Note</b> to create one!
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(n => `
      <div class="note-item ${n.id === selectedNoteId ? 'active' : ''}" data-id="${n.id}">
        <div class="note-item-header">
          <div class="note-item-title">${escapeHTML(n.title || 'Untitled Note')}</div>
          ${n.pinned ? '<span class="note-pin-icon" title="Pinned Note">📌</span>' : ''}
        </div>
        <div class="note-item-snippet">${escapeHTML(n.content.replace(/^[#\-*`> ]+/gm, ''))}</div>
        <div class="note-item-footer">
          <span class="subject-tag" style="font-size:10px; padding:1px 6px;">${escapeHTML(n.subject || 'General')}</span>
          <span>${formatRelativeTime(n.updatedAt)}</span>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        selectNote(item.dataset.id);
      });
    });
  }

  function selectNote(noteId) {
    selectedNoteId = noteId;
    const note = appState.notes.find(n => n.id === noteId);
    if (!note) return;

    // Update active highlight in list
    document.querySelectorAll('.note-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === noteId);
    });

    // Populate editor fields
    const titleInput = document.getElementById('editor-note-title');
    const subjectInput = document.getElementById('editor-note-subject');
    const textarea = document.getElementById('editor-textarea');
    const pinBtn = document.getElementById('btn-note-pin');

    if (titleInput) titleInput.value = note.title;
    if (subjectInput) subjectInput.value = note.subject || 'General';
    if (textarea) textarea.value = note.content;
    if (pinBtn) pinBtn.textContent = note.pinned ? '📌 Pinned' : '📍 Pin';

    updateNoteStats();
    setSaveStatus('saved');
  }

  function createNewBlankNote() {
    const newNote = {
      id: 'n-' + Date.now(),
      title: 'New Study Note',
      subject: 'General',
      tags: ['study'],
      pinned: false,
      updatedAt: new Date().toISOString(),
      content: 'Write your lecture summary, formulas, or review questions here...'
    };

    appState.notes.unshift(newNote);
    saveState();
    renderNotesTags();
    renderNotesList();
    selectNote(newNote.id);
    document.getElementById('editor-note-title').focus();
    showToast('New note created', '📝');
  }

  function scheduleAutoSave() {
    setSaveStatus('saving');
    clearTimeout(noteAutoSaveTimer);
    noteAutoSaveTimer = setTimeout(() => {
      performNoteSave();
    }, 400);
    updateNoteStats();
  }

  function performNoteSave() {
    if (!selectedNoteId) return;
    const note = appState.notes.find(n => n.id === selectedNoteId);
    if (!note) return;

    const titleInput = document.getElementById('editor-note-title');
    const subjectInput = document.getElementById('editor-note-subject');
    const textarea = document.getElementById('editor-textarea');

    if (titleInput) note.title = titleInput.value || 'Untitled Note';
    if (subjectInput) note.subject = subjectInput.value || 'General';
    if (textarea) note.content = textarea.value || '';
    note.updatedAt = new Date().toISOString();

    saveState();
    setSaveStatus('saved');
    renderNotesList();
    checkMilestones();
  }

  function setSaveStatus(status) {
    const indicator = document.getElementById('editor-save-indicator');
    if (!indicator) return;

    if (status === 'saving') {
      indicator.className = 'editor-save-indicator saving';
      indicator.innerHTML = '<span>⏳</span> <span>Saving changes...</span>';
    } else {
      indicator.className = 'editor-save-indicator';
      indicator.innerHTML = '<span>●</span> <span>Saved just now</span>';
    }
  }

  function updateNoteStats() {
    const textarea = document.getElementById('editor-textarea');
    const wordsEl = document.getElementById('note-stat-words');
    const charsEl = document.getElementById('note-stat-chars');
    const readEl = document.getElementById('note-stat-readtime');

    if (!textarea) return;
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));

    if (wordsEl) wordsEl.textContent = `${words} words`;
    if (charsEl) charsEl.textContent = `${chars} chars`;
    if (readEl) readEl.textContent = `~${readMinutes} min read`;
  }

  function togglePinSelectedNote() {
    if (!selectedNoteId) return;
    const note = appState.notes.find(n => n.id === selectedNoteId);
    if (!note) return;

    note.pinned = !note.pinned;
    saveState();
    renderNotesList();
    const pinBtn = document.getElementById('btn-note-pin');
    if (pinBtn) pinBtn.textContent = note.pinned ? '📌 Pinned' : '📍 Pin';
    showToast(note.pinned ? 'Note pinned to top' : 'Note unpinned', '📌');
  }

  function deleteSelectedNote() {
    if (!selectedNoteId) return;
    if (!confirm('Are you sure you want to delete this study note?')) return;

    appState.notes = appState.notes.filter(n => n.id !== selectedNoteId);
    saveState();
    renderNotesTags();
    renderNotesList();

    if (appState.notes.length > 0) {
      selectNote(appState.notes[0].id);
    } else {
      selectedNoteId = null;
      document.getElementById('editor-note-title').value = '';
      document.getElementById('editor-textarea').value = '';
    }
    showToast('Note deleted', '🗑️');
  }

  function exportSelectedNote() {
    if (!selectedNoteId) return;
    const note = appState.notes.find(n => n.id === selectedNoteId);
    if (!note) return;

    const markdownContent = `# ${note.title}\n\n**Subject**: ${note.subject}\n**Updated**: ${note.updatedAt}\n\n---\n\n${note.content}`;
    downloadFile(`${slugify(note.title)}.md`, markdownContent, 'text/markdown');
    showToast('Note downloaded as Markdown', '⬇️');
  }

  function applyMarkdownFormat(action) {
    const textarea = document.getElementById('editor-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let replacement = '';

    switch (action) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Section Heading'}\n`;
        break;
      case 'list':
        replacement = `\n- ${selected || 'Bullet item'}\n`;
        break;
      case 'task':
        replacement = `\n- [ ] ${selected || 'Study checklist item'}\n`;
        break;
      case 'code':
        replacement = `\`\`\`\n${selected || '// code snippet or formula'}\n\`\`\``;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Important takeaway or quote'}\n`;
        break;
      default:
        return;
    }

    textarea.setRangeText(replacement, start, end, 'end');
    scheduleAutoSave();
  }

  // --- 5. PROGRESS & ANALYTICS CONTROLLER ---
  function renderProgressCharts() {
    // 1. Calculate overall stats
    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const taskRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalFocusMinutes = appState.history.reduce((sum, h) => sum + (h.focusMinutes || 0), 0);
    const totalSessions = appState.history.reduce((sum, h) => sum + (h.sessions || 0), 0);
    const weeklyHours = (totalFocusMinutes / 60).toFixed(1);

    // Update Progress Stat Elements
    const pTotalHours = document.getElementById('prog-stat-hours');
    const pCompletedRate = document.getElementById('prog-stat-rate');
    const pTotalSessions = document.getElementById('prog-stat-sessions');
    const pStreak = document.getElementById('prog-stat-streak');

    if (pTotalHours) pTotalHours.textContent = `${weeklyHours} hrs`;
    if (pCompletedRate) pCompletedRate.textContent = `${taskRate}%`;
    if (pTotalSessions) pTotalSessions.textContent = `${totalSessions}`;
    if (pStreak) pStreak.textContent = `${appState.student.streakDays} Days 🔥`;

    // 2. Render Weekly Bar Chart
    renderWeeklyBarChart();

    // 3. Render Subject Breakdown
    renderSubjectBreakdown();

    // 4. Render Milestones
    renderMilestones();
  }

  function renderWeeklyBarChart() {
    const chartContainer = document.getElementById('weekly-bar-chart-container');
    if (!chartContainer) return;

    // Use last 7 history items
    const logs = appState.history.slice(-7);
    const maxMinutes = Math.max(...logs.map(l => l.focusMinutes), 120);

    const todayStr = getTodayDateString();

    let barsHtml = '';
    logs.forEach(log => {
      const isToday = log.date === todayStr;
      const heightPercent = Math.min(100, Math.round((log.focusMinutes / maxMinutes) * 100));

      barsHtml += `
        <div class="bar-column">
          <div class="bar-tooltip">
            <b>${log.day} (${log.date})</b><br/>
            ⏱️ ${log.focusMinutes} mins (${log.sessions} sessions)<br/>
            ✓ ${log.tasksDone || 0} tasks finished
          </div>
          <div class="bar-fill-track">
            <div class="bar-fill ${isToday ? 'today-bar' : ''}" style="height: ${heightPercent}%;"></div>
          </div>
          <div class="bar-label">${log.day}</div>
        </div>
      `;
    });

    chartContainer.innerHTML = barsHtml;
  }

  function renderSubjectBreakdown() {
    const list = document.getElementById('subject-breakdown-container');
    if (!list) return;

    // Count tasks per subject
    const subjectCounts = {};
    appState.tasks.forEach(t => {
      const s = t.subject || 'General';
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    });

    const total = appState.tasks.length || 1;
    const colors = [
      'var(--primary)',
      'var(--teal)',
      'var(--sage)',
      'var(--amber)',
      'var(--rose)',
      'var(--violet)'
    ];

    let html = '';
    let idx = 0;
    for (const [subj, count] of Object.entries(subjectCounts)) {
      const pct = Math.round((count / total) * 100);
      const color = colors[idx % colors.length];
      idx++;

      html += `
        <div class="subject-progress-row">
          <div class="subject-progress-info">
            <span>${escapeHTML(subj)}</span>
            <span style="color:var(--text-muted);">${count} tasks (${pct}%)</span>
          </div>
          <div class="subject-progress-track">
            <div class="subject-progress-bar" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    }

    list.innerHTML = html;
  }

  function renderMilestones() {
    const container = document.getElementById('milestones-cards-container');
    if (!container) return;

    // Calculate dynamic values
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const totalSessions = appState.history.reduce((sum, h) => sum + (h.sessions || 0), 0);
    const totalMinutes = appState.history.reduce((sum, h) => sum + (h.focusMinutes || 0), 0);
    const streak = appState.student.streakDays;
    const noteCount = appState.notes.length;

    let html = '';
    appState.milestones.forEach(m => {
      let currentVal = 0;
      if (m.type === 'tasks') currentVal = completedTasks;
      if (m.type === 'sessions') currentVal = totalSessions;
      if (m.type === 'minutes') currentVal = totalMinutes;
      if (m.type === 'streak') currentVal = streak;
      if (m.type === 'notes') currentVal = noteCount;

      const isUnlocked = currentVal >= m.target;
      const progressPercent = Math.min(100, Math.round((currentVal / m.target) * 100));

      html += `
        <div class="milestone-badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="milestone-icon-wrap" style="${isUnlocked ? 'background:var(--sage-light);' : ''}">
            ${m.icon}
          </div>
          <div class="milestone-info">
            <div class="milestone-name">
              <span>${escapeHTML(m.name)}</span>
              ${isUnlocked ? '<span style="font-size:12px; color:var(--sage);">✓ Unlocked</span>' : ''}
            </div>
            <div class="milestone-desc">${escapeHTML(m.desc)}</div>
            <div class="milestone-meter-track">
              <div class="milestone-meter-fill" style="width: ${progressPercent}%; ${isUnlocked ? 'background-color:var(--sage);' : ''}"></div>
            </div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px; text-align:right;">
              ${currentVal} / ${m.target}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function checkMilestones() {
    // Re-evaluates milestone thresholds and shows celebratory toast if new milestone reached
    renderMilestones();
  }

  // --- 6. DATA MANAGEMENT & RESET CONTROLLER ---
  function initDataManagement() {
    // Reset to Sample Data button
    const resetSampleBtn = document.getElementById('btn-reset-sample-data');
    if (resetSampleBtn) {
      resetSampleBtn.addEventListener('click', () => {
        if (confirm('Reset all tasks, notes, and study statistics to the original sample dataset?')) {
          appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
          saveState();
          refreshAllViews();
          showToast('Dashboard reset to realistic sample data', '🔄');
        }
      });
    }

    // Clear All Data button
    const clearAllBtn = document.getElementById('btn-clear-all-data');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This will give you a clean slate.')) {
          appState.tasks = [];
          appState.notes = [];
          appState.history = [
            { day: 'Today', date: getTodayDateString(), focusMinutes: 0, sessions: 0, tasksDone: 0 }
          ];
          saveState();
          refreshAllViews();
          showToast('All data cleared. Welcome to your clean slate!', '✨');
        }
      });
    }

    // Export Backup JSON
    const exportDataBtn = document.getElementById('btn-export-json');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => {
        const jsonStr = JSON.stringify(appState, null, 2);
        downloadFile(`zenith-student-backup-${getTodayDateString()}.json`, jsonStr, 'application/json');
        showToast('Backup JSON exported successfully', '💾');
      });
    }

    // Import Backup JSON
    const importInput = document.getElementById('file-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported.tasks && imported.notes) {
              appState = imported;
              saveState();
              refreshAllViews();
              showToast('Backup restored successfully!', '✓');
            } else {
              alert('Invalid backup file format.');
            }
          } catch (err) {
            alert('Failed to parse JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  function refreshAllViews() {
    renderOverview();
    renderTasks();
    renderNotesTags();
    renderNotesList();
    if (appState.notes.length > 0) selectNote(appState.notes[0].id);
    renderProgressCharts();
    updateRoundsUI();
  }

  // --- 7. KEYBOARD SHORTCUTS CONTROLLER ---
  function initKeyboardShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    const openBtn = document.getElementById('btn-open-shortcuts');
    const closeBtn = document.getElementById('shortcuts-modal-close');

    function toggleShortcutsModal() {
      if (modal) modal.classList.toggle('active');
    }

    if (openBtn) openBtn.addEventListener('click', toggleShortcutsModal);
    if (closeBtn) closeBtn.addEventListener('click', toggleShortcutsModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    // Global Key Listener
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if active in an input/textarea
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // 'Escape' closes any open modal
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        return;
      }

      // '?' opens shortcuts
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }

      // Spacebar toggles Pomodoro timer when not typing
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        toggleTimer();
        return;
      }

      // 'n' creates new task
      if (e.key.toLowerCase() === 't' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        window.openTaskModal();
        return;
      }
    });
  }

  // --- UTILITY HELPERS ---
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  function formatRelativeTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  }

  function downloadFile(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- INITIALIZATION ENTRY POINT ---
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTheme();
    initNavigation();
    initQuotes();
    initTasks();
    initPomodoro();
    initNotes();
    renderOverview();
    renderProgressCharts();
    initDataManagement();
    initKeyboardShortcuts();

    // Check student name
    const studentNameEl = document.getElementById('header-student-name');
    if (studentNameEl) studentNameEl.textContent = appState.student.name || 'Student';
  });

})();
