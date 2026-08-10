document.addEventListener("DOMContentLoaded", function () {
    
    const pathname = window.location.pathname;
    let todosLosTickets = [];

    if (pathname.includes("indextc.html") || pathname.endsWith("/")) {
        cargarTicketsTecnico();
        configurarFiltrosTC();
    }
    
    if (pathname.includes("reporte_tc.html")) {
        cargarReporteMensual();
    }

    function cargarTicketsTecnico() {
        fetch("../../backend_web/tc/tc_tickets.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    document.getElementById('nombreTecnicoHeader').textContent = datos.tecnico;
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
            return `
            <div class="p-3 border rounded-3 bg-white shadow-sm d-flex justify-content-between align-items-center mb-2">
                <div>
                    <div class="text-secondary small mb-1">${t.conceptoT} | ${t.modalidadAtencionT} | ${fecha}</div>
                    <div class="fw-bold text-dark"><span class="${getColorTextoEstatus(t.statusT)} fw-bold">●</span> ${t.nombreEmpresaP}</div>
                </div>
                <button class="btn btn-success rounded-pill px-3" onclick="abrirModalAtencion(${t.idTicket}, '${t.conceptoT}', '${t.statusT}')">
                    Seleccionar <i class="bi bi-chevron-right ms-1"></i>
                </button>
            </div>
            `;
        }).join("");
    }

    function configurarFiltrosTC() {
        const checkboxes = document.querySelectorAll('.filtro-modalidad, .filtro-estatus');
        const selectOrden = document.getElementById('selectOrden');

        checkboxes.forEach(chk => chk.addEventListener('change', aplicarFiltrosLocales));
        selectOrden.addEventListener('change', aplicarFiltrosLocales);
    }

    function aplicarFiltrosLocales() {
        // modalidades seleccionadas
        const modChecked = Array.from(document.querySelectorAll('.filtro-modalidad:checked')).map(cb => cb.value);
        // estatus seleccionados
        const statChecked = Array.from(document.querySelectorAll('.filtro-estatus:checked')).map(cb => cb.value);
        // orden
        const orden = document.getElementById('selectOrden').value;

        let filtrados = todosLosTickets.filter(t => {
            const pasaMod = modChecked.length === 0 || modChecked.includes(t.modalidadAtencionT);
            const pasaStat = statChecked.length === 0 || statChecked.includes(t.statusT);
            return pasaMod && pasaStat;
        });

        if(orden === 'reciente') {
            filtrados.sort((a,b) => new Date(b.fechaCreacionT) - new Date(a.fechaCreacionT));
        } else {
            filtrados.sort((a,b) => new Date(a.fechaCreacionT) - new Date(b.fechaCreacionT));
        }

        renderizarTickets(filtrados);
    }

    // Funciones globales
    window.abrirModalAtencion = function(id, concepto, status) {
        document.getElementById('modalIdTicket').value = id;
        document.getElementById('modalConcepto').textContent = `TKT-${String(id).padStart(3,"0")} - ${concepto}`;
        document.getElementById('modalStatus').value = status;
        document.getElementById('modalNotas').value = ""; // kimpiar textarea
        
        const modal = new bootstrap.Modal(document.getElementById('modalAtenderTicket'));
        modal.show();
    };

    const formAct = document.getElementById('formActualizarTicket');
    if(formAct){
        formAct.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('idTicket', document.getElementById('modalIdTicket').value);
            formData.append('statusT', document.getElementById('modalStatus').value);
            formData.append('notasTecnico', document.getElementById('modalNotas').value);

            fetch("../../backend_web/tc/tc_actualizar.php", {
                method: 'POST',
                body: formData
            }).then(res => res.json()).then(datos => {
                if(datos.success){
                    bootstrap.Modal.getInstance(document.getElementById('modalAtenderTicket')).hide();
                    cargarTicketsTecnico(); // recargar la lista
                } else {
                    alert(datos.mensaje);
                }
            });
        });
    }
    function cargarReporteMensual() {
        fetch("../../backend_web/tc/tc_reporte.php")
            .then(res => res.json())
            .then(datos => {
                if(datos.success) {
                    document.getElementById('nombreTecnicoHeader').textContent = datos.tecnico;
                    document.getElementById('mesReporte').textContent = `Reporte: ${datos.mesNombre} ${datos.anio}`;
                    
                    document.getElementById('repTotal').textContent = datos.total;
                    document.getElementById('repCerrados').textContent = datos.cerrados;
                    document.getElementById('repProceso').textContent = datos.proceso;
                    document.getElementById('repAsignados').textContent = datos.asignados;

                    document.getElementById('barraProgreso').style.width = `${datos.progreso}%`;
                    document.getElementById('txtProgreso').textContent = datos.progreso;

                    const tbody = document.getElementById('tablaHistorial');
                    if(datos.historial.length > 0){
                        tbody.innerHTML = datos.historial.map(t => {
                            return `
                            <tr class="border-bottom border-light">
                                <td class="text-secondary">${t.idTicket}</td>
                                <td>${t.conceptoT}</td>
                                <td class="${getColorTextoEstatus(t.statusT)} fw-semibold">${t.statusT}</td>
                                <td class="text-secondary">${t.fechaCreacionT}</td>
                            </tr>
                            `;
                        }).join("");
                    } else {
                        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3">No hay historial este mes.</td></tr>`;
                    }
                }
            });
    }

    function getColorTextoEstatus(status) {
        if(status === 'Cerrado') return 'text-success';
        if(status === 'Proceso') return 'text-warning';
        return 'text-danger'; 
    }

});