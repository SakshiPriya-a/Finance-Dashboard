

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let selectedRole = 'admin';
const roleSelect = document.getElementById('roleSelect');

const balanceEl = document.getElementById('totalBalance');
const incomeEl = document.getElementById('totalIncome');
const expenseEl = document.getElementById('totalExpense');
const tableBody = document.getElementById('tableBody');

const highestCategoryEl = document.getElementById('highestCategory');
const monthlyChangeEl = document.getElementById('monthlyChange');
const totalTransactionsEl = document.getElementById('totalTransactions');

const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');

const addBtn = document.getElementById('addBtn');
const saveTransaction = document.getElementById('saveTransaction');
const updateTransaction = document.getElementById('updateTransaction');

let editIndex = null;

// Charts
let lineChart = new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: { labels: [], datasets:[{label:'Balance', data:[], borderColor:'#b491ff', backgroundColor:'rgba(180,145,255,0.2)', tension:0.4, fill:true}]}
});
let pieChart = new Chart(document.getElementById('pieChart'), { type:'pie', data:{labels:[], datasets:[{data:[], backgroundColor:[]}]} });

function updateUI(){
  let totalIncome = transactions.filter(t=>t.type==='income').reduce((a,b)=>a+Number(b.amount),0);
  let totalExpense = transactions.filter(t=>t.type==='expense').reduce((a,b)=>a+Number(b.amount),0);
  let totalBalance = totalIncome - totalExpense;

  balanceEl.textContent = `₹${totalBalance}`;
  incomeEl.textContent = `₹${totalIncome}`;
  expenseEl.textContent = `₹${totalExpense}`;

  // Insights
  let catMap = {};
  transactions.forEach(t=>{ if(t.type==='expense'){ catMap[t.category] = (catMap[t.category]||0)+Number(t.amount); }});
  let highestCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
  highestCategoryEl.textContent = 'Highest Spending Category: ' + (highestCat?highestCat[0]:'—');

  // Monthly change calculation
  const now = new Date();
  const currentMonthExp = transactions.filter(t=>t.type==='expense' && new Date(t.date).getMonth()===now.getMonth()).reduce((a,b)=>a+Number(b.amount),0);
  const lastMonthExp = transactions.filter(t=>t.type==='expense' && new Date(t.date).getMonth()===now.getMonth()-1).reduce((a,b)=>a+Number(b.amount),0);
  monthlyChangeEl.textContent = 'Monthly Comparison: ' + (lastMonthExp?(((currentMonthExp-lastMonthExp)/lastMonthExp*100).toFixed(2))+'%':'—');

  totalTransactionsEl.textContent = 'Total Transactions: ' + transactions.length;
  renderTable();
  updateCharts();
  localStorage.setItem('transactions', JSON.stringify(transactions));
}



// themeToggle.addEventListener("click", () => {
//     document.body.classList.toggle("dark");

//     themeToggle.textContent =
//         document.body.classList.contains("dark") ? "☀️" : "🌙";
// });



function renderTable(){
  tableBody.innerHTML='';
  if(transactions.length===0){ tableBody.innerHTML='<tr class="empty-row"><td colspan="5">No transactions yet.</td></tr>'; return; }
  transactions.forEach((t,index)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.category}</td>
      <td>₹${t.amount}</td>
      <td>${t.type}</td>
      ${selectedRole==='admin'?`<td>
        <button onclick="editTransaction(${index})">Edit</button>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </td>`:''}
    `;
    tableBody.appendChild(tr);
  });
}

function updateCharts(){
  // Line chart
  lineChart.data.labels = transactions.map(t=>t.date);
  let balanceArr=[], balance=0;
  transactions.forEach(t=>{ balance+=t.type==='income'?Number(t.amount):-Number(t.amount); balanceArr.push(balance); });
  lineChart.data.datasets[0].data = balanceArr;
  lineChart.update();

  // Pie chart
  let categoryMap={};
  transactions.forEach(t=>{ categoryMap[t.category] = (categoryMap[t.category]||0)+Number(t.amount); });
  pieChart.data.labels = Object.keys(categoryMap);
  pieChart.data.datasets[0].data = Object.values(categoryMap);
  pieChart.data.datasets[0].backgroundColor = Object.keys(categoryMap).map((_,i)=>`hsl(${i*60},70%,60%)`);
  pieChart.update();
}

// Event Listeners
roleSelect.addEventListener('change', e=>{ selectedRole=e.target.value; updateUI(); });

addBtn.addEventListener('click', ()=>{
  addModal.style.display='flex';
  document.getElementById('addDate').value='';
  document.getElementById('addCategory').value='';
  document.getElementById('addAmount').value='';
  document.getElementById('addType').value='income';
});

document.querySelectorAll('.close-modal').forEach(btn=>{ btn.addEventListener('click', ()=>{ addModal.style.display='none'; editModal.style.display='none'; }); });

saveTransaction.addEventListener('click', ()=>{
  const t = { date: document.getElementById('addDate').value, category: document.getElementById('addCategory').value, amount: document.getElementById('addAmount').value, type: document.getElementById('addType').value };
  if(t.date && t.category && t.amount){ transactions.push(t); updateUI(); addModal.style.display='none'; } else alert('Please fill all fields');
});

function editTransaction(index){
  editIndex=index;
  const t=transactions[index];
  document.getElementById('editDate').value=t.date;
  document.getElementById('editCategory').value=t.category;
  document.getElementById('editAmount').value=t.amount;
  document.getElementById('editType').value=t.type;
  editModal.style.display='flex';
}

updateTransaction.addEventListener('click', ()=>{
  const t={ date: document.getElementById('editDate').value, category: document.getElementById('editCategory').value, amount: document.getElementById('editAmount').value, type: document.getElementById('editType').value };
  if(t.date && t.category && t.amount){ transactions[editIndex]=t; updateUI(); editModal.style.display='none'; } else alert('Please fill all fields');
});

function deleteTransaction(index){ if(confirm('Are you sure?')){ transactions.splice(index,1); updateUI(); } }

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{ document.body.classList.toggle('dark'); });

updateUI();