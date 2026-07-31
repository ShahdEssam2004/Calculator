const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

function updateDisplay(){
  currentEl.textContent = formatForDisplay(current);
  historyEl.textContent = previous !== null && operator
    ? `${formatForDisplay(previous)} ${operator}`
    : '';
}

function formatForDisplay(numStr){
  if(numStr === 'Error') return numStr;
  const [intPart, decPart] = String(numStr).split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function inputDigit(d){
  if(justEvaluated){ current = '0'; justEvaluated = false; }
  if(current === '0' || current === 'Error') current = d;
  else if(current.replace('-','').replace('.','').length < 15) current += d;
  updateDisplay();
}

function inputDecimal(){
  if(justEvaluated){ current = '0'; justEvaluated = false; }
  if(!current.includes('.')) current += '.';
  updateDisplay();
}

function setOperator(op){
  if(current === 'Error') return;
  if(operator && previous !== null && !justEvaluated){
    evaluate();
  }
  previous = current;
  operator = op;
  current = '0';
  justEvaluated = false;
  updateDisplay();
}

function evaluate(){
  if(operator === null || previous === null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;
  switch(operator){
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷': result = b === 0 ? NaN : a / b; break;
    default: return;
  }
  if(Number.isNaN(result) || !Number.isFinite(result)){
    current = 'Error';
    previous = null;
    operator = null;
  } else {
    current = String(Math.round(result * 1e10) / 1e10);
    previous = null;
    operator = null;
  }
  justEvaluated = true;
  updateDisplay();
}

function percent(){
  if(current === 'Error') return;
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

function backspace(){
  if(current === 'Error' || justEvaluated){ current = '0'; justEvaluated = false; }
  else if(current.length <= 1 || (current.length === 2 && current.startsWith('-'))) current = '0';
  else current = current.slice(0, -1);
  updateDisplay();
}

function clearAll(){
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

// ===== Button clicks =====
document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if(action === 'digit') inputDigit(btn.textContent);
    else if(action === 'decimal') inputDecimal();
    else if(action === 'operator') setOperator(btn.dataset.op);
    else if(action === 'equals') evaluate();
    else if(action === 'percent') percent();
    else if(action === 'backspace') backspace();
    else if(action === 'clear') clearAll();
  });
});

// ===== Keyboard support =====
const keyMap = { '*': '×', '/': '÷', '-': '−', '+': '+' };
document.addEventListener('keydown', (e) => {
  if(e.key >= '0' && e.key <= '9'){ inputDigit(e.key); return; }
  if(e.key === '.'){ inputDecimal(); return; }
  if(['*','/','-','+'].includes(e.key)){ setOperator(keyMap[e.key]); return; }
  if(e.key === 'Enter' || e.key === '='){ e.preventDefault(); evaluate(); return; }
  if(e.key === 'Backspace'){ backspace(); return; }
  if(e.key === 'Escape'){ clearAll(); return; }
  if(e.key === '%'){ percent(); return; }
});

updateDisplay();
