const STORAGE_KEY = 'todos';

let todos = load();
let filter = 'all';
let search = '';
let editingId = null;

// ── Storage ──────────────────────────────────────────────
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ── CRUD ──────────────────────────────────────────────────
function addTodo(title) {
  todos.unshift({
    id: Date.now(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  });
  save();
  render();
}

function toggleTodo(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.completed = !t.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function updateTodo(id, title) {
  const t = todos.find(t => t.id === id);
  if (t && title.trim()) { t.title = title.trim(); save(); render(); }
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

// ── Helpers ───────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function filtered() {
  return todos.filter(t => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'active'    && !t.completed) ||
      (filter === 'completed' && t.completed);
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
}

// ── Render ────────────────────────────────────────────────
function render() {
  const rows = filtered();
  const tbody = document.getElementById('todo-tbody');
  const empty = document.getElementById('empty-state');
  const table = document.getElementById('data-table');

  tbody.innerHTML = '';

  if (rows.length === 0) {
    table.classList.add('hidden');
    empty.classList.remove('hidden');
  } else {
    table.classList.remove('hidden');
    empty.classList.add('hidden');

    rows.forEach((todo, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" ${todo.completed ? 'checked' : ''} /></td>
        <td class="row-no">${i + 1}</td>
        <td><span class="task-title ${todo.completed ? 'done' : ''}">${escapeHtml(todo.title)}</span></td>
        <td>
          <span class="badge ${todo.completed ? 'badge-completed' : 'badge-active'}">
            ${todo.completed ? 'Completed' : 'Active'}
          </span>
        </td>
        <td>${todo.createdAt ? formatDate(todo.createdAt) : '—'}</td>
        <td>
          <div class="row-actions">
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </div>
        </td>
      `;

      tr.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTodo(todo.id));
      tr.querySelector('.btn-edit').addEventListener('click', () => openModal(todo.id));
      tr.querySelector('.btn-delete').addEventListener('click', () => deleteTodo(todo.id));

      tbody.appendChild(tr);
    });
  }

  // Stats
  const total     = todos.length;
  const active    = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-done').textContent = completed;
  document.getElementById('row-count').textContent =
    rows.length ? `Showing ${rows.length} of ${total} task${total !== 1 ? 's' : ''}` : '';

  renderDashboard();
}

// ── Dashboard ─────────────────────────────────────────────
function renderDashboard() {
  const total     = todos.length;
  const active    = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById('dash-stat-total').textContent = total;
  document.getElementById('dash-stat-active').textContent = active;
  document.getElementById('dash-stat-done').textContent = completed;
  document.getElementById('dash-progress-fill').style.width = `${pct}%`;
  document.getElementById('dash-progress-label').textContent = `${pct}% complete`;

  const recent = todos.slice(0, 5);
  const tbody = document.getElementById('dash-recent-tbody');
  const empty = document.getElementById('dash-recent-empty');
  tbody.innerHTML = '';

  if (recent.length === 0) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    recent.forEach(todo => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="task-title ${todo.completed ? 'done' : ''}">${escapeHtml(todo.title)}</span></td>
        <td>
          <span class="badge ${todo.completed ? 'badge-completed' : 'badge-active'}">
            ${todo.completed ? 'Completed' : 'Active'}
          </span>
        </td>
        <td>${todo.createdAt ? formatDate(todo.createdAt) : '—'}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function showPage(page) {
  document.getElementById('page-tasks').classList.toggle('hidden', page !== 'tasks');
  document.getElementById('page-dashboard').classList.toggle('hidden', page !== 'dashboard');
  document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

// ── Modal ─────────────────────────────────────────────────
function openModal(id = null) {
  editingId = id;
  const isEdit = id !== null;
  document.getElementById('modal-title').textContent = isEdit ? 'Edit Task' : 'New Task';
  document.getElementById('modal-input').value = isEdit ? todos.find(t => t.id === id).title : '';
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-input').focus(), 50);
}

function closeModal() {
  editingId = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}

function saveModal() {
  const val = document.getElementById('modal-input').value.trim();
  if (!val) return;
  if (editingId !== null) {
    updateTodo(editingId, val);
  } else {
    addTodo(val);
  }
  closeModal();
}

// ── Events ────────────────────────────────────────────────
document.getElementById('add-btn').addEventListener('click', () => openModal());
document.getElementById('clear-btn').addEventListener('click', clearCompleted);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-save').addEventListener('click', saveModal);

document.getElementById('modal-input').addEventListener('keydown', e => {
  if (e.key === 'Enter')  saveModal();
  if (e.key === 'Escape') closeModal();
});

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

document.getElementById('search-input').addEventListener('input', e => {
  search = e.target.value;
  render();
});

document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

// ── Init ──────────────────────────────────────────────────
render();
