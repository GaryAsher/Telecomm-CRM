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
    reason: 'Medication refill request',
  },
];

const updates = [
  'Shift handoff notes added for Team A.',
  'Password reset workflow updated for new callers.',
  'Medication refill callback queue reviewed this morning.',
];

const mail = [
  'IT: MFA reminders for all agents due Friday',
  'Supervisor: Schedule update for weekend coverage',
  'Operations: New appointment script draft ready',
];

const companies = [
  { name: 'Northside Family Practice', location: 'Springfield, IL', hours: 'Mon-Fri 8:00 AM - 5:00 PM', employees: 26 },
  { name: 'Riverbend Internal Medicine', location: 'Columbus, OH', hours: 'Mon-Sat 9:00 AM - 6:00 PM', employees: 41 },
  { name: 'Pinecrest Health Group', location: 'Nashville, TN', hours: 'Mon-Fri 7:30 AM - 7:00 PM', employees: 32 },
];

const tabLinks = document.querySelectorAll('[data-tab-link]');
const tabPanels = document.querySelectorAll('.tab-panel');

const queueList = document.getElementById('queue-list');
const profile = document.getElementById('caller-profile');
const updatesList = document.getElementById('updates-list');
const mailList = document.getElementById('mail-list');
const companiesTableBody = document.getElementById('companies-table-body');

const companyForm = document.getElementById('company-form');
const companyNameInput = document.getElementById('company-name');
const companyLocationInput = document.getElementById('company-location');
const companyHoursInput = document.getElementById('company-hours');
const companyEmployeeCountInput = document.getElementById('company-employee-count');

let selectedCaller = null;

function switchSection(sectionId) {
  for (const link of tabLinks) {
    const targetId = link.getAttribute('href').slice(1);
    link.classList.toggle('active', targetId === sectionId);
  }

  for (const panel of tabPanels) {
    panel.classList.toggle('active', panel.id === sectionId);
  }
}

for (const link of tabLinks) {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const sectionId = link.getAttribute('href').slice(1);
    history.replaceState(null, '', `#${sectionId}`);
    switchSection(sectionId);
  });
}

function openFromHash() {
  const defaultSection = 'dashboard-section';
  const hashSection = window.location.hash ? window.location.hash.slice(1) : defaultSection;
  const validSection = document.getElementById(hashSection) ? hashSection : defaultSection;
  switchSection(validSection);
}

function renderSimpleList(values, target) {
  target.innerHTML = '';
  for (const value of values) {
    const item = document.createElement('li');
    item.textContent = value;
    target.appendChild(item);
  }
}

function renderQueue() {
  queueList.innerHTML = '';
  for (const caller of queue) {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${caller.name}</strong><br /><small>${caller.reason}</small>`;
    if (selectedCaller && selectedCaller.id === caller.id) item.classList.add('active');
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

function renderCompanies() {
  companiesTableBody.innerHTML = '';
  for (const company of companies) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${company.name}</td><td>${company.location}</td><td>${company.hours}</td><td>${company.employees}</td>`;
    companiesTableBody.appendChild(row);
  }
}

companyForm.addEventListener('submit', (event) => {
  event.preventDefault();

  companies.push({
    name: companyNameInput.value.trim(),
    location: companyLocationInput.value.trim(),
    hours: companyHoursInput.value.trim(),
    employees: Number(companyEmployeeCountInput.value),
  });

  renderCompanies();
  companyForm.reset();
  companyEmployeeCountInput.value = '1';
  history.replaceState(null, '', '#companies-section');
  switchSection('companies-section');
});

renderSimpleList(updates, updatesList);
renderSimpleList(mail, mailList);
renderQueue();
renderProfile();
renderCompanies();
openFromHash();
