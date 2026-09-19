'use strict';

const OPERACIONES = {
  sumar: (a, b) => a + b,
  restar: (a, b) => a - b,
  multiplicar: (a, b) => a * b,
  dividir: (a, b) => {
    if (b === 0) throw new Error('No se puede dividir entre cero');
    return a / b;
  },
};

function calcular(operacion, a, b) {
  const fn = Object.hasOwn(OPERACIONES, operacion) ? OPERACIONES[operacion] : null;
  if (!fn) throw new Error(`Operación no soportada: ${operacion}`);
  const x = Number(a);
  const y = Number(b);
  if (a === '' || b === '' || a == null || b == null || !Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('Los operandos deben ser números válidos');
  }
  const resultado = fn(x, y);
  if (!Number.isFinite(resultado)) throw new Error('El resultado está fuera de rango');
  return resultado;
}

module.exports = { calcular, OPERACIONES };
