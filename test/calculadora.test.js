'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { calcular } = require('../calculator');
const server = require('../server');

test('operaciones elementales', () => {
  assert.strictEqual(calcular('sumar', 2, 3), 5);
  assert.strictEqual(calcular('restar', 2, 3), -1);
  assert.strictEqual(calcular('multiplicar', 4, 3), 12);
  assert.strictEqual(calcular('dividir', 9, 3), 3);
});

test('errores de validación', () => {
  assert.throws(() => calcular('dividir', 1, 0), /cero/);
  assert.throws(() => calcular('potencia', 1, 2), /no soportada/);
  assert.throws(() => calcular('sumar', 'x', 2), /números/);
  assert.throws(() => calcular('sumar', '', 2), /números/);
});

test('API HTTP', async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  try {
    let r = await fetch(`${base}/api/sumar?a=1.5&b=2`);
    assert.deepStrictEqual((await r.json()).resultado, 3.5);

    r = await fetch(`${base}/api/calcular`, {
      method: 'POST',
      body: JSON.stringify({ operacion: 'multiplicar', a: 6, b: 7 }),
    });
    assert.strictEqual((await r.json()).resultado, 42);

    r = await fetch(`${base}/api/dividir?a=1&b=0`);
    assert.strictEqual(r.status, 400);

    r = await fetch(`${base}/`);
    assert.strictEqual(r.status, 200);
  } finally {
    server.close();
  }
});
