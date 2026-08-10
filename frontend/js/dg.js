document.addEventListener("DOMContentLoaded", function () {
    
    const pathname = window.location.pathname;

    // Esta arregla los menus que no me aparecen los iconos
    resaltarMenuActivo();

    // Arrays Globales para que el fiktro sea en corto
    let allClientes = [];
    let allPolizas = [];
    let allTickets = [];
    let allReportes = [];

    // Detectar que modulos cargar
    if (pathname.includes("indexdg.html") || pathname.endsWith("/")) {
        cargarResumen();
    }
    if (pathname.includes("clientes_dg.html")) { cargarClientes(); setFiltrosClientes(); }
    if (pathname.includes("polizas_dg.html")) { cargarPolizas(); setFiltrosPolizas(); }
    if (pathname.includes("tickets_dg.html")) { cargarTickets(); setFiltrosTickets(); }
    if (pathname.includes("reportes_dg.html")) { cargarReportes(); setFiltrosReportes(); }
    if (pathname.includes("perfil_dg.html")) { cargarPerfil(); setPerfilEventos(); }

    /* PERFIL DG*/

    function cargarPerfil() {
        fetch("../../backend_web/dg/dg_perfil.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    const p = datos.perfil;
                    document.getElementById('dgNombre').value = p.nombresEmp;
                    document.getElementById('dgApellido').value = p.apellidosEmp;
                    document.getElementById('dgCorreo').value = p.emailEmp;
                    
                    document.getElementById('dgFullName').textContent = `${p.nombresEmp} ${p.apellidosEmp}`;
                    document.getElementById('dgEmail').textContent = p.emailEmp;
                    
                    // Extraer iniciales
                    const inicial1 = p.nombresEmp.charAt(0).toUpperCase();
                    const inicial2 = p.apellidosEmp.charAt(0).toUpperCase();
                    document.getElementById('dgInitials').textContent = inicial1 + inicial2;
                }
            }).catch(err => console.error("Error Perfil:", err));
    }

    function setPerfilEventos() {
        // Mostrar/Ocultar Contraseña
        const btnToggle = document.getElementById('btnTogglePass');
        if(btnToggle) {
            btnToggle.addEventListener('click', () => {
                const inputPass = document.getElementById('dgPassword');
                const icon = btnToggle.querySelector('i');
                if(inputPass.type === 'password'){
                    inputPass.type = 'text';
                    icon.classList.replace('bi-eye', 'bi-eye-slash');
                } else {
                    inputPass.type = 'password';
                    icon.classList.replace('bi-eye-slash', 'bi-eye');
                }
            });
        }

        // Enviar Formulario
        const formPerfil = document.getElementById('formPerfilDG');
        if(formPerfil) {
            formPerfil.addEventListener('submit', (e) => {
                e.preventDefault();
                const btnSubmit = formPerfil.querySelector('button[type="submit"]');
                btnSubmit.disabled = true;

                const formData = new FormData();
                formData.append('nombre', document.getElementById('dgNombre').value);
                formData.append('apellido', document.getElementById('dgApellido').value);
                formData.append('correo', document.getElementById('dgCorreo').value);
                formData.append('password', document.getElementById('dgPassword').value);

                fetch("../../backend_web/dg/actualizar_perfil_dg.php", {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(datos => {
                    btnSubmit.disabled = false;
                    const alertExito = document.getElementById('profileAlert');
                    const alertError = document.getElementById('profileError');
                    
                    if (datos.success) {
                        alertError.classList.add('d-none');
                        alertExito.classList.remove('d-none');
                        document.getElementById('dgPassword').value = ""; // Limpiar campo
                        cargarPerfil(); // Recargar datos visuales
                        setTimeout(() => alertExito.classList.add('d-none'), 3000);
                    } else {
                        alertExito.classList.add('d-none');
                        alertError.textContent = datos.mensaje;
                        alertError.classList.remove('d-none');
                    }
                })
                .catch(err => {
                    btnSubmit.disabled = false;
                    console.error("Error al actualizar:", err);
                });
            });
        }
    }

    /* DASHBOARD PRINCIPAL (este es del indexdg.html xd)*/
    function cargarResumen() {
        fetch("../../backend_web/dg/dg_resumen.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    // Mapear nombre y contadores
                    document.getElementById("nombreDirector").textContent = datos.usuario;
                    document.getElementById("totClientes").textContent = datos.clientes;
                    document.getElementById("totPolizas").textContent = datos.polizas;
                    document.getElementById("totTickets").textContent = datos.tickets;

                    // Dibuja Graficas
                    if(document.getElementById('chartPolizas')){
                        dibujarGraficaPolizas(datos.graficas.polizas_plan);
                        dibujarGraficaTickets(datos.graficas.tickets_status);
                    }
                }
            }).catch(err => console.error("Error Resumen:", err));
    }

    function dibujarGraficaPolizas(datosPlanes) {
        const labels = datosPlanes.map(item => item.nombreP);
        const data = datosPlanes.map(item => item.cantidad);
        new Chart(document.getElementById('chartPolizas'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pólizas Contratadas',
                    data: data,
                    backgroundColor: ['rgba(32, 201, 151, 0.6)', 'rgba(25, 135, 84, 0.6)', 'rgba(20, 108, 67, 0.6)'],
                    borderColor: ['#20c997', '#198754', '#146c43'],
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function dibujarGraficaTickets(datosTickets) {
        const labels = datosTickets.map(item => item.statusT);
        const data = datosTickets.map(item => item.cantidad);
        new Chart(document.getElementById('chartTickets'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#6c757d'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
        });
    }

    /* MODULO CLIENTES*/
    function cargarClientes() {
        fetch("../../backend_web/dg/dg_clientes.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    allClientes = datos.clientes;
                    renderClientes(allClientes);
                }
            });
    }

    function renderClientes(lista) {
        const tbody = document.getElementById("tablaClientes");
        if (lista.length > 0) {
            tbody.innerHTML = lista.map(c => `
                <tr>
                    <td class="fw-bold text-secondary">#${c.idCliente}</td>
                    <td class="fw-semibold text-dark">${c.nombreC} ${c.apellidoC}</td>
                    <td>
                        <div><i class="bi bi-envelope text-success me-1"></i> ${c.correoC}</div>
                        <div class="small text-secondary"><i class="bi bi-telephone text-success me-1"></i> ${c.telefonoC}</div>
                    </td>
                    <td>${c.fechaAltaC}</td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-secondary">No se encontraron clientes.</td></tr>`;
        }
    }

    function setFiltrosClientes() {
        document.getElementById('btnFiltrarCli').addEventListener('click', () => {
            const texto = document.getElementById('filtroCliTexto').value.toLowerCase();
            const desde = document.getElementById('filtroCliDesde').value;
            const hasta = document.getElementById('filtroCliHasta').value;

            const filtrados = allClientes.filter(c => {
                const coincideTexto = c.nombreC.toLowerCase().includes(texto) || c.apellidoC.toLowerCase().includes(texto) || c.correoC.toLowerCase().includes(texto);
                const coincideDesde = !desde || c.fechaAltaC >= desde;
                const coincideHasta = !hasta || c.fechaAltaC <= hasta;
                return coincideTexto && coincideDesde && coincideHasta;
            });
            renderClientes(filtrados);
        });

        document.getElementById('btnLimpiarCli').addEventListener('click', () => {
            document.getElementById('filtroCliTexto').value = '';
            document.getElementById('filtroCliDesde').value = '';
            document.getElementById('filtroCliHasta').value = '';
            renderClientes(allClientes);
        });
    }

    /* MoDULO POLIZAS */
    function cargarPolizas() {
        fetch("../../backend_web/dg/dg_polizas.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    allPolizas = datos.polizas;
                    renderPolizas(allPolizas);
                }
            });
    }

    function renderPolizas(lista) {
        const tbody = document.getElementById("tablaPolizas");
        if (lista.length > 0) {
            tbody.innerHTML = lista.map(p => `
                <tr>
                    <td class="fw-bold text-secondary">ETS-${String(p.idPoliza).padStart(3, "0")}</td>
                    <td class="fw-semibold text-dark">${p.nombreEmpresaP}</td>
                    <td>${p.nombreC} ${p.apellidoC}</td>
                    <td><span class="badge bg-light text-dark border">${p.nombreP}</span></td>
                    <td><span class="badge ${obtenerColorPoliza(p.estadoP)}">${p.estadoP}</span></td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No se encontraron pólizas.</td></tr>`;
        }
    }

    function setFiltrosPolizas() {
        document.getElementById('btnFiltrarPol').addEventListener('click', () => {
            const texto = document.getElementById('filtroPolTexto').value.toLowerCase();
            const plan = document.getElementById('filtroPolPlan').value;
            const estado = document.getElementById('filtroPolEstado').value;

            const filtradas = allPolizas.filter(p => {
                const coincideTexto = p.nombreEmpresaP.toLowerCase().includes(texto) || p.nombreC.toLowerCase().includes(texto);
                const coincidePlan = !plan || p.nombreP === plan;
                const coincideEstado = !estado || p.estadoP === estado;
                return coincideTexto && coincidePlan && coincideEstado;
            });
            renderPolizas(filtradas);
        });

        document.getElementById('btnLimpiarPol').addEventListener('click', () => {
            document.getElementById('filtroPolTexto').value = '';
            document.getElementById('filtroPolPlan').value = '';
            document.getElementById('filtroPolEstado').value = '';
            renderPolizas(allPolizas);
        });
    }

    /* MODULO TICKETS*/
    function cargarTickets() {
        fetch("../../backend_web/dg/dg_tickets.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    allTickets = datos.tickets;
                    renderTickets(allTickets);
                }
            });
    }

    function renderTickets(lista) {
        const tbody = document.getElementById("tablaTickets");
        if (lista.length > 0) {
            tbody.innerHTML = lista.map(t => {
                const tecnico = t.nombresEmp ? t.nombresEmp : `<span class="text-warning small">Sin asignar</span>`;
                return `
                <tr>
                    <td class="fw-bold text-secondary">TKT-${String(t.idTicket).padStart(3, "0")}</td>
                    <td class="fw-semibold text-dark">${t.conceptoT}</td>
                    <td>${t.nombreEmpresaP}</td>
                    <td>${tecnico}</td>
                    <td>${t.fechaCreacionT}</td>
                    <td><span class="badge ${obtenerColorTicket(t.statusT)}">${t.statusT}</span></td>
                </tr>`;
            }).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-secondary">No se encontraron tickets.</td></tr>`;
        }
    }

    function setFiltrosTickets() {
        document.getElementById('btnFiltrarTkt').addEventListener('click', () => {
            const texto = document.getElementById('filtroTktTexto').value.toLowerCase();
            const estado = document.getElementById('filtroTktEstado').value;

            const filtrados = allTickets.filter(t => {
                const coincideTexto = t.conceptoT.toLowerCase().includes(texto) || t.nombreEmpresaP.toLowerCase().includes(texto);
                const coincideEstado = !estado || t.statusT === estado;
                return coincideTexto && coincideEstado;
            });
            renderTickets(filtrados);
        });

        document.getElementById('btnLimpiarTkt').addEventListener('click', () => {
            document.getElementById('filtroTktTexto').value = '';
            document.getElementById('filtroTktEstado').value = '';
            renderTickets(allTickets);
        });
    }

    /* MODULO REPORTES (Cruza toda la BD) */
    function cargarReportes() {
        fetch("../../backend_web/dg/dg_reportes.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    allReportes = datos.data;
                    renderReportes(allReportes);
                }
            });
    }

    function renderReportes(lista) {
        const tbody = document.getElementById("tablaReportes");
        if (lista.length > 0) {
            tbody.innerHTML = lista.map(r => {
                const tecnico = r.nombresEmp ? `${r.nombresEmp} ${r.apellidosEmp||''}` : 'No asignado';
                return `
                <tr>
                    <td class="fw-bold text-secondary">TKT-${r.idTicket}</td>
                    <td><span class="d-inline-block text-truncate" style="max-width: 150px;">${r.conceptoT}</span></td>
                    <td class="fw-semibold text-dark">${r.nombreEmpresaP}</td>
                    <td><span class="badge bg-light text-dark border">${r.plan}</span></td>
                    <td class="small text-secondary">${tecnico}</td>
                    <td>${r.fechaCreacionT}</td>
                    <td><span class="badge ${obtenerColorTicket(r.ticket_status)}">${r.ticket_status}</span></td>
                </tr>`;
            }).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-secondary">Ajuste los filtros. Sin resultados.</td></tr>`;
        }
    }

    function setFiltrosReportes() {
        document.getElementById('btnGenerarReporte').addEventListener('click', () => {
            const desde = document.getElementById('repDesde').value;
            const hasta = document.getElementById('repHasta').value;
            const tStatus = document.getElementById('repTicketStatus').value;
            const pPlan = document.getElementById('repPolizaPlan').value;
            const busqueda = document.getElementById('repBusqueda').value.toLowerCase();

            const filtrados = allReportes.filter(r => {
                const cDesde = !desde || r.fechaCreacionT >= desde;
                const cHasta = !hasta || r.fechaCreacionT <= hasta;
                const cStatus = !tStatus || r.ticket_status === tStatus;
                const cPlan = !pPlan || r.plan === pPlan;
                
                const tecnico = r.nombresEmp ? r.nombresEmp.toLowerCase() : '';
                const cBusqueda = !busqueda || 
                    r.nombreEmpresaP.toLowerCase().includes(busqueda) || 
                    r.conceptoT.toLowerCase().includes(busqueda) || 
                    r.nombreC.toLowerCase().includes(busqueda) ||
                    tecnico.includes(busqueda);

                return cDesde && cHasta && cStatus && cPlan && cBusqueda;
            });

            // Guarda la matriz temporalmente en otra variable por si queremos exportar el filtro actual
            window.reporteFiltrado = filtrados; 
            renderReportes(filtrados);
        });

        document.getElementById('btnLimpiarReporte').addEventListener('click', () => {
            document.getElementById('repDesde').value = '';
            document.getElementById('repHasta').value = '';
            document.getElementById('repTicketStatus').value = '';
            document.getElementById('repPolizaPlan').value = '';
            document.getElementById('repBusqueda').value = '';
            window.reporteFiltrado = allReportes;
            renderReportes(allReportes);
        });

        document.getElementById('btnExportarCSV').addEventListener('click', () => {
            const datosAExportar = window.reporteFiltrado || allReportes;
            if(datosAExportar.length === 0){
                alert("No hay datos para exportar."); return;
            }

            let csv = "ID Ticket,Concepto Falla,Empresa,Plan Contratado,Cliente Responsable,Tecnico Asignado,Fecha Creacion,Status Ticket,Status Poliza\n";
            datosAExportar.forEach(r => {
                const tecnico = r.nombresEmp ? `${r.nombresEmp} ${r.apellidosEmp||''}` : 'No asignado';
                const cliente = `${r.nombreC} ${r.apellidoC}`;
                // Escapar comillas en concepto
                const concepto = `"${r.conceptoT.replace(/"/g, '""')}"`;
                
                csv += `${r.idTicket},${concepto},"${r.nombreEmpresaP}","${r.plan}","${cliente}","${tecnico}","${r.fechaCreacionT}","${r.ticket_status}","${r.poliza_status}"\n`;
            });

            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_ETS_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    /*FUNCIONES AUXILIARES (este ayuda a todos los menus y a evitar que se rompan JASJKAJS)*/
    function obtenerColorPoliza(estado) {
        if (estado === "Activa") return "bg-success bg-opacity-10 text-success border border-success border-opacity-25";
        if (estado === "Por renovar") return "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
        return "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
    }

    function obtenerColorTicket(estado) {
        if (estado === "Cerrado") return "bg-success bg-opacity-10 text-success border border-success border-opacity-25";
        if (estado === "Asignado" || estado === "Proceso") return "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
        return "bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25";
    }

    // Resalta el menu automáticamente
    function resaltarMenuActivo() {
        // Obtiene el nombre del archivo actual, si está vacío asume indexdg.html
        const paginaActual = window.location.pathname.split("/").pop() || "indexdg.html";
        
        // Busca todos los enlaces del menu
        document.querySelectorAll("#menuNavegacionDG .client-nav-link").forEach(enlace => {
            const href = enlace.getAttribute("href");
            
            // Si el href coincide con la página actual, le pone la clase active
            if (href === paginaActual) {
                enlace.classList.add("active");
            } else {
                enlace.classList.remove("active");
            }
        });
    }

});