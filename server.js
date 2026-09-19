'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { calcular, OPERACIONES } = require('./calculator');

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function responder(res, operacion, a, b) {
  try {
    json(res, 200, { operacion, a: Number(a), b: Number(b), resultado: calcular(operacion, a, b) });
  } catch (err) {
    json(res, 400, { error: err.message });
  }
}

function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e4) { reject(new Error('Cuerpo demasiado grande')); req.destroy(); }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function manejarApi(req, res, url) {
  const ruta = url.pathname.replace(/^\/api\//, '');

  // POST /api/calcular  { operacion, a, b }
  if (ruta === 'calcular' && req.method === 'POST') {
    try {
      const { operacion, a, b } = JSON.parse((await leerCuerpo(req)) || '{}');
      return responder(res, operacion, a, b);
    } catch {
      return json(res, 400, { error: 'JSON inválido' });
    }
  }

  // GET /api/operaciones
  if (ruta === 'operaciones' && req.method === 'GET') {
    return json(res, 200, { operaciones: Object.keys(OPERACIONES) });
  }

  // GET /api/{sumar|restar|multiplicar|dividir}?a=1&b=2
  if (Object.hasOwn(OPERACIONES, ruta) && req.method === 'GET') {
    return responder(res, ruta, url.searchParams.get('a'), url.searchParams.get('b'));
  }

  json(res, 404, { error: 'Endpoint no encontrado' });
}

function servirEstatico(req, res, url) {
  const pedido = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const archivo = path.normalize(path.join(PUBLIC_DIR, pedido));
  if (!archivo.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403); return res.end('Prohibido');
  }
  fs.readFile(archivo, (err, contenido) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(archivo)] || 'application/octet-stream' });
    res.end(contenido);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return manejarApi(req, res, url);
  servirEstatico(req, res, url);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`Calculadora en http://localhost:${PORT}`));
}

module.exports = server;
