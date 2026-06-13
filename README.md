# alke-wallet

Proyecto: Alke Wallet — Frontend (Módulo 2)

Instrucciones rápidas para pruebas locales

- Abrir `index.html` en el navegador (abre `login.html`).
- Credenciales de prueba para autenticación simulada:
	- Email: `demo@alke.com`
	- Password: `demo123`
- Flujo principal:
	1. Iniciar sesión con las credenciales de prueba.
	2. En `menu.html` revisar saldo y navegar a `deposit.html` o `sendmoney.html`.
	3. En `deposit.html` realizar un depósito (se actualiza en `localStorage`).
	4. En `sendmoney.html` seleccionar un `Destinatario` desde la lista (proviene de `datos.js`) o escribir uno nuevo, ingresar el monto y confirmar la transferencia.
	5. Verificar `transactions.html` para el historial actualizado.

Archivos importantes

- `login.html`, `menu.html`, `deposit.html`, `sendmoney.html`, `transactions.html`
- `app.js` — lógica de UI, validaciones y persistencia (usa `datos.js`).
- `datos.js` — estado inicial simulado y funciones de persistencia.
- `estilos.css` — estilos y variables de tema.
