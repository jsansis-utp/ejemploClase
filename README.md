# Calculadora Pixel

Proyecto de una calculadora para la clase Devops 2026-2

Calculadora web con interfaz **pixel art** de estilo **dark** y una **API REST** para las operaciones elementales (sumar, restar, multiplicar y dividir). No tiene dependencias externas: solo requiere Node.js 18+.

## Uso

```bash
npm start        # http://localhost:3000  (PORT configurable)
npm test         # pruebas con node:test
```

La interfaz funciona con el ratón y con el teclado (`0-9`, `+ - * /`, `Enter`, `Backspace`, `Esc`).

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/sumar?a=1&b=2` | Suma |
| GET | `/api/restar?a=5&b=2` | Resta |
| GET | `/api/multiplicar?a=3&b=4` | Multiplicación |
| GET | `/api/dividir?a=8&b=2` | División |
| POST | `/api/calcular` | Cuerpo JSON: `{"operacion":"sumar","a":1,"b":2}` |
| GET | `/api/operaciones` | Lista de operaciones disponibles |

Respuesta correcta: `{"operacion":"sumar","a":1,"b":2,"resultado":3}`
Error (HTTP 400): `{"error":"No se puede dividir entre cero"}`

## Estructura

- `server.js`: servidor HTTP (API + archivos estáticos)
- `calculator.js`: lógica de las operaciones
- `public/`: interfaz (HTML, CSS y JS)
- `test/`: pruebas
