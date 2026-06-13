// --- SISTEMA DE ALMACENAMIENTO CENTRAL (Billetera Digital) ---

// Estado inicial simulado de la cuenta (enfoque institucional)
const estadoInicial = {
    saldo: 11547.54,
    usuario: "Grumete Ihor",
    contactos: [
        { nombre: "Maryland Winkles", cuenta: "0x9ECB...596FF" },
        { nombre: "Edgar Torrey", cuenta: "0x7A47...CB4B" },
        { nombre: "Benedict Cumberbatch", cuenta: "Banco - 0070 8822 1102" }
    ],
    movimientos: [
        { tipo: "ingreso", detalle: "Depósito de Fondos", subtitulo: "Abono vía Webpay", monto: 5000, fecha: "11 Jun 2026, 09:15 AM" },
        { tipo: "egreso", detalle: "Benedict Cumberbatch", subtitulo: "Transferencia enviada", monto: 1500, fecha: "11 Jun 2026, 08:30 AM" },
        { tipo: "ingreso", detalle: "Maryland Winkles", subtitulo: "Abono Recibido", monto: 2450, fecha: "10 Jun 2026, 04:12 PM" }
    ]
};

// Función global para obtener los datos actualizados desde localStorage
function obtenerDatosWallet() {
    const datos = localStorage.getItem('alke_wallet_data');
    if (!datos) {
        // Si es la primera vez que abre la app, guardamos el estado inicial
        localStorage.setItem('alke_wallet_data', JSON.stringify(estadoInicial));
        return JSON.parse(JSON.stringify(estadoInicial));
    }

    try {
        return JSON.parse(datos);
    } catch (err) {
        // Si hay datos corruptos en localStorage, reestablecemos al estado inicial
        console.error('alke_wallet_data corrupted, resetting to default.', err);
        localStorage.setItem('alke_wallet_data', JSON.stringify(estadoInicial));
        return JSON.parse(JSON.stringify(estadoInicial));
    }
}

// Función global para guardar los cambios en localStorage
function guardarDatosWallet(nuevosDatos) {
    localStorage.setItem('alke_wallet_data', JSON.stringify(nuevosDatos));
}

// Función auxiliar para formatear dinero como CLP ($ 11.548)
function formatearDinero(monto) {
    const n = Number(monto) || 0;
    const fixed = n.toFixed(3); // siempre con 3 decimales según requerimiento
    const parts = fixed.split('.');
    let entero = parts[0];
    const decimales = parts[1];

    // Separador de miles con puntos
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Unimos con punto también para los decimales (solo puntos, sin comas)
    return '$' + entero + '.' + decimales;
}