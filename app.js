const subjectsList = document.getElementById('subjectsList');
const addSubjectBtn = document.getElementById('addSubject');
const removeSubjectBtn = document.getElementById('removeSubject');
const form = document.getElementById('calc-form');
const resultBox = document.getElementById('result');
const resultsTableBody = document.querySelector('#resultsTable tbody');

function createSubjectInput(index) {
  const wrap = document.createElement('div');
  wrap.className = 'subject-item';
  const label = document.createElement('label');
  label.textContent = `Subject ${index+1}`;
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.placeholder = 'Marks';
  input.required = true;
  input.className = 'subject-mark';
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

function ensureAtLeastOne() {
  if (subjectsList.children.length === 0) {
    for (let i = 0; i < 3; i++) {
      subjectsList.appendChild(createSubjectInput(i));
    }
  } else {
    Array.from(subjectsList.children).forEach((child, idx) => {
      const label = child.querySelector('label');
      if (label) label.textContent = `Subject ${idx+1}`;
    });
  }
}

addSubjectBtn.addEventListener('click', () => {
  subjectsList.appendChild(createSubjectInput(subjectsList.children.length));
  ensureAtLeastOne();
});

removeSubjectBtn.addEventListener('click', () => {
  if (subjectsList.children.length > 0) {
    subjectsList.removeChild(subjectsList.lastElementChild);
  }
  ensureAtLeastOne();
});

function readMarks() {
  return Array.from(document.querySelectorAll('.subject-mark')).map(inp => Number(inp.value));
}

function showResult(r) {
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = `
    <div><strong>Total:</strong> ${r.total}</div>
    <div><strong>Percentage:</strong> ${r.percentage}%</div>
    <div><strong>Grade:</strong> ${r.grade}</div>
    <div><strong>Remark:</strong> ${r.remark}</div>
  `;
}

async function fetchResults() {
  const res = await fetch('/api/results');
  const list = await res.json();
  resultsTableBody.innerHTML = '';
  list.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.name}</td>
      <td>${row.total}</td>
      <td>${row.percentage}%</td>
      <td>${row.grade}</td>
      <td>${row.remark}</td>
      <td>${new Date(row.created_at).toLocaleString()}</td>
      <td class="action-row">
        <button class="btn btn-secondary" data-view="${row.id}">View</button>
        <button class="btn btn-danger" data-del="${row.id}">Delete</button>
      </td>
    `;
    resultsTableBody.appendChild(tr);
  });
}

resultsTableBody.addEventListener('click', async (e) => {
  const viewId = e.target.getAttribute('data-view');
  const delId = e.target.getAttribute('data-del');
  if (viewId) {
    const res = await fetch('/api/results/' + viewId);
    if (res.ok) {
      const r = await res.json();
      const data = {
        total: r.total,
        percentage: r.percentage,
        grade: r.grade,
        remark: r.remark
      };
      showResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else if (delId) {
    if (confirm('Delete this record?')) {
      const res = await fetch('/api/results/' + delId, { method: 'DELETE' });
      if (res.ok) {
        await fetchResults();
      }
    }
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const maxMarks = Number(document.getElementById('maxMarks').value) || 100;
  const marks = readMarks();

  if (!name) {
    alert('Please enter student name');
    return;
  }
  if (marks.some(m => isNaN(m))) {
    alert('Please enter valid marks for all subjects');
    return;
  }

  // Send to backend to compute & save
  const res = await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, marks, maxMarksPerSubject: maxMarks })
  });
  const saved = await res.json();
  if (!res.ok) {
    alert(saved.error || 'Error saving result');
    return;
  }

  // Show result using saved record
  showResult({
    total: saved.total,
    percentage: saved.percentage,
    grade: saved.grade,
    remark: saved.remark
  });

  await fetchResults();
});

// Initialize
ensureAtLeastOne();
fetchResults();