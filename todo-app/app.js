const STORAGE_KEY = 'todos';

let todos = load();
let filter = 'all';
let editingId = null;

// ── Storage ──────────────────────────────────────────────
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ── CRUD ─────────────────────────────────────────────────
function addTodo(title) {
  todos.push({ id: Date.now(), title: title.trim(), completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.completed = !todo.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function updateTodo(id, title) {
  const todo = todos.find(t => t.id === id);
  if (todo && title.trim()) { todo.title = title.trim(); save(); render(); }
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

// ── Render ────────────────────────────────────────────────
function filtered() {
  if (filter === 'active')    return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

function render() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  filtered().forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');

    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? 'checked' : ''} />
      <span class="title">${escapeHtml(todo.title)}</span>
      <div class="actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
      </div>
    `;

    li.querySelector('input').addEventListener('change', () => toggleTodo(todo.id));
    li.querySelector('.btn-edit').addEventListener('click', () => openModal(todo.id));
    li.querySelector('.btn-delete').addEventListener('click', () => deleteTodo(todo.id));

    list.appendChild(li);
  });

  const active = todos.filter(t => !t.completed).length;
  const footer = document.getElementById('footer');
  const hasTodos = todos.length > 0;

  footer.classList.toggle('hidden', !hasTodos);
  document.getElementById('count').textContent =
    `${active} item${active !== 1 ? 's' : ''} left`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Modal ─────────────────────────────────────────────────
function openModal(id) {
  editingId = id;
  const todo = todos.find(t => t.id === id);
  document.getElementById('edit-input').value = todo.title;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('edit-input').focus();
}

function closeModal() {
  editingId = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}

function saveModal() {
  const val = document.getElementById('edit-input').value;
  if (val.trim()) { updateTodo(editingId, val); }
  closeModal();
}

// ── Events ────────────────────────────────────────────────
document.getElementById('add-btn').addEventListener('click', () => {
  const input = document.getElementById('todo-input');
  if (input.value.trim()) { addTodo(input.value); input.value = ''; input.focus(); }
});

document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('add-btn').click();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

document.getElementById('clear-btn').addEventListener('click', clearCompleted);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-save').addEventListener('click', saveModal);

document.getElementById('edit-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveModal();
  if (e.key === 'Escape') closeModal();
});

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── Init ──────────────────────────────────────────────────
render();
