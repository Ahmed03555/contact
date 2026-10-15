// ─── State ───────────────────────────────────────────────────────────────────
let contacts = [];
let currentFilter = 'all'; // 'all' | 'favorites'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function saveToStorage() {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

function updateCounters() {
  const totalEl = document.getElementById('contact-count-number');
  const favBadge = document.getElementById('fav-badge');
  const favCount = contacts.filter(c => c.favorite).length;

  if (currentFilter === 'favorites') {
    totalEl.textContent = favCount;
  } else {
    totalEl.textContent = contacts.length;
  }
  favBadge.textContent = favCount;
  favBadge.style.display = favCount > 0 ? 'inline-flex' : 'none';
}

function setFilter(filter) {
  currentFilter = filter;

  document.getElementById('filter-all').classList.toggle('active', filter === 'all');
  document.getElementById('filter-favorites').classList.toggle('active', filter === 'favorites');

  rerenderAll();
}

// ─── Render ───────────────────────────────────────────────────────────────────
function rerenderAll() {
  const list = document.querySelector('.Contact_list');
  list.innerHTML = '';

  // Sort: favorites first, then the rest (both sorted by id desc – newest first)
  const sorted = [...contacts].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return b.id - a.id;
  });

  const filtered = currentFilter === 'favorites'
    ? sorted.filter(c => c.favorite)
    : sorted;

  const emptyState = document.getElementById('empty-state');
  if (filtered.length === 0 && currentFilter === 'favorites') {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    filtered.forEach(c => renderContact(c, false));
  }

  updateCounters();
}

function renderContact(contact, prepend = false) {
  if (contact.deleted) return;

  const list = document.querySelector('.Contact_list');
  const node = document.createElement('article');
  node.setAttribute('class', `person${contact.favorite ? ' is-favorite' : ''}`);
  node.setAttribute('data-key', contact.id);

  node.innerHTML = `
    <img src="${contact.imageurl}" alt="${contact.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=6c63ff&color=fff&size=80'">
    <div class="contactdetail">
      <h1><i class="fas fa-user-circle contactIcon"></i> ${contact.name}</h1>
      <p><i class="fas fa-envelope contactIcon"></i> ${contact.email}</p>
      <p><i class="fas fa-phone-alt contactIcon"></i> ${contact.contactnumber}</p>
    </div>
    <div class="action-buttons">
      <button class="fav-btn js-fav-contact${contact.favorite ? ' active' : ''}" title="${contact.favorite ? 'Remove from favorites' : 'Add to favorites'}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      <button class="delete-contact js-delete-contact" title="Delete contact">
        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </button>
    </div>
  `;

  if (prepend) {
    list.prepend(node);
  } else {
    list.append(node);
  }
}

// ─── Event Delegation ─────────────────────────────────────────────────────────
const list = document.querySelector('.Contact_list');
list.addEventListener('click', (event) => {
  const article = event.target.closest('article[data-key]');
  if (!article) return;
  const itemKey = article.dataset.key;

  if (event.target.closest('.js-delete-contact')) {
    deleteContact(itemKey);
  } else if (event.target.closest('.js-fav-contact')) {
    toggleFavorite(itemKey);
  }
});

// ─── Actions ─────────────────────────────────────────────────────────────────
function deleteContact(key) {
  contacts = contacts.filter(item => item.id !== Number(key));
  saveToStorage();
  rerenderAll();
}

function toggleFavorite(key) {
  const index = contacts.findIndex(item => item.id === Number(key));
  if (index === -1) return;
  contacts[index].favorite = !contacts[index].favorite;
  saveToStorage();
  rerenderAll();
}

function addContact() {
  const contactObject = {
    name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('myEmail').value.trim(),
    imageurl: document.getElementById('imgurl').value.trim(),
    contactnumber: document.getElementById('myTel').value.trim(),
    id: Date.now(),
    favorite: false,
  };
  contacts.push(contactObject);
  saveToStorage();
  rerenderAll();
}

// ─── Form submit ─────────────────────────────────────────────────────────────
const form = document.querySelector('.js-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  addContact();
  form.reset();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ref = localStorage.getItem('contacts');
  if (ref) {
    contacts = JSON.parse(ref);
    // Ensure legacy contacts (no favorite property) get the property
    contacts = contacts.map(c => ({ favorite: false, ...c }));
  }
  rerenderAll();
});
