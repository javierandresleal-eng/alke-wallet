// --- CONTROLADOR DINÁMICO CON PERSISTENCIA Y SOPORTE DE TEMA (js/app.js) ---

$(document).ready(function () {

    // ======================================================================
    // 🔐 AUTENTICACIÓN SIMULADA (Login)
    // ======================================================================
    if ($('#formLogin').length > 0) {
        $('#formLogin').on('submit', function (event) {
            event.preventDefault();

            const email = $('#email').val().trim();
            const password = $('#password').val();

            // Credenciales por defecto (simuladas)
            const defaultEmail = 'demo@alke.com';
            const defaultPass = 'demo123';

            // También se podría extender para leer usuarios desde localStorage
            const ok = (email === defaultEmail && password === defaultPass);

            if (ok) {
                localStorage.setItem('alke_current_user', JSON.stringify({ email }));
                window.location.href = 'menu.html';
            } else {
                // Mostrar feedback simple
                alert('Credenciales inválidas. Usuario de prueba: demo@alke.com / demo123');
            }
        });
    }


    // ==========================================================================
    // �️ MODO ÚNICO: SOLO MODO OSCURO
    // ==========================================================================
    const $body = $('body');
    $body.addClass('dark-mode');

    // ==========================================================================
    // 🏦 LÓGICA DE PERSISTENCIA Y CARGA
    // ==========================================================================
    let wallet = obtenerDatosWallet();

    if ($('.balance-card').length > 0) {
        $('.balance-card h2').text(formatearDinero(wallet.saldo));
    }

    if ($('#listaActividadReciente').length > 0) {
        actualizarMenuDesdeStorage();
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                actualizarMenuDesdeStorage();
            }
        });
    }

    function actualizarMenuDesdeStorage() {
        wallet = obtenerDatosWallet();
        actualizarSaldoUI(wallet);
        renderizarActividadReciente(wallet.movimientos, $('#listaActividadReciente'));
    }

    // ==========================================================================
    // 5. LÓGICA PARA TRANSACTIONS.HTML (BITÁCORA) - CORREGIDA
    // ==========================================================================
    const $listaUI = $('#listaMovimientosBitacora');

    if ($listaUI.length > 0) {
        // No mostramos movimientos por defecto: el usuario debe buscar o usar filtros
        $listaUI.html('<p class="text-muted text-center py-4">Use el buscador o los botones de filtro para mostrar movimientos.</p>');

        function aplicarFiltro(tipo) {
            $('#btnFiltroTodos, #btnFiltroIngresos, #btnFiltroEgresos').removeClass('active');
            if (tipo === 'todos') {
                $('#btnFiltroTodos').addClass('active');
            } else if (tipo === 'ingreso') {
                $('#btnFiltroIngresos').addClass('active');
            } else if (tipo === 'egreso') {
                $('#btnFiltroEgresos').addClass('active');
            }

            let lista = (wallet && wallet.movimientos) ? wallet.movimientos.slice() : [];
            if (tipo === 'ingreso') {
                lista = lista.filter(m => m.tipo === 'ingreso');
            } else if (tipo === 'egreso') {
                lista = lista.filter(m => m.tipo === 'egreso');
            }

            if (!lista || lista.length === 0) {
                $listaUI.html('<p class="text-muted text-center py-4">No se encontraron movimientos para el filtro seleccionado.</p>');
            } else {
                renderizarHistorial(lista, $listaUI);
            }
        }

        $('#btnFiltroTodos').on('click', function() { aplicarFiltro('todos'); });
        $('#btnFiltroIngresos').on('click', function() { aplicarFiltro('ingreso'); });
        $('#btnFiltroEgresos').on('click', function() { aplicarFiltro('egreso'); });
        $('#btnLimpiarPantalla').on('click', function() {
            $('#btnFiltroTodos, #btnFiltroIngresos, #btnFiltroEgresos').removeClass('active');
            $('#inputBuscarMovimiento').val('');
            $listaUI.html('<p class="text-muted text-center py-4">Use el buscador o los botones de filtro para mostrar movimientos.</p>');
        });

        // Buscador: filtra entre los movimientos y muestra solo resultados
        $('#inputBuscarMovimiento').on('keyup', function() {
            const texto = $(this).val().toLowerCase().trim();
            if (!texto) {
                $listaUI.html('<p class="text-muted text-center py-4">Use el buscador o los botones de filtro para mostrar movimientos.</p>');
                return;
            }

            const lista = (wallet && wallet.movimientos) ? wallet.movimientos.filter(function(m) {
                const combinado = ((m.detalle || '') + ' ' + (m.subtitulo || '') + ' ' + (m.fecha || '')).toLowerCase();
                return combinado.indexOf(texto) !== -1;
            }) : [];

            if (lista.length === 0) {
                $listaUI.html('<p class="text-muted text-center py-4">No se encontraron movimientos para la búsqueda.</p>');
            } else {
                renderizarHistorial(lista, $listaUI);
            }
        });
    }

    // FUNCIÓN DE RENDERIZADO CORREGIDA (Sin clases "text-white" forzadas)
    function renderizarHistorial(movimientos, $contenedor) {
        $contenedor.empty();

        if (!movimientos || movimientos.length === 0) {
            $contenedor.html('<p class="text-muted text-center py-4">No se registran movimientos en el historial.</p>');
            return;
        }

        movimientos.forEach(function (item) {
            const monto = Number(item.monto);
            // Preferir el tipo explícito si viene en los datos; si no, inferir por signo
            const tipoReal = (item.tipo === 'ingreso' || item.tipo === 'egreso') ? item.tipo : (monto >= 0 ? 'ingreso' : 'egreso');
            const esIngreso = tipoReal === 'ingreso';
            const claseTipo = tipoReal;
            const claseColor = esIngreso ? 'text-success' : 'text-danger';
            const icono = esIngreso ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
            const signo = esIngreso ? '+' : '-';
            const montoFormateado = formatearDinero(Math.abs(monto));

            const filaHTML = `
                <div class="list-group-item transaccion-item ${claseTipo} d-flex justify-content-between align-items-center py-3 border-bottom mb-2" data-tipo="${claseTipo}">
                    <div class="d-flex align-items-center">
                        <div class="p-2 rounded-circle me-3 ${claseColor}" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05);">
                            <i class="bi ${icono} fs-5"></i>
                        </div>
                        <div>
                            <p class="mb-0 fw-bold" style="color: var(--texto-principal);">${item.detalle || item.descripcion}</p>
                            <small class="text-muted d-block">${item.fecha} • ${item.subtitulo}</small>
                        </div>
                    </div>
                    <span class="${claseColor} fw-bold fs-5">${signo}${montoFormateado}</span>
                </div>
            `;
            $contenedor.append(filaHTML);
        });
    }

    function actualizarSaldoUI(walletData) {
        if ($('.balance-card').length > 0) {
            $('.balance-card h2').text(formatearDinero(walletData.saldo));
        }
    }

    function renderizarActividadReciente(movimientos, $contenedor) {
        $contenedor.empty();

        if (!movimientos || movimientos.length === 0) {
            $contenedor.html('<li class="list-group-item text-center py-4" style="background: transparent;"><p class="text-muted mb-0">No hay actividad reciente.</p></li>');
            return;
        }

        movimientos.slice(0, 3).forEach(function (item) {
            const monto = Number(item.monto);
            const tipoReal = (item.tipo === 'ingreso' || item.tipo === 'egreso') ? item.tipo : (monto >= 0 ? 'ingreso' : 'egreso');
            const esIngreso = tipoReal === 'ingreso';
            const claseColor = esIngreso ? 'text-success' : 'text-danger';
            const icono = esIngreso ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
            const signo = esIngreso ? '+' : '-';
            const montoFormateado = formatearDinero(Math.abs(monto));

            const itemHTML = `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3 border-bottom" style="background: transparent;">
                    <div class="d-flex align-items-center">
                        <div class="bg-${esIngreso ? 'success' : 'danger'} bg-opacity-25 p-2 rounded-circle me-3 ${claseColor}">
                            <i class="bi ${icono} fs-5"></i>
                        </div>
                        <div>
                            <p class="mb-0 fw-bold" style="color: var(--texto-principal);">${item.detalle || item.descripcion}</p>
                            <small class="text-muted">${item.subtitulo}</small>
                        </div>
                    </div>
                    <span class="${claseColor} fw-bold">${signo}${montoFormateado}</span>
                </li>
            `;
            $contenedor.append(itemHTML);
        });
    }

    function formatearFecha(fecha) {
        return fecha.toLocaleString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function registrarMovimiento(tipo, detalle, subtitulo, monto) {
        const movimiento = {
            tipo,
            detalle,
            subtitulo,
            monto,
            fecha: formatearFecha(new Date())
        };
        wallet.movimientos.unshift(movimiento);
        guardarDatosWallet(wallet);
    }

    if ($('#formDeposit').length > 0) {
        $('#formDeposit').on('submit', function (event) {
            event.preventDefault();

            const monto = parseFloat($('#amount').val());
            const origen = $('#sourceAccount').val();
            const descripcionOrigen = origen === 'transferencia' ? 'Transferencia Bancaria' : origen === 'servipag' ? 'Servipag' : 'Webpay Plus';

            if (Number.isNaN(monto) || monto <= 0) {
                alert('Ingrese un monto válido mayor a cero.');
                return;
            }

            wallet.saldo += monto;
            registrarMovimiento('ingreso', 'Depósito de Fondos', `Abono vía ${descripcionOrigen}`, monto);
            actualizarSaldoUI(wallet);
            alert('Depósito registrado con éxito.');
            window.location.href = 'menu.html';
        });
    }

    if ($('#formSendMoney').length > 0) {
        $('#formSendMoney').on('submit', function (event) {
            event.preventDefault();
            const monto = parseFloat($('#transferAmount').val());
            const destinatario = $('#recipient').length ? $('#recipient').val().trim() : '';

            if (Number.isNaN(monto) || monto <= 0) {
                alert('Ingrese un monto válido mayor a cero para la transferencia.');
                return;
            }

            if (!destinatario) {
                alert('Ingrese o seleccione un destinatario para la transferencia.');
                return;
            }

            if (monto > wallet.saldo) {
                alert('Saldo insuficiente para completar la transferencia.');
                return;
            }

            wallet.saldo -= monto;
            registrarMovimiento('egreso', destinatario || 'Transferencia enviada', 'Pago a destinatario frecuente', monto);
            actualizarSaldoUI(wallet);
            alert('Transferencia registrada con éxito.');
            window.location.href = 'menu.html';
        });
    }

    // Poblar datalist de contactos si existe en la página
    if ($('#listaContactos').length > 0) {
        const contactos = (wallet && wallet.contactos) ? wallet.contactos : [];
        contactos.forEach(function (c) {
            const nombre = c.nombre || c.name || '';
            if (nombre) {
                $('#listaContactos').append(`<option value="${nombre}"></option>`);
            }
        });
    }
});