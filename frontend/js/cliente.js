document.addEventListener("DOMContentLoaded", function () {
    resaltarPaginaActual();

    const parametrosTicket = new URLSearchParams(window.location.search);
    if (parametrosTicket.get("created")) {
        const alerta = document.getElementById("ticketCreatedAlert");
        if (alerta) {
            alerta.classList.remove("d-none");
        }
    }

    const planes = {
        Esencial: { dispositivos: 20, presenciales: 10, remotos: 20, asesorias: 8 },
        Profesional: { dispositivos: 45, presenciales: 15, remotos: 30, asesorias: 12 },
        Empresarial: { dispositivos: 90, presenciales: 25, remotos: 50, asesorias: 20 }
    };

    // FORMULARIO NUEVO TICKET
    const newTicketForm = document.getElementById("newTicketForm");
    if (newTicketForm) {
        const ticketPolicy = document.getElementById("ticketPolicy");
        fetch("../../backend_web/polizas_cliente.php")
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (!datos.success) return;
                datos.polizas.forEach(function (poliza) {
                    const opcion = document.createElement("option");
                    opcion.value = poliza.idPoliza;
                    opcion.textContent = poliza.nombreEmpresaP + " - Plan " + poliza.nombreP;
                    ticketPolicy.appendChild(opcion);
                });
            })
            .catch(function (error) { console.error("Error al cargar pólizas:", error); });

        newTicketForm.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const nuevoTicket = new FormData();
            nuevoTicket.append("idPoliza", ticketPolicy.value);
            nuevoTicket.append("modalidad", document.getElementById("ticketModality").value);
            nuevoTicket.append("concepto", document.getElementById("ticketConcept").value.trim());
            nuevoTicket.append("descripcion", document.getElementById("ticketDescription").value.trim());

            fetch("../../backend_web/crear_ticket.php", {
                method: "POST", body: nuevoTicket
            })
                .then(function (respuesta) { return respuesta.json(); })
                .then(function (datos) {
                    if (!datos.success) {
                        alert(datos.mensaje);
                        return;
                    }
                    window.location.href = "tickets_cliente.html?created=1";
                })
                .catch(function (error) { console.error("Error al crear el ticket:", error); });
        });
    }

    function obtenerIniciales(nombre, apellido) {
        const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : "";
        const inicialApellido = apellido ? apellido.charAt(0).toUpperCase() : "";
        return inicialNombre + inicialApellido;
    }

    function obtenerClaseEstado(estado) {
        if (estado === "Activa") return "status-active";
        if (estado === "Por renovar") return "status-renew";
        return "status-cancelled";
    }

    // CARGAR CLIENTE
    function cargarCliente() {
        fetch("../../backend_web/perfil_cliente.php")
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (!datos.success) return;
                const cliente = datos.cliente;
                document.querySelectorAll("[data-client-name]").forEach(function (elemento) { elemento.textContent = cliente.nombreC; });
                document.querySelectorAll("[data-client-fullname]").forEach(function (elemento) { elemento.textContent = cliente.nombreC + " " + cliente.apellidoC; });
                document.querySelectorAll("[data-client-email]").forEach(function (elemento) { elemento.textContent = cliente.correoC; });
                document.querySelectorAll("[data-client-initials]").forEach(function (elemento) { elemento.textContent = obtenerIniciales(cliente.nombreC, cliente.apellidoC); });

                const profileForm = document.getElementById("profileForm");
                if (profileForm) {
                    document.getElementById("profileName").value = cliente.nombreC;
                    document.getElementById("profileLastName").value = cliente.apellidoC;
                    document.getElementById("profilePhone").value = cliente.telefonoC;
                    document.getElementById("profileEmail").value = cliente.correoC;
                }
            })
            .catch(function (error) { console.error("Error al cargar el perfil:", error); });
    }
    cargarCliente();

    // POLIZAS PANEL RESUMEN
    const dashboardPolicies = document.getElementById("dashboardPolicies");
    if (dashboardPolicies) {
        fetch("../../backend_web/polizas_cliente.php")
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (!datos.success) return;
                const polizasActivas = datos.polizas.filter(function (poliza) { return poliza.estadoP !== "Cancelada"; });
                
                const polizasVisibles = polizasActivas.slice(0, 2);
                if (polizasVisibles.length === 0) {
                    dashboardPolicies.innerHTML = `
                        <div class="empty-policy">
                            <i class="bi bi-shield-plus"></i>
                            <div>
                                <strong>No tienes pólizas activas</strong>
                                <p class="mb-0">Contrata una cobertura para comenzar.</p>
                            </div>
                        </div>
                    `;
                    return;
                }

                dashboardPolicies.innerHTML = polizasVisibles.map(function (poliza) {
                    return `
                        <a href="detalle_poliza.html?id=${poliza.idPoliza}" class="dashboard-policy">
                            <span class="dashboard-policy-icon"><i class="bi bi-shield-check"></i></span>
                            <div>
                                <strong>${poliza.nombreEmpresaP}</strong>
                                <small>Plan ${poliza.nombreP}</small>
                            </div>
                            <span class="policy-status ${obtenerClaseEstado(poliza.estadoP)}">${poliza.estadoP}</span>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    `;
                }).join("");
            })
            .catch(function (error) { console.error("Error cargando pólizas panel:", error); });
    }


    const contenedorTickets = document.getElementById("ticketsList");
    window.misTicketsLocales = []; 
    let currentPageTkt = 1;
    let filtradosTkt = [];
    const itemsPerPageTkt = 25;

    function cargarDatosTicketsBase() {
        if (!contenedorTickets) return;
        fetch("../../backend_web/tickets_cliente.php")
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (!datos.success) return;
                window.misTicketsLocales = datos.tickets; 
                pintarListaTicketsPaginada("all"); 
            })
            .catch(error => console.error("Error trayendo tickets:", error));
    }

    function pintarListaTicketsPaginada(filtro) {
        if (!contenedorTickets) return;

        if (filtro) {
            filtradosTkt = window.misTicketsLocales.filter(function (ticket) {
                return ticketCoincideFiltroLocal(ticket.statusT, filtro);
            });
            currentPageTkt = 1;
        }

        // Matemáticas de paginación
        const inicio = (currentPageTkt - 1) * itemsPerPageTkt;
        const aMostrar = filtradosTkt.slice(inicio, inicio + itemsPerPageTkt);


        const textoPaginacion = document.getElementById("paginacionTktClienteTexto");
        if (textoPaginacion) {
            if (filtradosTkt.length === 0) {
                textoPaginacion.textContent = "0 resultados";
            } else {
                const end = Math.min(currentPageTkt * itemsPerPageTkt, filtradosTkt.length);
                textoPaginacion.textContent = `${inicio + 1} - ${end} de ${filtradosTkt.length}`;
            }
        }

        // Estado vacío
        if (aMostrar.length === 0) {
            contenedorTickets.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-ticket-perforated fs-1 text-secondary"></i>
                    <h2 class="h5 mt-3">No hay tickets</h2>
                    <p class="text-secondary mb-0">No encontramos registros con este filtro.</p>
                </div>
            `;
            return;
        }

        contenedorTickets.innerHTML = aMostrar.map(function (ticket) {
            const numeroTicket = "TKT-" + String(ticket.idTicket).padStart(3, "0");
            const fecha = new Date(ticket.fechaCreacionT + "T00:00:00").toLocaleDateString("es-MX");
            
            // Asignar colores dinámicos según estatus
            let colorClass = "success";
            let bgRgba = "rgba(25, 135, 84, 0.1)";
            const estadoLower = ticket.statusT ? ticket.statusT.toLowerCase() : "";
            
            if (estadoLower.includes("proceso") || estadoLower.includes("atencion")) {
                colorClass = "warning";
                bgRgba = "rgba(255, 193, 7, 0.1)";
            } else if (estadoLower.includes("asignado") || estadoLower.includes("pendiente")) {
                colorClass = "danger";
                bgRgba = "rgba(220, 53, 69, 0.1)";
            }

            return `
                <article class="glass-card rounded-4 p-4 shadow-sm border border-secondary border-opacity-10 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 w-100" style="background: rgba(255,255,255,0.7);">
                    <div class="d-flex gap-3 align-items-center">
                        <div class="icon-box text-${colorClass} flex-shrink-0 d-flex justify-content-center align-items-center" style="width: 50px; height: 50px; background: ${bgRgba}; border-radius: 12px;">
                            <i class="bi bi-ticket-detailed fs-3"></i>
                        </div>
                        <div>
                            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <h2 class="h6 fw-bold mb-0 text-dark">${ticket.conceptoT}</h2>
                                <span class="badge bg-${colorClass} bg-opacity-10 text-${colorClass} border border-${colorClass} border-opacity-25 px-2 py-1 rounded-pill">${ticket.statusT}</span>
                            </div>
                            <p class="text-secondary small mb-1 fw-medium">
                                <strong class="text-dark">${numeroTicket}</strong> <span class="mx-1">•</span> ${ticket.modalidadAtencionT} <span class="mx-1">•</span> Creado: ${fecha}
                            </p>
                            <p class="text-secondary small mb-0">
                                <i class="bi bi-building me-1"></i> ${ticket.nombreEmpresaP} - Plan ${ticket.nombreP}
                            </p>
                        </div>
                    </div>
                    <div class="text-md-end mt-2 mt-md-0 flex-shrink-0">
                        <a href="detalle_ticket.html?id=${ticket.idTicket}" class="btn btn-outline-success rounded-pill px-4 fw-semibold">Ver detalle <i class="bi bi-arrow-right ms-1"></i></a>
                    </div>
                </article>
            `;
        }).join("");
    }

    function configurarBotonesFiltroTickets() {
        document.querySelectorAll("[data-ticket-filter]").forEach(function (boton) {
            boton.addEventListener("click", function () {
                document.querySelectorAll("[data-ticket-filter]").forEach(function (item) { 
                    item.classList.remove("active"); 
                });
                boton.classList.add("active");
                pintarListaTicketsPaginada(boton.dataset.ticketFilter);
            });
        });

        // Eventos para flechas de paginación
        const btnPrev = document.getElementById("btnPrevTktCliente");
        const btnNext = document.getElementById("btnNextTktCliente");
        
        if (btnPrev) {
            btnPrev.addEventListener("click", () => {
                if (currentPageTkt > 1) {
                    currentPageTkt--;
                    pintarListaTicketsPaginada(null); // null para no reiniciar el filtro
                }
            });
        }
        if (btnNext) {
            btnNext.addEventListener("click", () => {
                const totalPages = Math.ceil(filtradosTkt.length / itemsPerPageTkt);
                if (currentPageTkt < totalPages) {
                    currentPageTkt++;
                    pintarListaTicketsPaginada(null);
                }
            });
        }
    }

    // Inicializar tickets si existe el contenedor
    if(contenedorTickets) {
        cargarDatosTicketsBase();
        configurarBotonesFiltroTickets();
    }


    const policiesGrid = document.getElementById("policiesGrid");

    function mostrarPolizas(filtro = "all") {
        if (!policiesGrid) { return; }

        fetch("../../backend_web/polizas_cliente.php")
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (!datos.success) return;

                let polizasFiltradas = datos.polizas;
                if (filtro !== "all") {
                    polizasFiltradas = datos.polizas.filter(function (poliza) { return poliza.estadoP === filtro; });
                }

                if (polizasFiltradas.length === 0) {
                    policiesGrid.innerHTML = `
                        <div class="col-12">
                            <div class="empty-policy text-center">
                                <i class="bi bi-inbox"></i>
                                <h2 class="h5 mt-3">No hay pólizas en esta categoría</h2>
                                <p class="text-secondary mb-0">Prueba seleccionando otro filtro.</p>
                            </div>
                        </div>
                    `;
                    return;
                }

                policiesGrid.innerHTML = polizasFiltradas.map(function (poliza) {
                    const cobertura = planes[poliza.nombreP];
                    const numeroPoliza = "ETS-" + String(poliza.idPoliza).padStart(3, "0");
                    const fechaVencimiento = new Date(poliza.fechaVencimientoP + "T00:00:00").toLocaleDateString("es-MX");

                    return `
                        <div class="col-md-6 col-xl-4">
                            <article class="policy-card h-100">
                                <div class="d-flex justify-content-between align-items-start mb-4">
                                    <span class="policy-card-icon"><i class="bi bi-shield-check"></i></span>
                                    <span class="policy-status ${obtenerClaseEstado(poliza.estadoP)}">${poliza.estadoP}</span>
                                </div>
                                <small class="text-secondary">Póliza #${numeroPoliza}</small>
                                <h2 class="h5 fw-bold mt-1 mb-1">${poliza.nombreEmpresaP}</h2>
                                <p class="text-secondary">Plan ${poliza.nombreP}</p>
                                <div class="policy-card-data">
                                    <span><i class="bi bi-pc-display"></i> Hasta ${cobertura.dispositivos} dispositivos</span>
                                    <span><i class="bi bi-calendar-check"></i> Vence ${fechaVencimiento}</span>
                                </div>
                                <a href="detalle_poliza.html?id=${poliza.idPoliza}" class="btn btn-outline-success w-100 mt-4">
                                    Ver detalles <i class="bi bi-arrow-right ms-1"></i>
                                </a>
                            </article>
                        </div>
                    `;
                }).join("");
            })
            .catch(function (error) { console.error("Error al cargar las pólizas:", error); });
    }

    if (policiesGrid) {
        mostrarPolizas("all");
    }

    document.querySelectorAll("[data-policy-filter]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            document.querySelectorAll("[data-policy-filter]").forEach(function (otroBoton) { otroBoton.classList.remove("active"); });
            boton.classList.add("active");
            mostrarPolizas(boton.dataset.policyFilter);
        });
    });


    // DETALLE DE POLIZA
    const policyDetailContent = document.getElementById("policyDetailContent");
    if (policyDetailContent) {
        const parametros = new URLSearchParams(window.location.search);
        const idPoliza = Number(parametros.get("id"));

        fetch("../../backend_web/polizas_cliente.php")
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (!datos.success) return;

                const polizaSeleccionada = datos.polizas.find(function (poliza) { return Number(poliza.idPoliza) === idPoliza; });

                if (!polizaSeleccionada) {
                    document.getElementById("policyNotFound").classList.remove("d-none");
                    policyDetailContent.classList.add("d-none");
                    return;
                }
                cargarDetallePoliza(polizaSeleccionada);
            });

        function cargarDetallePoliza(poliza) {
            const cobertura = planes[poliza.nombreP];
            const numeroPoliza = "ETS-" + String(poliza.idPoliza).padStart(3, "0");
            const fechaInicio = new Date(poliza.fechaInicioP + "T00:00:00");
            const fechaVencimiento = new Date(poliza.fechaVencimientoP + "T00:00:00");
            const fechaInicioTexto = fechaInicio.toLocaleDateString("es-MX");
            const fechaVencimientoTexto = fechaVencimiento.toLocaleDateString("es-MX");
            let duracionMeses = (fechaVencimiento.getFullYear() - fechaInicio.getFullYear()) * 12;
            duracionMeses += fechaVencimiento.getMonth() - fechaInicio.getMonth();
            const responsable = poliza.nombreC + " " + poliza.apellidoC;
            const policyStatus = document.getElementById("policyStatus");
            
            policyStatus.textContent = poliza.estadoP;
            policyStatus.className = "policy-status " + obtenerClaseEstado(poliza.estadoP);
            document.getElementById("policyNumber").textContent = "Póliza #" + numeroPoliza;
            document.getElementById("policyBusinessName").textContent = poliza.nombreEmpresaP;
            document.getElementById("policyPlanName").textContent = poliza.nombreP;
            document.getElementById("detailBusinessName").textContent = poliza.nombreEmpresaP;
            document.getElementById("detailBusinessContact").textContent = responsable;
            document.getElementById("detailBusinessPhone").textContent = poliza.telefonoP;
            document.getElementById("detailBusinessEmail").textContent = poliza.correoP;
            document.getElementById("detailBusinessAddress").textContent = poliza.direccionServicioP;
            document.getElementById("policyDevices").textContent = cobertura.dispositivos;
            document.getElementById("policyOnsite").textContent = poliza.maxPres;
            document.getElementById("policyRemote").textContent = poliza.maxRem;
            document.getElementById("policyConsulting").textContent = poliza.maxAse;
            document.getElementById("policyStartDate").textContent = fechaInicioTexto;
            document.getElementById("policyEndDate").textContent = fechaVencimientoTexto;
            document.getElementById("policyDuration").textContent = duracionMeses + " meses";
            document.getElementById("editBusinessName").value = poliza.nombreEmpresaP;
            document.getElementById("editBusinessContact").value = responsable;
            document.getElementById("editBusinessPhone").value = poliza.telefonoP;
            document.getElementById("editBusinessEmail").value = poliza.correoP;
            document.getElementById("editBusinessAddress").value = poliza.direccionServicioP;

            const nivelesPlanes = ["Esencial", "Profesional", "Empresarial"];
            const newPolicyPlan = document.getElementById("newPolicyPlan");
            const improvePolicyButton = document.getElementById("improvePolicyButton");
            newPolicyPlan.innerHTML = "";

            const opcionInicial = document.createElement("option");
            opcionInicial.value = "";
            opcionInicial.textContent = "Selecciona un plan diferente";
            opcionInicial.selected = true;
            opcionInicial.disabled = true;
            newPolicyPlan.appendChild(opcionInicial);

            const indicePlanActual = nivelesPlanes.indexOf(poliza.nombreP);
            if (indicePlanActual !== -1) {
                nivelesPlanes.slice(indicePlanActual + 1).forEach(function (nombrePlan) {
                    const opcion = document.createElement("option");
                    opcion.value = nombrePlan;
                    opcion.textContent = nombrePlan;
                    newPolicyPlan.appendChild(opcion);
                });
            }

            const puedeMejorar = indicePlanActual !== -1 && indicePlanActual < nivelesPlanes.length - 1 && poliza.estadoP !== "Cancelada";
            improvePolicyButton.disabled = !puedeMejorar;
            newPolicyPlan.disabled = !puedeMejorar;

            if (poliza.estadoP === "Cancelada") {
                document.getElementById("cancelPolicyButton").disabled = true;
            } else {
                document.getElementById("cancelPolicyButton").disabled = false;
            }
        }

        const editPolicyForm = document.getElementById("editPolicyForm");
        editPolicyForm.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const formulario = new FormData();
            formulario.append("idPoliza", idPoliza);
            formulario.append("empresa", document.getElementById("editBusinessName").value.trim());
            formulario.append("telefono", document.getElementById("editBusinessPhone").value.trim());
            formulario.append("correo", document.getElementById("editBusinessEmail").value.trim());
            formulario.append("direccion", document.getElementById("editBusinessAddress").value.trim());

            fetch("../../backend_web/actualizar_poliza_cliente.php", {
                method: "POST", body: formulario
            }).then(function (respuesta) { return respuesta.json(); }).then(function (datos) {
                if (!datos.success) { alert(datos.mensaje); return; }
                window.location.reload();
            });
        });

        const confirmCancelPolicy = document.getElementById("confirmCancelPolicy");
        confirmCancelPolicy.addEventListener("click", function () {
            const formulario = new FormData();
            formulario.append("idPoliza", idPoliza);
            confirmCancelPolicy.disabled = true;
            fetch("../../backend_web/cancelar_poliza_cliente.php", {
                method: "POST", body: formulario
            }).then(function (respuesta) { return respuesta.json(); }).then(function (datos) {
                if (!datos.success) { alert(datos.mensaje); confirmCancelPolicy.disabled = false; return; }
                window.location.reload();
            });
        });

        const renewPolicyButton = document.getElementById("renewPolicyButton");
        renewPolicyButton.addEventListener("click", function () {
            if (!confirm("¿Deseas renovar esta póliza por 1 mes?")) return;
            const formulario = new FormData();
            formulario.append("idPoliza", idPoliza);
            renewPolicyButton.disabled = true;
            fetch("../../backend_web/renovar_poliza_cliente.php", {
                method: "POST", body: formulario
            }).then(function (respuesta) { return respuesta.json(); }).then(function (datos) {
                if (!datos.success) { alert(datos.mensaje); renewPolicyButton.disabled = false; return; }
                window.location.reload();
            });
        });
    }

    // PERFIL
    const profileFormEl = document.getElementById("profileForm");
    if (profileFormEl) {
        profileFormEl.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const formulario = new FormData();
            formulario.append("nombre", document.getElementById("profileName").value.trim());
            formulario.append("apellido", document.getElementById("profileLastName").value.trim());
            formulario.append("telefono", document.getElementById("profilePhone").value.trim());
            formulario.append("correo", document.getElementById("profileEmail").value.trim());
            formulario.append("password", document.getElementById("profilePassword").value);

            fetch("../../backend_web/actualizar_perfil_cliente.php", {
                method: "POST", body: formulario
            }).then(function (respuesta) { return respuesta.json(); }).then(function (datos) {
                if (!datos.success) { alert(datos.mensaje); return; }
                document.getElementById("profileAlert").classList.remove("d-none");
                document.getElementById("profilePassword").value = "";
                cargarCliente();
            });
        });
    }

    document.querySelectorAll("[data-toggle-password]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const campo = document.getElementById("profilePassword");
            const icono = boton.querySelector("i");
            if (campo.type === "password") {
                campo.type = "text";
                icono.classList.remove("bi-eye");
                icono.classList.add("bi-eye-slash");
            } else {
                campo.type = "password";
                icono.classList.remove("bi-eye-slash");
                icono.classList.add("bi-eye");
            }
        });
    });

    // DETALLE TICKET
    function mostrarDetalleTicket() {
        const contenedor = document.getElementById("ticketDetail");
        if (!contenedor) return;

        const parametros = new URLSearchParams(window.location.search);
        const idTicket = parametros.get("id");

        if (!idTicket) return;

        fetch("../../backend_web/detalle_ticket_cliente.php?id=" + encodeURIComponent(idTicket))
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (!datos.success) return;

                const ticket = datos.ticket;
                const numeroTicket = "TKT-" + String(ticket.idTicket).padStart(3, "0");
                const fechaCreacion = new Date(ticket.fechaCreacionT + "T00:00:00").toLocaleDateString("es-MX");
                const fechaAtencion = ticket.fechaAtencionT ? new Date(ticket.fechaAtencionT + "T00:00:00").toLocaleDateString("es-MX") : "Pendiente";
                const nombrePoliza = ticket.nombreEmpresaP + " - Plan " + ticket.nombreP;
                let tecnico = "Pendiente de asignación";
                if (ticket.idEmpleado) tecnico = ticket.nombresEmp + " " + ticket.apellidosEmp;

                // Logica visual de color detalle ticket
                let colorClass = "success";
                let bgRgba = "rgba(25, 135, 84, 0.1)";
                const estadoLower = ticket.statusT ? ticket.statusT.toLowerCase() : "";
                
                if (estadoLower.includes("proceso") || estadoLower.includes("atencion")) {
                    colorClass = "warning";
                } else if (estadoLower.includes("asignado") || estadoLower.includes("pendiente")) {
                    colorClass = "danger";
                }

                contenedor.innerHTML = `
                    <section class="glass-card rounded-4 p-4 p-lg-5 shadow-sm">
                        <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                            <div>
                                <span class="eyebrow">${numeroTicket}</span>
                                <h1 class="h2 fw-bold mt-2 mb-2">${ticket.conceptoT}</h1>
                                <span class="badge bg-${colorClass} bg-opacity-10 text-${colorClass} border border-${colorClass} border-opacity-25 px-3 py-2 rounded-pill">${ticket.statusT}</span>
                            </div>
                            <div class="text-md-end">
                                <small class="text-secondary d-block">Fecha de creación</small>
                                <strong>${fechaCreacion}</strong>
                            </div>
                        </div>
                        <hr>
                        <div class="row g-4 mt-1">
                            <div class="col-md-6"><small class="text-secondary">Póliza</small><p class="fw-semibold mb-0">${nombrePoliza}</p></div>
                            <div class="col-md-6"><small class="text-secondary">Modalidad</small><p class="fw-semibold mb-0">${ticket.modalidadAtencionT}</p></div>
                            <div class="col-md-6"><small class="text-secondary">Técnico asignado</small><p class="fw-semibold mb-0">${tecnico}</p></div>
                            <div class="col-md-6"><small class="text-secondary">Fecha de atención</small><p class="fw-semibold mb-0">${fechaAtencion}</p></div>
                        </div>
                        <hr class="my-4">
                        <div>
                            <h2 class="h5 fw-bold">Descripción del problema</h2>
                            <p class="text-secondary mb-0">${ticket.descripcionT}</p>
                        </div>
                        ${ticket.notasTecnico ? `
                            <hr class="my-4">
                            <div><h2 class="h5 fw-bold">Notas del técnico</h2><p class="text-secondary mb-0">${ticket.notasTecnico}</p></div>
                        ` : ""}
                        ${Number(ticket.conformidadCliente) === 1 ? `
                            <hr class="my-4"><div class="alert alert-success mb-0"><i class="bi bi-check-circle me-2"></i> Confirmaste que el problema fue solucionado.</div>
                        ` : `
                            <hr class="my-4">
                            <div>
                                <h2 class="h5 fw-bold">¿Tu problema quedó solucionado?</h2>
                                <p class="text-secondary">Confirma el resultado de la atención.</p>
                                <div class="d-flex flex-wrap gap-2">
                                    <button class="btn btn-success" data-conformidad="solucionado"><i class="bi bi-check-circle me-1"></i> Sí, quedó solucionado</button>
                                    <button class="btn btn-outline-danger" data-conformidad="continua"><i class="bi bi-x-circle me-1"></i> El problema continúa</button>
                                </div>
                                <p id="conformidadMensaje" class="small mt-3 mb-0"></p>
                            </div>
                        `}
                    </section>
                `;

                document.querySelectorAll("[data-conformidad]").forEach(function (boton) {
                    boton.addEventListener("click", function () {
                        const respuesta = boton.dataset.conformidad;
                        const formulario = new FormData();
                        formulario.append("idTicket", ticket.idTicket);
                        formulario.append("respuesta", respuesta);

                        fetch("../../backend_web/conformidad_ticket_cliente.php", {
                            method: "POST", body: formulario
                        }).then(function (res) { return res.json(); }).then(function (dat) {
                            if (!dat.success) return;
                            if (respuesta === "solucionado") mostrarDetalleTicket();
                            else document.getElementById("conformidadMensaje").textContent = "Se registró que el problema continúa.";
                        });
                    });
                });
            });
    }
    mostrarDetalleTicket();

    // GRAFICAS PANEL (INDEX CLIENTE)

    const paginaActualURL = window.location.pathname.split("/").pop() || "indexcliente.html";
    if (paginaActualURL === "indexcliente.html" || paginaActualURL === "") {
        cargarResumenGraficoCliente();
    }

    function cargarResumenGraficoCliente() {
        fetch("../../backend_web/resumen_cliente.php")
            .then(res => res.json())
            .then(datos => {
                if (datos.success) {
                    const elOpen = document.getElementById("openTickets");
                    const elResolved = document.getElementById("resolvedTickets");
                    if (elOpen) elOpen.textContent = datos.abiertos;
                    if (elResolved) elResolved.textContent = datos.resueltos;

                    if (document.getElementById("chartClienteEmpresas")) {
                        const labelsEmp = datos.graficas.empresas.map(e => e.nombreEmpresaP);
                        const dataEmp = datos.graficas.empresas.map(e => e.cantidad);
                        new Chart(document.getElementById("chartClienteEmpresas"), {
                            type: 'bar',
                            data: {
                                labels: labelsEmp,
                                datasets: [{
                                    label: 'Tickets Solicitados',
                                    data: dataEmp,
                                    backgroundColor: 'rgba(32, 201, 151, 0.7)',
                                    borderRadius: 4
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                        });
                    }

                    if (document.getElementById("chartClienteStatus")) {
                        const labelsStat = datos.graficas.status.map(s => s.statusT);
                        const dataStat = datos.graficas.status.map(s => s.cantidad);
                        new Chart(document.getElementById("chartClienteStatus"), {
                            type: 'doughnut',
                            data: {
                                labels: labelsStat,
                                datasets: [{
                                    data: dataStat,
                                    backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#6c757d'],
                                    borderWidth: 0
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
                        });
                    }

                    if (document.getElementById("chartClienteMeses")) {
                        const labelsMes = datos.graficas.meses.map(m => m.mes);
                        const dataMes = datos.graficas.meses.map(m => m.cantidad);
                        new Chart(document.getElementById("chartClienteMeses"), {
                            type: 'line',
                            data: {
                                labels: labelsMes,
                                datasets: [{
                                    label: 'Tickets',
                                    data: dataMes,
                                    borderColor: '#198754',
                                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                                    fill: true,
                                    tension: 0.4
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                        });
                    }
                }
            }).catch(err => console.error(err));
    }
});

// FUNCIONES AUXILIARES GLOBALES
function resaltarPaginaActual() {
    const paginaActual = window.location.pathname.split("/").pop() || "indexcliente.html";
    const paginasPolizas = ["polizas_cliente.html", "nueva_poliza.html", "detalle_poliza.html"];
    const paginasTickets = ["tickets_cliente.html", "nuevo_ticket.html", "detalle_ticket.html"];

    document.querySelectorAll(".client-nav-link").forEach(function (enlace) {
        const paginaEnlace = enlace.getAttribute("href").split("?")[0];
        const estaActivo = paginaEnlace === paginaActual ||
            (paginaEnlace === "polizas_cliente.html" && paginasPolizas.includes(paginaActual)) ||
            (paginaEnlace === "tickets_cliente.html" && paginasTickets.includes(paginaActual));
        enlace.classList.toggle("active", estaActivo);
        if (estaActivo) enlace.setAttribute("aria-current", "page");
        else enlace.removeAttribute("aria-current");
    });
}

function claseEstadoTicket(estado) {
    if (estado === "Cerrado") return "status-active";
    if (estado === "Asignado" || estado === "Proceso" || estado === "Pendiente conformidad") return "status-warning";
    return "status-cancelled";
}

function ticketCoincideFiltroLocal(statusOriginal, filtro) {
    if(!statusOriginal) return false;
    const estado = statusOriginal.trim().toLowerCase();
    
    if (filtro === "all") return true;
    if (filtro === "Asignado") return estado === "asignado";
    if (filtro === "Atencion") return estado === "proceso";
    if (filtro === "Cerrado") return estado === "cerrado";
    return true;
}