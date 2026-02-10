const queue = [
  {
    id: 1,
    name: 'Jordan Lee',
    phone: '+1 (555) 123-9876',
    accountReference: 'ACCT-10045',
    status: 'New',
    reason: 'Billing question',
  },
  {
    id: 2,
    name: 'Casey Nguyen',
    phone: '+1 (555) 834-2211',
    accountReference: 'ACCT-20017',
    status: 'Follow-up',
    reason: 'Service outage',
  },
  {
    id: 3,
    name: 'Taylor Smith',
    phone: '+1 (555) 349-0088',
    accountReference: 'ACCT-33002',
    status: 'Escalated',
    reason: 'Plan upgrade',
  },
];

const queueList = document.getElementById('queue-list');
const profile = document.getElementById('caller-profile');
const activityLog = document.getElementById('activity-log');
const interactionForm = document.getElementById('interaction-form');
const outcomeInput = document.getElementById('outcome');
const notesInput = document.getElementById('notes');

let selectedCaller = null;

function renderQueue() {
  queueList.innerHTML = '';

  for (const caller of queue) {
    const item = document.createElement('li');
    item.dataset.id = caller.id;
    item.innerHTML = `<strong>${caller.name}</strong><br /><small>${caller.reason}</small>`;

    if (selectedCaller && selectedCaller.id === caller.id) {
      item.classList.add('active');
    }

    item.addEventListener('click', () => {
      selectedCaller = caller;
      renderQueue();
      renderProfile();
    });

    queueList.appendChild(item);
  }
}

function renderProfile() {
  if (!selectedCaller) {
    profile.className = 'profile muted';
    profile.textContent = 'Select a queue item to view details.';
    return;
  }

  profile.className = 'profile';
  profile.innerHTML = `
    <div><strong>Name:</strong> ${selectedCaller.name}</div>
    <div><strong>Phone:</strong> ${selectedCaller.phone}</div>
    <div><strong>Account:</strong> ${selectedCaller.accountReference}</div>
    <div><strong>Status:</strong> ${selectedCaller.status}</div>
    <div><strong>Reason:</strong> ${selectedCaller.reason}</div>
  `;
}

interactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!selectedCaller) {
    alert('Select a caller before saving an interaction.');
    return;
  }

  const outcome = outcomeInput.value;
  const notes = notesInput.value.trim();
  const timestamp = new Date().toLocaleString();

  const entry = document.createElement('li');
  entry.innerHTML = `
    <strong>${timestamp}</strong><br />
    ${selectedCaller.name} — <em>${outcome}</em><br />
    <small>${notes || 'No notes provided.'}</small>
  `;
  activityLog.prepend(entry);

  outcomeInput.value = '';
  notesInput.value = '';
});

renderQueue();
renderProfile();
