'use strict';

const SIMBOLOS = { sumar: '+', restar: '−', multiplicar: '×', dividir: '÷' };
const MAX_DIGITOS = 12;

const elValor = document.getElementById('valor');
const elHistorial = document.getElementById('historial');

const estado = {
  actual: '0',       // lo que se está escribiendo
  previo: null,      // operando izquierdo (string)
  operacion: null,   // operación pendiente
  reiniciar: false,  // el siguiente dígito reemplaza la pantalla
  error: false,
};

function formatear(n) {
  const s = String(n);
  if (s.length <= MAX_DIGITOS) return s;
  const exp = Number(n).toExponential(6).replace(/\.?0+e/, 'e');
  return exp;
}

function pintar() {
  elValor.textContent = estado.actual;
  elValor.classList.toggle('error', estado.error);
  elHistorial.textContent = estado.operacion
    ? `${estado.previo} ${SIMBOLOS[estado.operacion]}`
    : ' ';
  document.querySelectorAll('[data-op]').forEach((b) =>
    b.classList.toggle('activa', b.dataset.op === estado.operacion && estado.reiniciar));
}

async function llamarApi(operacion, a, b) {
  const res = await fetch('/api/calcular', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operacion, a, b }),
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error');
  return datos.resultado;
}

async function resolver() {
  if (!estado.operacion || estado.previo === null) return true;
  try {
    const r = await llamarApi(estado.operacion, estado.previo, estado.actual);
    estado.actual = formatear(r);
    return true;
  } catch (err) {
    estado.actual = err.message.toUpperCase().slice(0, 24);
    estado.error = true;
    estado.previo = null;
    estado.operacion = null;
    return false;
  }
}

function limpiar() {
  Object.assign(estado, { actual: '0', previo: null, operacion: null, reiniciar: false, error: false });
}

function digito(d) {
  if (estado.error) limpiar();
  if (estado.reiniciar) { estado.actual = '0'; estado.reiniciar = false; }
  if (estado.actual.replace(/[-.]/g, '').length >= MAX_DIGITOS) return;
  estado.actual = estado.actual === '0' ? d : estado.actual + d;
}

function punto() {
  if (estado.error) limpiar();
  if (estado.reiniciar) { estado.actual = '0'; estado.reiniciar = false; }
  if (!estado.actual.includes('.')) estado.actual += '.';
}

function retroceso() {
  if (estado.error || estado.reiniciar) return;
  estado.actual = estado.actual.length > 1 && !(estado.actual.length === 2 && estado.actual[0] === '-')
    ? estado.actual.slice(0, -1) : '0';
}

function signo() {
  if (estado.error || estado.actual === '0') return;
  estado.actual = estado.actual.startsWith('-') ? estado.actual.slice(1) : '-' + estado.actual;
}

async function operar(op) {
  if (estado.error) return;
  // Si ya hay una operación pendiente y se escribió un segundo operando, se encadena.
  if (estado.operacion && !estado.reiniciar) {
    if (!(await resolver())) return;
  }
  estado.previo = estado.actual;
  estado.operacion = op;
  estado.reiniciar = true;
}

async function igual() {
  if (estado.error || !estado.operacion) return;
  const ok = await resolver();
  if (ok) { estado.previo = null; estado.operacion = null; estado.reiniciar = true; }
}

async function ejecutar(accion) {
  if (accion.num !== undefined) digito(accion.num);
  else if (accion.op) await operar(accion.op);
  else if (accion.accion === 'limpiar') limpiar();
  else if (accion.accion === 'retroceso') retroceso();
  else if (accion.accion === 'signo') signo();
  else if (accion.accion === 'punto') punto();
  else if (accion.accion === 'igual') await igual();
  pintar();
}

document.getElementById('teclas').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn) ejecutar({ ...btn.dataset });
});

const TECLADO = { '+': 'sumar', '-': 'restar', '*': 'multiplicar', '/': 'dividir' };
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  let accion = null;
  if (/^\d$/.test(e.key)) accion = { num: e.key };
  else if (TECLADO[e.key]) accion = { op: TECLADO[e.key] };
  else if (e.key === '.' || e.key === ',') accion = { accion: 'punto' };
  else if (e.key === 'Enter' || e.key === '=') accion = { accion: 'igual' };
  else if (e.key === 'Backspace') accion = { accion: 'retroceso' };
  else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') accion = { accion: 'limpiar' };
  if (!accion) return;
  e.preventDefault();
  ejecutar(accion);
});

pintar();
