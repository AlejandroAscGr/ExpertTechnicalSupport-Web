document.addEventListener("DOMContentLoaded", function () {
    
    const pathname = window.location.pathname;
    let todosLosTickets = [];

    // menú activo
    resaltarMenuActivoTC();


    if (pathname.includes("indextc.html") || pathname.endsWith("/")) {
        cargarNombreSimple();
    }
    if (pathname.includes("tickets_tc.html")) {
        cargarTicketsTecnico();
        configurarFiltrosTC();
    }
    if (pathname.includes("reporte_tc.html")) {
        cargarReporteMensual();
    }

    // Funciones
    function cargarNombreSimple() {
        // ruta de tickets para extraer el nombre de quien inició sesión
        fetch("../../backend_web/tc/tc_tickets.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    const el = document.getElementById('nombreTecnicoHeader');
                    if(el) el.textContent = datos.tecnico;
                }
            }).catch(err => console.error(err));
    }


       // MÓDULO DE TICKETS 
    function cargarTicketsTecnico() {
        fetch("../../backend_web/tc/tc_tickets.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    todosLosTickets = datos.tickets;
                    renderizarTickets(todosLosTickets);
                }
            }).catch(err => console.error(err));
    }

    function renderizarTickets(lista) {
        const contenedor = document.getElementById("listaTickets");
        if(lista.length === 0) {
            contenedor.innerHTML = `<div class="text-center py-5 text-secondary"><i class="bi bi-inbox fs-1 d-block mb-2"></i> No se encontraron tickets con estos filtros.</div>`;
            return;
        }

        contenedor.innerHTML = lista.map(t => {
            const numero = String(t.idTicket).padStart(3, "0");
            const fecha = new Date(t.fechaCreacionT + "T00:00:00").toLocaleDateString("es-MX");
            const colorPunto = getColorTextoEstatus(t.statusT);
            
            return `
            <div class="p-3 border border-success border-opacity-10 rounded-4 bg-white shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 transition-all" style="transition: transform 0.2s;">
                <div class="mb-3 mb-md-0">
                    <div class="fw-bold text-dark fs-5 mb-1"><span class="${colorPunto} fw-bold me-1">●</span> ${t.conceptoT}</div>
                    <div class="text-secondary small mb-1"><i class="bi bi-building me-1"></i> ${t.nombreEmpresaP}</div>
                    <div class="text-secondary small">
                        <span class="badge bg-light text-dark border me-2">${t.modalidadAtencionT}</span> 
                        <i class="bi bi-calendar-event me-1"></i> ${fecha}
                    </div>
                </div>
                <button class="btn btn-success rounded-pill px-4" onclick="abrirModalAtencion(${t.idTicket}, '${t.conceptoT.replace(/'/g, "\\'")}', '${t.statusT}')">
                    Actualizar <i class="bi bi-chevron-right ms-1"></i>
                </button>
            </div>
            `;
        }).join("");
    }

    function configurarFiltrosTC() {
        const checkboxes = document.querySelectorAll('.filtro-modalidad, .filtro-estatus');
        const selectOrden = document.getElementById('selectOrden');
        const fDesde = document.getElementById('filtroDesde');
        const fHasta = document.getElementById('filtroHasta');
        const btnLimpiar = document.getElementById('btnLimpiarFiltrosTC');

        // Eventos a cada cambio
        checkboxes.forEach(chk => chk.addEventListener('change', aplicarFiltrosLocales));
        selectOrden.addEventListener('change', aplicarFiltrosLocales);
        fDesde.addEventListener('change', aplicarFiltrosLocales);
        fHasta.addEventListener('change', aplicarFiltrosLocales);

        // Limpiar
        if(btnLimpiar){
            btnLimpiar.addEventListener('click', () => {
                checkboxes.forEach(chk => chk.checked = false);
                selectOrden.value = 'reciente';
                fDesde.value = '';
                fHasta.value = '';
                renderizarTickets(todosLosTickets);
            });
        }
    }

    function aplicarFiltrosLocales() {
        const modChecked = Array.from(document.querySelectorAll('.filtro-modalidad:checked')).map(cb => cb.value);
        const statChecked = Array.from(document.querySelectorAll('.filtro-estatus:checked')).map(cb => cb.value);
        const orden = document.getElementById('selectOrden').value;
        const desde = document.getElementById('filtroDesde').value;
        const hasta = document.getElementById('filtroHasta').value;

        let filtrados = todosLosTickets.filter(t => {
            const pasaMod = modChecked.length === 0 || modChecked.includes(t.modalidadAtencionT);
            const pasaStat = statChecked.length === 0 || statChecked.includes(t.statusT);
            const pasaDesde = !desde || t.fechaCreacionT >= desde;
            const pasaHasta = !hasta || t.fechaCreacionT <= hasta;
            
            return pasaMod && pasaStat && pasaDesde && pasaHasta;
        });

        if(orden === 'reciente') {
            filtrados.sort((a,b) => new Date(b.fechaCreacionT) - new Date(a.fechaCreacionT));
        } else {
            filtrados.sort((a,b) => new Date(a.fechaCreacionT) - new Date(b.fechaCreacionT));
        }

        renderizarTickets(filtrados);
    }

    window.abrirModalAtencion = function(id, concepto, status) {
        document.getElementById('modalIdTicket').value = id;
        document.getElementById('modalConcepto').textContent = `TKT-${String(id).padStart(3,"0")} - ${concepto}`;
        document.getElementById('modalStatus').value = status;
        document.getElementById('modalNotas').value = ""; 
        
        const modal = new bootstrap.Modal(document.getElementById('modalAtenderTicket'));
        modal.show();
    };

    const formAct = document.getElementById('formActualizarTicket');
    if(formAct){
        formAct.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnSubmit = formAct.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            const formData = new FormData();
            formData.append('idTicket', document.getElementById('modalIdTicket').value);
            formData.append('statusT', document.getElementById('modalStatus').value);
            formData.append('notasTecnico', document.getElementById('modalNotas').value);

            fetch("../../backend_web/tc/tc_actualizar.php", {
                method: 'POST',
                body: formData
            }).then(res => res.json()).then(datos => {
                btnSubmit.disabled = false;
                if(datos.success){
                    bootstrap.Modal.getInstance(document.getElementById('modalAtenderTicket')).hide();
                    cargarTicketsTecnico(); 
                } else {
                    alert(datos.mensaje);
                }
            }).catch(err => {
                btnSubmit.disabled = false;
                console.error(err);
            });
        });
    }


      // MÓDULO DE REPORTE 

    function cargarReporteMensual() {
        fetch("../../backend_web/tc/tc_reporte.php")
            .then(res => res.json())
            .then(datos => {
                if(datos.success) {
                    document.getElementById('mesReporte').textContent = `Métricas de ${datos.mesNombre} ${datos.anio}`;
                    
                    document.getElementById('repTotal').textContent = datos.total;
                    document.getElementById('repCerrados').textContent = datos.cerrados;
                    document.getElementById('repProceso').textContent = datos.proceso;
                    document.getElementById('repAsignados').textContent = datos.asignados;

                    // barra de progreso
                    setTimeout(() => {
                        document.getElementById('barraProgreso').style.width = `${datos.progreso}%`;
                    }, 300);
                    document.getElementById('txtProgreso').textContent = datos.progreso;

                    const tbody = document.getElementById('tablaHistorial');
                    if(datos.historial.length > 0){
                        tbody.innerHTML = datos.historial.map(t => {
                            const num = String(t.idTicket).padStart(3, "0");
                            return `
                            <tr>
                                <td class="fw-bold text-secondary">TKT-${num}</td>
                                <td class="text-dark fw-semibold">${t.conceptoT}</td>
                                <td><span class="badge bg-light text-dark border">${t.modalidadAtencionT}</span></td>
                                <td><span class="${getColorTextoEstatus(t.statusT)} fw-bold">●</span> ${t.statusT}</td>
                                <td class="text-secondary">${t.fechaCreacionT}</td>
                            </tr>
                            `;
                        }).join("");
                    } else {
                        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No se han registrado tickets este mes.</td></tr>`;
                    }

                    // GRÁFICA DE MODALIDAD
                    if(document.getElementById('chartModalidadTC')){
                        const dataModalidad = datos.graficas.modalidad; // [Presencial, Remoto, Asesoria]
                        new Chart(document.getElementById('chartModalidadTC'), {
                            type: 'polarArea',
                            data: {
                                labels: ['Presencial', 'Remoto', 'Asesoría'],
                                datasets: [{
                                    data: dataModalidad,
                                    backgroundColor: ['#198754', '#20c997', '#0dcaf0'],
                                    borderWidth: 2,
                                    borderColor: '#ffffff'
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false }
                        });
                    }
                }
            }).catch(err => console.error(err));
    }

    function getColorTextoEstatus(status) {
        if(status === 'Cerrado') return 'text-success';
        if(status === 'Proceso') return 'text-warning';
        return 'text-danger'; 
    }

    function resaltarMenuActivoTC() {
        const paginaActual = window.location.pathname.split("/").pop() || "indextc.html";
        document.querySelectorAll("#menuNavegacionTC .client-nav-link").forEach(enlace => {
            if (enlace.getAttribute("href") === paginaActual) {
                enlace.classList.add("active");
            } else {
                enlace.classList.remove("active");
            }
        });
    }

});