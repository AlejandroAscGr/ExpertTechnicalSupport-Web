document.addEventListener("DOMContentLoaded", function () {
    resaltarPaginaActual();

    const parametrosTicket =
    new URLSearchParams(window.location.search);

if (parametrosTicket.get("created")) {

    const alerta =
        document.getElementById("ticketCreatedAlert");

    if (alerta) {
        alerta.classList.remove("d-none");
    }
}

    const planes = {
        Esencial: {
            dispositivos: 20,
            presenciales: 10,
            remotos: 20,
            asesorias: 8
        },

        Profesional: {
            dispositivos: 45,
            presenciales: 15,
            remotos: 30,
            asesorias: 12
        },

        Empresarial: {
            dispositivos: 90,
            presenciales: 25,
            remotos: 50,
            asesorias: 20
        }
    };


    // Datos provisionales del cliente
    const clienteInicial = {
        nombre: "Isaú",
        apellido: "Ramírez",
        telefono: "3300000000",
        correo: "isau@ejemplo.com",
        empresa: "Empresa principal"
    };


    // Pólizas provisionales para mostrar el funcionamiento
    const polizasIniciales = [
        {
            id: 1,
            numero: "ETS-001",
            plan: "Profesional",
            estado: "Activa",
            negocio: "Sucursal Centro",
            telefono: "3312345678",
            direccion: "Guadalajara, Jalisco",
            correo: "contacto@negocio.com",
            responsable: "Isaú Ramírez",
            fechaInicio: "01/08/2026",
            fechaVencimiento: "01/08/2027"
        },

        {
            id: 2,
            numero: "ETS-002",
            plan: "Esencial",
            estado: "Por renovar",
            negocio: "Sucursal Norte",
            telefono: "3387654321",
            direccion: "Zapopan, Jalisco",
            correo: "norte@negocio.com",
            responsable: "Isaú Ramírez",
            fechaInicio: "15/08/2025",
            fechaVencimiento: "15/08/2026"
        }
    ];


    // Crear información inicial solamente si todavía no existe
    if (!localStorage.getItem("clienteETS")) {
        localStorage.setItem(
            "clienteETS",
            JSON.stringify(clienteInicial)
        );
    }

    if (!localStorage.getItem("polizasETS")) {
        localStorage.setItem(
            "polizasETS",
            JSON.stringify(polizasIniciales)
        );
    }


    let cliente = JSON.parse(
        localStorage.getItem("clienteETS")
    );

    let polizas = JSON.parse(
        localStorage.getItem("polizasETS")
    );


    function guardarCliente() {
        localStorage.setItem(
            "clienteETS",
            JSON.stringify(cliente)
        );
    }


    function guardarPolizas() {
        localStorage.setItem(
            "polizasETS",
            JSON.stringify(polizas)
        );
    }
    function getTickets() {
    return JSON.parse(localStorage.getItem("etsDemoTickets")) || [];
    }

    function saveTickets(tickets) {
        localStorage.setItem("etsDemoTickets", JSON.stringify(tickets));
    }
    // Crear un nuevo ticket
const newTicketForm = document.getElementById(
    "newTicketForm"
);

if (newTicketForm) {

    const ticketPolicy = document.getElementById(
        "ticketPolicy"
    );

    const polizasActivas = polizas.filter(
        function (poliza) {
            return poliza.estado !== "Cancelada";
        }
    );


    // Mostrar las pólizas disponibles
    polizasActivas.forEach(function (poliza) {

        const opcion = document.createElement(
            "option"
        );

        opcion.value = poliza.id;

        opcion.textContent =
            poliza.negocio +
            " - Plan " +
            poliza.plan;

        ticketPolicy.appendChild(opcion);
    });


    newTicketForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            const tickets = getTickets();

            const nuevoNumero =
                String(tickets.length + 1)
                    .padStart(3, "0");


            const nuevoTicket = {

                id: "TKT-" + nuevoNumero,

                idPoliza: Number(
                    ticketPolicy.value
                ),

                modalidad:
                    document.getElementById(
                        "ticketModality"
                    ).value,

                concepto:
                    document.getElementById(
                        "ticketConcept"
                    ).value.trim(),

                descripcion:
                    document.getElementById(
                        "ticketDescription"
                    ).value.trim(),

                estado: "Pendiente",

                idEmpleado: null,

                notasTecnico: "",

                fechaCreacion:
                    new Date()
                        .toLocaleDateString("es-MX"),

                fechaAtencion: null,

                conformidadCliente: false,

                fechaCierre: null
            };


            tickets.push(nuevoTicket);

            saveTickets(tickets);

            window.location.href =
                "tickets_cliente.html?created=1";
        }
    );
}



    function obtenerIniciales(nombre, apellido) {

        const inicialNombre = nombre
            ? nombre.charAt(0).toUpperCase()
            : "";

        const inicialApellido = apellido
            ? apellido.charAt(0).toUpperCase()
            : "";

        return inicialNombre + inicialApellido;
    }


    function obtenerClaseEstado(estado) {

        if (estado === "Activa") {
            return "status-active";
        }

        if (estado === "Por renovar") {
            return "status-renew";
        }

        return "status-cancelled";
    }


    function obtenerFechaActual() {

        const fecha = new Date();

        return fecha.toLocaleDateString("es-MX");
    }


    function obtenerFechaVencimiento() {

        const fecha = new Date();

        fecha.setFullYear(
            fecha.getFullYear() + 1
        );

        return fecha.toLocaleDateString("es-MX");
    }


    // Colocar el nombre del cliente en las diferentes páginas
    document
        .querySelectorAll("[data-client-name]")
        .forEach(function (elemento) {
            elemento.textContent = cliente.nombre;
        });


    document
        .querySelectorAll("[data-client-fullname]")
        .forEach(function (elemento) {
            elemento.textContent =
                cliente.nombre + " " + cliente.apellido;
        });


    document
        .querySelectorAll("[data-client-email]")
        .forEach(function (elemento) {
            elemento.textContent = cliente.correo;
        });


    document
        .querySelectorAll("[data-client-initials]")
        .forEach(function (elemento) {
            elemento.textContent = obtenerIniciales(
                cliente.nombre,
                cliente.apellido
            );
        });


    // Mostrar pólizas en el panel principal
    const dashboardPolicies = document.getElementById(
        "dashboardPolicies"
    );

    const activePolicies = document.getElementById(
        "activePolicies"
    );


    if (activePolicies) {

        const totalActivas = polizas.filter(
            function (poliza) {
                return poliza.estado !== "Cancelada";
            }
        ).length;

        activePolicies.textContent = totalActivas;
    }


    if (dashboardPolicies) {

        const polizasVisibles = polizas
            .filter(function (poliza) {
                return poliza.estado !== "Cancelada";
            })
            .slice(0, 2);

        if (polizasVisibles.length === 0) {

            dashboardPolicies.innerHTML = `
                <div class="empty-policy">
                    <i class="bi bi-shield-plus"></i>

                    <div>
                        <strong>No tienes pólizas activas</strong>

                        <p class="mb-0">
                            Contrata una cobertura para comenzar.
                        </p>
                    </div>
                </div>
            `;

        } else {

            dashboardPolicies.innerHTML =
                polizasVisibles.map(function (poliza) {

                    return `
                        <a
                            href="detalle_poliza.html?id=${poliza.id}"
                            class="dashboard-policy"
                        >
                            <span class="dashboard-policy-icon">
                                <i class="bi bi-shield-check"></i>
                            </span>

                            <div>
                                <strong>${poliza.negocio}</strong>

                                <small>
                                    Plan ${poliza.plan}
                                </small>
                            </div>

                            <span class="policy-status ${obtenerClaseEstado(poliza.estado)}">
                                ${poliza.estado}
                            </span>

                            <i class="bi bi-chevron-right"></i>
                        </a>
                    `;
                }).join("");
        }
    }


    // Mostrar todas las pólizas
    const policiesGrid = document.getElementById(
        "policiesGrid"
    );

    function mostrarTickets(filtro = "all") {

    const contenedor =
        document.getElementById("ticketsList");

    if (!contenedor) return;


    const tickets = getTickets().filter(
        function (ticket) {
            return ticketCoincideFiltro(
                ticket,
                filtro
            );
        }
    );


    if (tickets.length === 0) {

        contenedor.innerHTML = `
            <div class="empty-state">

                <i class="bi bi-ticket-perforated"></i>

                <h2 class="h5">
                    No hay tickets en esta sección
                </h2>

                <p class="text-secondary mb-0">
                    Cuando solicites soporte,
                    tus tickets aparecerán aquí.
                </p>

            </div>
        `;

        return;
    }


    contenedor.innerHTML = tickets.map(
        function (ticket) {

            const poliza = polizas.find(
                function (poliza) {
                    return poliza.id === ticket.idPoliza;
                }
            );

            const nombrePoliza = poliza
                ? poliza.negocio + " - Plan " + poliza.plan
                : "Póliza no disponible";


            return `
                <article class="policy-row">

                    <div class="policy-symbol">
                        <i class="bi bi-ticket-perforated"></i>
                    </div>

                    <div class="flex-grow-1">

                        <div class="d-flex flex-wrap
                            align-items-center gap-2 mb-1">

                            <h2 class="h6 fw-bold mb-0">
                                ${ticket.concepto}
                            </h2>

                            <span class="policy-status
                                ${claseEstadoTicket(ticket.estado)}">

                                ${ticket.estado}

                            </span>

                        </div>

                        <p class="text-secondary small mb-1">

                            <strong>${ticket.id}</strong>
                            · ${ticket.modalidad}
                            · ${ticket.fechaCreacion}

                        </p>

                        <p class="text-secondary small mb-0">

                            <i class="bi bi-file-earmark-check me-1"></i>
                            ${nombrePoliza}

                        </p>

                    </div>

                    <a href="detalle_ticket.html?id=${ticket.id}"
                        class="btn btn-sm btn-outline-success">

                        Ver detalle

                    </a>

                </article>
            `;
        }
    ).join("");
}


function configurarFiltrosTickets() {

    document
        .querySelectorAll("[data-ticket-filter]")
        .forEach(function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll("[data-ticket-filter]")
                        .forEach(function (item) {
                            item.classList.remove("active");
                        });

                    boton.classList.add("active");

                    mostrarTickets(
                        boton.dataset.ticketFilter
                    );
                }
            );

        });
}


    function mostrarPolizas(filtro) {

        if (!policiesGrid) {
            return;
        }

        let polizasFiltradas = polizas;

        if (filtro !== "all") {

            polizasFiltradas = polizas.filter(
                function (poliza) {
                    return poliza.estado === filtro;
                }
            );
        }

        if (polizasFiltradas.length === 0) {

            policiesGrid.innerHTML = `
                <div class="col-12">

                    <div class="empty-policy text-center">
                        <i class="bi bi-inbox"></i>

                        <h2 class="h5 mt-3">
                            No hay pólizas en esta categoría
                        </h2>

                        <p class="text-secondary mb-0">
                            Prueba seleccionando otro filtro.
                        </p>
                    </div>

                </div>
            `;

            return;
        }

        policiesGrid.innerHTML =
            polizasFiltradas.map(function (poliza) {

                const cobertura = planes[poliza.plan];

                return `
                    <div class="col-md-6 col-xl-4">

                        <article class="policy-card h-100">

                            <div class="d-flex justify-content-between align-items-start mb-4">

                                <span class="policy-card-icon">
                                    <i class="bi bi-shield-check"></i>
                                </span>

                                <span class="policy-status ${obtenerClaseEstado(poliza.estado)}">
                                    ${poliza.estado}
                                </span>

                            </div>

                            <small class="text-secondary">
                                Póliza #${poliza.numero}
                            </small>

                            <h2 class="h5 fw-bold mt-1 mb-1">
                                ${poliza.negocio}
                            </h2>

                            <p class="text-secondary">
                                Plan ${poliza.plan}
                            </p>

                            <div class="policy-card-data">

                                <span>
                                    <i class="bi bi-pc-display"></i>
                                    Hasta ${cobertura.dispositivos} dispositivos
                                </span>

                                <span>
                                    <i class="bi bi-calendar-check"></i>
                                    Vence ${poliza.fechaVencimiento}
                                </span>

                            </div>

                            <a
                                href="detalle_poliza.html?id=${poliza.id}"
                                class="btn btn-outline-success w-100 mt-4"
                            >
                                Ver detalles
                                <i class="bi bi-arrow-right ms-1"></i>
                            </a>

                        </article>

                    </div>
                `;
            }).join("");
    }


    if (policiesGrid) {
        mostrarPolizas("all");
    }


    document
        .querySelectorAll("[data-policy-filter]")
        .forEach(function (boton) {

            boton.addEventListener("click", function () {

                document
                    .querySelectorAll("[data-policy-filter]")
                    .forEach(function (otroBoton) {
                        otroBoton.classList.remove("active");
                    });

                boton.classList.add("active");

                mostrarPolizas(
                    boton.dataset.policyFilter
                );
            });
        });


    // Formulario para crear una póliza
    const newPolicyForm = document.getElementById(
        "newPolicyForm"
    );


    if (newPolicyForm) {

        newPolicyForm.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();

                const planSeleccionado = document.querySelector(
                    'input[name="policyPlan"]:checked'
                );

                if (!planSeleccionado) {
                    return;
                }

                const nuevoId = polizas.length > 0
                    ? Math.max(
                        ...polizas.map(function (poliza) {
                            return poliza.id;
                        })
                    ) + 1
                    : 1;

                const nuevaPoliza = {
                    id: nuevoId,
                    numero: "ETS-" + String(nuevoId).padStart(3, "0"),
                    plan: planSeleccionado.value,
                    estado: "Activa",
                    negocio: document.getElementById(
                        "businessName"
                    ).value.trim(),
                    telefono: document.getElementById(
                        "businessPhone"
                    ).value.trim(),
                    direccion: document.getElementById(
                        "businessAddress"
                    ).value.trim(),
                    correo: document.getElementById(
                        "businessEmail"
                    ).value.trim(),
                    responsable: document.getElementById(
                        "businessContact"
                    ).value.trim(),
                    fechaInicio: obtenerFechaActual(),
                    fechaVencimiento: obtenerFechaVencimiento()
                };

                polizas.push(nuevaPoliza);

                guardarPolizas();

                window.location.href =
                    "detalle_poliza.html?id=" + nuevaPoliza.id;
            }
        );
    }


    // Información y edición del perfil
    const profileForm = document.getElementById(
        "profileForm"
    );


    if (profileForm) {

        const profileName = document.getElementById(
            "profileName"
        );

        const profileLastName = document.getElementById(
            "profileLastName"
        );

        const profilePhone = document.getElementById(
            "profilePhone"
        );

        const profileEmail = document.getElementById(
            "profileEmail"
        );

        const profileCompany = document.getElementById(
            "profileCompany"
        );


        profileName.value = cliente.nombre;
        profileLastName.value = cliente.apellido;
        profilePhone.value = cliente.telefono;
        profileEmail.value = cliente.correo;
        profileCompany.value = cliente.empresa;


        profileForm.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();

                cliente.nombre = profileName.value.trim();
                cliente.apellido = profileLastName.value.trim();
                cliente.telefono = profilePhone.value.trim();
                cliente.correo = profileEmail.value.trim();
                cliente.empresa = profileCompany.value.trim();

                guardarCliente();

                const profileAlert = document.getElementById(
                    "profileAlert"
                );

                profileAlert.classList.remove("d-none");

                document
                    .querySelector("[data-client-fullname]")
                    .textContent =
                    cliente.nombre + " " + cliente.apellido;

                document
                    .querySelector("[data-client-email]")
                    .textContent = cliente.correo;

                document
                    .querySelector("[data-client-initials]")
                    .textContent = obtenerIniciales(
                        cliente.nombre,
                        cliente.apellido
                    );
            }
        );
    }


    // Botón para mostrar u ocultar la contraseña
    document
        .querySelectorAll("[data-toggle-password]")
        .forEach(function (boton) {

            boton.addEventListener("click", function () {

                const campo = document.getElementById(
                    "profilePassword"
                );

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


    // Detalle de una póliza
    const policyDetailContent = document.getElementById(
        "policyDetailContent"
    );


    if (policyDetailContent) {

        const parametros = new URLSearchParams(
            window.location.search
        );

        const idPoliza = Number(
            parametros.get("id")
        );

        let polizaSeleccionada = polizas.find(
            function (poliza) {
                return poliza.id === idPoliza;
            }
        );


        if (!polizaSeleccionada) {

            document
                .getElementById("policyNotFound")
                .classList.remove("d-none");

            policyDetailContent.classList.add("d-none");

        } else {

            cargarDetallePoliza(polizaSeleccionada);


            function cargarDetallePoliza(poliza) {

                const cobertura = planes[poliza.plan];

                const policyStatus = document.getElementById(
                    "policyStatus"
                );

                policyStatus.textContent = poliza.estado;

                policyStatus.className =
                    "policy-status " +
                    obtenerClaseEstado(poliza.estado);

                document.getElementById(
                    "policyNumber"
                ).textContent = "Póliza #" + poliza.numero;

                document.getElementById(
                    "policyBusinessName"
                ).textContent = poliza.negocio;

                document.getElementById(
                    "policyPlanName"
                ).textContent = poliza.plan;

                document.getElementById(
                    "detailBusinessName"
                ).textContent = poliza.negocio;

                document.getElementById(
                    "detailBusinessContact"
                ).textContent = poliza.responsable;

                document.getElementById(
                    "detailBusinessPhone"
                ).textContent = poliza.telefono;

                document.getElementById(
                    "detailBusinessEmail"
                ).textContent = poliza.correo;

                document.getElementById(
                    "detailBusinessAddress"
                ).textContent = poliza.direccion;

                document.getElementById(
                    "policyDevices"
                ).textContent = cobertura.dispositivos;

                document.getElementById(
                    "policyOnsite"
                ).textContent = cobertura.presenciales;

                document.getElementById(
                    "policyRemote"
                ).textContent = cobertura.remotos;

                document.getElementById(
                    "policyConsulting"
                ).textContent = cobertura.asesorias;

                document.getElementById(
                    "policyStartDate"
                ).textContent = poliza.fechaInicio;

                document.getElementById(
                    "policyEndDate"
                ).textContent = poliza.fechaVencimiento;


                document.getElementById(
                    "editBusinessName"
                ).value = poliza.negocio;

                document.getElementById(
                    "editBusinessContact"
                ).value = poliza.responsable;

                document.getElementById(
                    "editBusinessPhone"
                ).value = poliza.telefono;

                document.getElementById(
                    "editBusinessEmail"
                ).value = poliza.correo;

                document.getElementById(
                    "editBusinessAddress"
                ).value = poliza.direccion;

                document.getElementById(
                    "newPolicyPlan"
                ).value = poliza.plan;


                if (poliza.estado === "Cancelada") {

                    document.getElementById(
                        "cancelPolicyButton"
                    ).disabled = true;

                    document.getElementById(
                        "renewPolicyButton"
                    ).disabled = false;

                } else {

                    document.getElementById(
                        "cancelPolicyButton"
                    ).disabled = false;
                }
            }


            const editPolicyForm = document.getElementById(
                "editPolicyForm"
            );


            editPolicyForm.addEventListener(
                "submit",
                function (evento) {

                    evento.preventDefault();

                    polizaSeleccionada.negocio =
                        document.getElementById(
                            "editBusinessName"
                        ).value.trim();

                    polizaSeleccionada.responsable =
                        document.getElementById(
                            "editBusinessContact"
                        ).value.trim();

                    polizaSeleccionada.telefono =
                        document.getElementById(
                            "editBusinessPhone"
                        ).value.trim();

                    polizaSeleccionada.correo =
                        document.getElementById(
                            "editBusinessEmail"
                        ).value.trim();

                    polizaSeleccionada.direccion =
                        document.getElementById(
                            "editBusinessAddress"
                        ).value.trim();

                    guardarPolizas();

                    cargarDetallePoliza(
                        polizaSeleccionada
                    );

                    bootstrap.Modal.getInstance(
                        document.getElementById(
                            "editPolicyModal"
                        )
                    ).hide();
                }
            );


            const changePlanForm = document.getElementById(
                "changePlanForm"
            );


            changePlanForm.addEventListener(
                "submit",
                function (evento) {

                    evento.preventDefault();

                    polizaSeleccionada.plan =
                        document.getElementById(
                            "newPolicyPlan"
                        ).value;

                    guardarPolizas();

                    cargarDetallePoliza(
                        polizaSeleccionada
                    );

                    bootstrap.Modal.getInstance(
                        document.getElementById(
                            "changePlanModal"
                        )
                    ).hide();
                }
            );


            document
                .getElementById("renewPolicyButton")
                .addEventListener("click", function () {

                    polizaSeleccionada.estado = "Activa";
                    polizaSeleccionada.fechaInicio =
                        obtenerFechaActual();
                    polizaSeleccionada.fechaVencimiento =
                        obtenerFechaVencimiento();

                    guardarPolizas();

                    cargarDetallePoliza(
                        polizaSeleccionada
                    );
                });


            document
                .getElementById("confirmCancelPolicy")
                .addEventListener("click", function () {

                    polizaSeleccionada.estado = "Cancelada";

                    guardarPolizas();

                    cargarDetallePoliza(
                        polizaSeleccionada
                    );

                    bootstrap.Modal.getInstance(
                        document.getElementById(
                            "cancelPolicyModal"
                        )
                    ).hide();
                });
        }
    }

    function mostrarDetalleTicket() {

    const contenedor =
        document.getElementById("ticketDetail");

    if (!contenedor) return;


    const parametros =
        new URLSearchParams(window.location.search);

    const idTicket = parametros.get("id");

    const tickets = getTickets();

    const ticket = tickets.find(
        function (ticket) {
            return ticket.id === idTicket;
        }
    );


    if (!ticket) {

        contenedor.innerHTML = `
            <div class="glass-card rounded-4 p-5
                shadow-sm text-center">

                <i class="bi bi-exclamation-circle
                    fs-1 text-secondary"></i>

                <h1 class="h4 mt-3">
                    Ticket no encontrado
                </h1>

                <p class="text-secondary">
                    No fue posible encontrar
                    la solicitud seleccionada.
                </p>

                <a href="tickets_cliente.html"
                    class="btn btn-success">

                    Volver a mis tickets

                </a>

            </div>
        `;

        return;
    }


    const poliza = polizas.find(
        function (poliza) {
            return poliza.id === ticket.idPoliza;
        }
    );

    const nombrePoliza = poliza
        ? poliza.negocio + " - Plan " + poliza.plan
        : "Póliza no disponible";


    let tecnico = "Pendiente de asignación";

    if (ticket.idEmpleado) {
        tecnico = "Técnico #" + ticket.idEmpleado;
    }


    let accionesConformidad = "";

    if (ticket.estado === "Pendiente conformidad") {

        accionesConformidad = `
            <section class="glass-card rounded-4
                p-4 shadow-sm mt-4">

                <div class="mb-3">

                    <span class="eyebrow">
                        Confirmación del servicio
                    </span>

                    <h2 class="h5 fw-bold mt-2">
                        ¿El problema quedó solucionado?
                    </h2>

                    <p class="text-secondary mb-0">
                        Confirma el resultado del servicio
                        realizado por el técnico.
                    </p>

                </div>


                <div class="d-flex flex-column
                    flex-sm-row gap-2">

                    <button id="confirmTicket"
                        class="btn btn-success">

                        <i class="bi bi-check-circle me-1"></i>
                        Sí, quedó solucionado

                    </button>

                    <button id="continueTicket"
                        class="btn btn-outline-danger">

                        <i class="bi bi-arrow-counterclockwise me-1"></i>
                        El problema continúa

                    </button>

                </div>

            </section>
        `;
    }


    contenedor.innerHTML = `

        <section class="glass-card rounded-4
            p-4 p-lg-5 shadow-sm">

            <div class="d-flex flex-column
                flex-md-row justify-content-between
                gap-3 mb-4">

                <div>

                    <span class="eyebrow">
                        ${ticket.id}
                    </span>

                    <h1 class="h2 fw-bold mt-2 mb-2">
                        ${ticket.concepto}
                    </h1>

                    <span class="policy-status
                        ${claseEstadoTicket(ticket.estado)}">

                        ${ticket.estado}

                    </span>

                </div>

                <div class="text-md-end">

                    <small class="text-secondary d-block">
                        Fecha de creación
                    </small>

                    <strong>
                        ${ticket.fechaCreacion}
                    </strong>

                </div>

            </div>


            <hr>


            <div class="row g-4 mt-1">

                <div class="col-md-6">

                    <small class="text-secondary">
                        Póliza
                    </small>

                    <p class="fw-semibold mb-0">
                        ${nombrePoliza}
                    </p>

                </div>


                <div class="col-md-6">

                    <small class="text-secondary">
                        Modalidad
                    </small>

                    <p class="fw-semibold mb-0">
                        ${ticket.modalidad}
                    </p>

                </div>


                <div class="col-md-6">

                    <small class="text-secondary">
                        Técnico asignado
                    </small>

                    <p class="fw-semibold mb-0">
                        ${tecnico}
                    </p>

                </div>


                <div class="col-md-6">

                    <small class="text-secondary">
                        Fecha de atención
                    </small>

                    <p class="fw-semibold mb-0">
                        ${ticket.fechaAtencion || "Pendiente"}
                    </p>

                </div>

            </div>


            <hr class="my-4">


            <div>

                <h2 class="h5 fw-bold">
                    Descripción del problema
                </h2>

                <p class="text-secondary mb-0">
                    ${ticket.descripcion}
                </p>

            </div>


            ${
                ticket.notasTecnico
                    ? `
                        <hr class="my-4">

                        <div>

                            <h2 class="h5 fw-bold">
                                Notas del técnico
                            </h2>

                            <p class="text-secondary mb-0">
                                ${ticket.notasTecnico}
                            </p>

                        </div>
                    `
                    : ""
            }

        </section>

        ${accionesConformidad}
    `;


    const botonConfirmar =
        document.getElementById("confirmTicket");

    const botonContinuar =
        document.getElementById("continueTicket");


    if (botonConfirmar) {

        botonConfirmar.addEventListener(
            "click",
            function () {

                ticket.conformidadCliente = true;
                ticket.estado = "Cerrado";

                ticket.fechaCierre =
                    new Date()
                        .toLocaleDateString("es-MX");

                saveTickets(tickets);

                mostrarDetalleTicket();
            }
        );
    }


    if (botonContinuar) {

        botonContinuar.addEventListener(
            "click",
            function () {

                ticket.conformidadCliente = false;
                ticket.estado = "Proceso";

                saveTickets(tickets);

                mostrarDetalleTicket();
            }
        );
    }

}
    mostrarTickets();
    configurarFiltrosTickets();
    mostrarDetalleTicket();


});

function resaltarPaginaActual() {

    const paginaActual =
        window.location.pathname.split("/").pop()
        || "indexcliente.html";

    const paginasPolizas = [
        "polizas_cliente.html",
        "nueva_poliza.html",
        "detalle_poliza.html"
    ];

    const paginasTickets = [
        "tickets_cliente.html",
        "nuevo_ticket.html",
        "detalle_ticket.html"
    ];

    document
        .querySelectorAll(".client-nav-link")
        .forEach(function (enlace) {

            const paginaEnlace = enlace
                .getAttribute("href")
                .split("?")[0];

            const estaActivo =
                paginaEnlace === paginaActual ||

                (
                    paginaEnlace === "polizas_cliente.html" &&
                    paginasPolizas.includes(paginaActual)
                ) ||

                (
                    paginaEnlace === "tickets_cliente.html" &&
                    paginasTickets.includes(paginaActual)
                );

            enlace.classList.toggle("active", estaActivo);

            if (estaActivo) {
                enlace.setAttribute("aria-current", "page");
            } else {
                enlace.removeAttribute("aria-current");
            }
        });
}


function claseEstadoTicket(estado) {

    if (estado === "Cerrado") {
        return "status-active";
    }

    if (
        estado === "Asignado" ||
        estado === "Proceso" ||
        estado === "Pendiente conformidad"
    ) {
        return "status-warning";
    }

    return "status-cancelled";
}


function ticketCoincideFiltro(ticket, filtro) {

    if (filtro === "all") {
        return true;
    }

    if (filtro === "Pendiente") {
        return ticket.estado === "Pendiente";
    }

    if (filtro === "Atencion") {

        return [
            "Asignado",
            "Proceso",
            "Pendiente conformidad"
        ].includes(ticket.estado);
    }

    if (filtro === "Cerrado") {
        return ticket.estado === "Cerrado";
    }

    return true;
}


