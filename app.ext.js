// Extensión de app.js: toasts, registro simple y gestión de contactos
(function(){
    // init on DOM ready
    function initExt(){
        if (typeof $ === 'undefined') return;
        // utilities
        function initToasts(){
            if (!document.getElementById('toastContainer')){
                const cont = document.createElement('div');
                cont.id = 'toastContainer';
                cont.className = 'position-fixed top-0 end-0 p-3';
                cont.style.zIndex = '1080';
                document.body.appendChild(cont);
            }
        }
        function showToast(message, type='info', delay=2200){
            initToasts();
            const id = 't'+Date.now();
            const bg = type==='success' ? 'bg-success text-white' : type==='danger' ? 'bg-danger text-white' : 'bg-secondary text-white';
            const html = `<div id="${id}" class="toast ${bg} align-items-center border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}"><div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`;
            $('#toastContainer').append(html);
            const el = document.getElementById(id);
            const bs = new bootstrap.Toast(el);
            bs.show();
            setTimeout(()=>{try{$(el).remove()}catch(e){}}, delay+500);
        }

        // Replace window alert usages by intercepting forms to show toasts when necessary
        // Deposit form
        if ($('#formDeposit').length){
            $('#formDeposit').off('submit').on('submit', function(e){
                e.preventDefault();
                const monto = parseFloat($('#amount').val());
                const origen = $('#sourceAccount').val();
                const descripcionOrigen = origen === 'transferencia' ? 'Transferencia Bancaria' : origen === 'servipag' ? 'Servipag' : 'Webpay Plus';
                if (Number.isNaN(monto) || monto <= 0){ showToast('Ingrese un monto válido mayor a cero.','danger'); return; }
                const wallet = window.obtenerDatosWallet();
                wallet.saldo += monto;
                window.guardarDatosWallet(wallet);
                if ($('.balance-card').length) $('.balance-card h2').text(window.formatearDinero(wallet.saldo));
                showToast('Depósito registrado con éxito.','success');
                setTimeout(()=> window.location.href='menu.html',900);
            });
        }
        // Send money: keep existing but ensure toasts
        if ($('#formSendMoney').length){
            $('#formSendMoney').off('submit').on('submit', function(e){
                e.preventDefault();
                const monto = parseFloat($('#transferAmount').val());
                const destinatario = $('#recipient').val() ? $('#recipient').val().trim() : '';
                const wallet = window.obtenerDatosWallet();
                if (Number.isNaN(monto) || monto <= 0){ showToast('Ingrese un monto válido mayor a cero para la transferencia.','danger'); return; }
                if (!destinatario){ showToast('Ingrese o seleccione un destinatario para la transferencia.','danger'); return; }
                if (monto > wallet.saldo){ showToast('Saldo insuficiente para completar la transferencia.','danger'); return; }
                wallet.saldo -= monto;
                wallet.movimientos.unshift({ tipo:'egreso', detalle: destinatario, subtitulo:'Pago', monto: monto, fecha: (new Date()).toLocaleString() });
                window.guardarDatosWallet(wallet);
                if ($('.balance-card').length) $('.balance-card h2').text(window.formatearDinero(wallet.saldo));
                showToast('Transferencia registrada con éxito.','success');
                setTimeout(()=> window.location.href='menu.html',900);
            });
        }

        // Contacts modal actions (if present)
        if ($('#formAddContact').length){
            $('#formAddContact').off('submit').on('submit', function(e){
                e.preventDefault();
                const nombre = $('#contactName').val().trim();
                const cuenta = $('#contactAccount').val().trim();
                if (!nombre){ showToast('Ingrese un nombre válido para el contacto.','danger'); return; }
                const wallet = window.obtenerDatosWallet();
                wallet.contactos = wallet.contactos || [];
                wallet.contactos.push({ nombre, cuenta });
                window.guardarDatosWallet(wallet);
                $('#modalContactos').modal('hide');
                showToast('Contacto agregado.','success');
                // refresh datalist
                if ($('#listaContactos').length){ $('#listaContactos').append(`<option value="${nombre}"></option>`); }
                if ($('#listaContactosModal').length){ $('#listaContactosModal').append(`<li class="list-group-item d-flex justify-content-between align-items-center"><div><strong>${nombre}</strong><div class="text-muted small">${cuenta}</div></div><button class="btn btn-sm btn-outline-danger btn-eliminar-contacto">Eliminar</button></li>`); }
                $(this)[0].reset();
            });
            $(document).on('click','.btn-eliminar-contacto', function(){
                const $li = $(this).closest('li');
                const nombre = $li.find('strong').text();
                const wallet = window.obtenerDatosWallet();
                wallet.contactos = (wallet.contactos || []).filter(c => c.nombre !== nombre);
                window.guardarDatosWallet(wallet);
                $li.remove();
                showToast('Contacto eliminado.','success');
                // rebuild datalist
                if ($('#listaContactos').length){ $('#listaContactos').empty(); (window.obtenerDatosWallet().contactos||[]).forEach(c=>$('#listaContactos').append(`<option value="${c.nombre}"></option>`)); }
            });
        }

        // registration small handler if present (formRegister)
        if ($('#formRegister').length){
            $('#formRegister').off('submit').on('submit', function(e){
                e.preventDefault();
                const email = $('#regEmail').val().trim();
                const pass = $('#regPassword').val();
                const pass2 = $('#regPassword2').val();
                const raw = localStorage.getItem('alke_users');
                const users = raw ? JSON.parse(raw) : [];
                if (!email || !pass){ showToast('Complete correo y contraseña.','danger'); return; }
                if (pass !== pass2){ showToast('Las contraseñas no coinciden.','danger'); return; }
                if (users.find(u=>u.email===email)){ showToast('Usuario ya registrado.','danger'); return; }
                users.push({ email, password: pass });
                localStorage.setItem('alke_users', JSON.stringify(users));
                localStorage.setItem('alke_current_user', JSON.stringify({ email }));
                showToast('Registro exitoso. Bienvenido!','success');
                setTimeout(()=> window.location.href='menu.html',900);
            });
        }
    }

    if (document.readyState==='complete' || document.readyState==='interactive') initExt();
    else document.addEventListener('DOMContentLoaded', initExt);
})();
