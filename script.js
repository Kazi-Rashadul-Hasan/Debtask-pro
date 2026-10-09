// State Management
let tasks = JSON.parse(localStorage.getItem('devtask_pro_items')) || [
  {
    id: '1',
    title: 'Setup GitHub Repository',
    description: 'Create initial commit and publish live project link on GitHub Pages.',
    priority: 'high',
    category: 'Feature',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Design Dashboard UI',
    description: 'Implement dark mode switcher and responsive layout with Tailwind CSS.',
    priority: 'medium',
    category: 'Design',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

let activeStatusFilter = 'all';
let activePriorityFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const filterTabs = document.querySelectorAll('.filter-tab');
const themeToggle = document.getElementById('themeToggle');

// Initialize Dashboard
function init() {
  setupEventListeners();
  render();
}

// Render Tasks & Dashboard Stats
function render() {
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeStatusFilter === 'all' ? true : 
                          activeStatusFilter === 'completed' ? task.completed : !task.completed;
    const matchesPriority = activePriorityFilter === 'all' ? true : task.priority === activePriorityFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Render Task Cards
  taskList.innerHTML = '';
  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
  } else {
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    filteredTasks.forEach(task => {
      taskList.appendChild(createTaskCard(task));
    });
  }

  // Update Stats
  updateStats();

  // Save to LocalStorage
  localStorage.setItem('devtask_pro_items', JSON.stringify(tasks));
}

// Create Task Element
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `bg-white dark:bg-slate-900 border ${task.completed ? 'border-slate-200 dark:border-slate-800 opacity-60' : 'border-slate-200/80 dark:border-slate-800'} p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between`;

  const priorityColors = {
    high: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200/50',
    medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50',
    low: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50'
  };

  card.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-3">
        <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority]}">
          ${task.priority}
        </span>
        <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
          ${task.category}
        </span>
      </div>

      <h4 class="font-bold text-base text-slate-800 dark:text-slate-100 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
        ${escapeHTML(task.title)}
      </h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
        ${escapeHTML(task.description || 'No description provided.')}
      </p>
    </div>

    <div class="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
      <button onclick="toggleTask('${task.id}')" class="flex items-center gap-2 text-xs font-semibold ${task.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-indigo-600'} transition">
        <i class="${task.completed ? 'fa-solid fa-circle-check text-base' : 'fa-regular fa-circle text-base'}"></i>
        ${task.completed ? 'Completed' : 'Mark Complete'}
      </button>

      <div class="flex items-center gap-1">
        <button onclick="editTask('${task.id}')" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button onclick="deleteTask('${task.id}')" class="w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// Calculate Statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('statTotal').innerText = total;
  document.getElementById('statPending').innerText = pending;
  document.getElementById('statCompleted').innerText = completed;
  document.getElementById('statRate').innerText = `${rate}%`;
  document.getElementById('progressBar').style.width = `${rate}%`;
}

// Event Listeners Setup
function setupEventListeners() {
  // Modal Open / Close
  document.getElementById('openTaskModal').addEventListener('click', () => openModal());
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelModal').addEventListener('click', closeModal);

  // Form Submit
  taskForm.addEventListener('submit', handleTaskSubmit);

  // Search & Filter Inputs
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    render();
  });

  priorityFilter.addEventListener('change', (e) => {
    activePriorityFilter = e.target.value;
    render();
  });

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active-tab', 'text-slate-500', 'dark:text-slate-400'));
      tab.classList.add('active-tab');
      activeStatusFilter = tab.dataset.filter;
      render();
    });
  });

  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    showToast('Theme updated successfully');
  });
}

// Task Actions
function openModal(task = null) {
  if (task) {
    modalTitle.innerText = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitleInput').value = task.title;
    document.getElementById('taskDescInput').value = task.description;
    document.getElementById('taskPriorityInput').value = task.priority;
    document.getElementById('taskCategoryInput').value = task.category;
  } else {
    modalTitle.innerText = 'Create New Task';
    taskForm.reset();
    document.getElementById('taskId').value = '';
  }
  taskModal.classList.remove('hidden');
  setTimeout(() => taskModal.classList.add('show'), 10);
}

function closeModal() {
  taskModal.classList.remove('show');
  setTimeout(() => taskModal.classList.add('hidden'), 200);
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitleInput').value.trim();
  const description = document.getElementById('taskDescInput').value.trim();
  const priority = document.getElementById('taskPriorityInput').value;
  const category = document.getElementById('taskCategoryInput').value;

  if (id) {
    // Edit existing task
    tasks = tasks.map(t => t.id === id ? { ...t, title, description, priority, category } : t);
    showToast('Task updated!');
  } else {
    // Create new task
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      category,
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    showToast('New task added!');
  }

  closeModal();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  render();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) openModal(task);
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  showToast('Task removed');
  render();
}

// Helper Functions
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform translate-y-2 opacity-0';
  toast.innerHTML = `<i class="fa-solid fa-circle-info text-indigo-400 dark:text-indigo-600"></i> ${message}`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Start App
init();