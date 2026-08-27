const {createClient}=supabase;
const db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
let employee=null;

document.getElementById('orderDate').value=new Date().toISOString().slice(0,10);

async function employeeLogin(){
  const empNo=document.getElementById('empNo').value.trim();
  const pin=document.getElementById('pin').value.trim();
  const msg=document.getElementById('loginMsg');
  if(!empNo||!pin){msg.textContent='Enter Employee No and PIN.';return;}
  const {data,error}=await db.from('employees').select('*').eq('employee_no',empNo).eq('pin',pin).eq('active',true).single();
  if(error){msg.textContent='Invalid login.';return;}
  employee=data;
  document.getElementById('loginCard').classList.add('hidden');
  document.getElementById('orderCard').classList.remove('hidden');
  document.getElementById('employeeName').textContent=data.name;
  document.getElementById('employeeNo').textContent=data.employee_no;
}
async function submitOrder(){
  if(!employee)return;
  const meals=['breakfast','lunch','dinner'].filter(x=>document.getElementById(x).checked);
  const msg=document.getElementById('orderMsg');
  if(!meals.length){msg.textContent='Select at least one meal.';return;}
  const delivery=document.querySelector('input[name=delivery]:checked').value;
  const row={employee_id:employee.id,order_date:document.getElementById('orderDate').value,breakfast:meals.includes('breakfast'),lunch:meals.includes('lunch'),dinner:meals.includes('dinner'),quantity:Number(document.getElementById('quantity').value),delivery:delivery==='need'};
  const {error}=await db.from('orders').insert(row);
  msg.textContent=error?error.message:'Order submitted successfully.';
}
async function loadOrders(){
  const {data,error}=await db.from('orders').select('id,order_date,breakfast,lunch,dinner,quantity,delivery,employees(employee_no,name)').order('order_date',{ascending:false});
  const el=document.getElementById('orders');
  if(error){el.textContent=error.message;return;}
  el.innerHTML='<table><tr><th>Date</th><th>Employee</th><th>Meals</th><th>Qty</th><th>Delivery</th></tr>'+
  data.map(o=>`<tr><td>${o.order_date}</td><td>${o.employees?.employee_no||''} - ${o.employees?.name||''}</td><td>${[o.breakfast&&'B',o.lunch&&'L',o.dinner&&'D'].filter(Boolean).join(', ')}</td><td>${o.quantity}</td><td>${o.delivery?'Yes':'No'}</td></tr>`).join('')+'</table>';
}
function logout(){location.reload();}
