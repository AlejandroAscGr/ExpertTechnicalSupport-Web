<?php

session_start();
include("../backend_general/conexion.php");

header("Content-Type: application/json; charset=utf-8");


// Comprueba que exista una sesión de cliente
if (!isset($_SESSION['idCliente'])) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No hay una sesión de cliente activa"
    ]);

    exit;
}


$idCliente = $_SESSION['idCliente'];

$idPoliza = $_POST['idPoliza'] ?? "";
$modalidad = $_POST['modalidad'] ?? "";
$concepto = trim($_POST['concepto'] ?? "");
$descripcion = trim($_POST['descripcion'] ?? "");


// Comprueba que se hayan recibido todos los datos
if (
    empty($idPoliza) ||
    empty($modalidad) ||
    empty($concepto) ||
    empty($descripcion)
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Faltan datos para crear el ticket"
    ]);

    exit;
}


// Busca la póliza y comprueba que pertenezca al cliente
$queryPoliza = "
    SELECT
        p.idPoliza,
        p.estadoP,
        p.fechaInicioP,
        p.fechaVencimientoP,
        pl.maxPres,
        pl.maxRem,
        pl.maxAse
    FROM poliza p

    INNER JOIN plan pl
        ON p.idPlan = pl.idPlan

    WHERE p.idPoliza = ?
      AND p.idCliente = ?

    LIMIT 1
";


$stmtPoliza = $mysqli->prepare($queryPoliza);

if (!$stmtPoliza) {
    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);
    exit;
}


$stmtPoliza->bind_param(
    "ii",
    $idPoliza,
    $idCliente
);

$stmtPoliza->execute();

$resultadoPoliza = $stmtPoliza->get_result();


// Comprueba que la póliza sea realmente del cliente
if ($resultadoPoliza->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "La póliza seleccionada no pertenece al cliente"
    ]);

    exit;
}


$poliza = $resultadoPoliza->fetch_assoc();


// Comprueba que la póliza esté activa y vigente
$fechaActual = date("Y-m-d");

if (
    $poliza['estadoP'] !== "Activa" ||
    $fechaActual < $poliza['fechaInicioP'] ||
    $fechaActual > $poliza['fechaVencimientoP']
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "La póliza seleccionada no está vigente"
    ]);

    exit;
}


// Determina el límite según la modalidad seleccionada
switch ($modalidad) {

    case "Presencial":
        $limite = $poliza['maxPres'];
        break;

    case "Remoto":
        $limite = $poliza['maxRem'];
        break;

    case "Asesoria":
        $limite = $poliza['maxAse'];
        break;

    default:

        echo json_encode([
            "success" => false,
            "mensaje" => "La modalidad seleccionada no es válida"
        ]);

        exit;
}


// Cuenta los servicios cerrados durante el mes actual
$queryConsumo = "
    SELECT COUNT(*) AS utilizados
    FROM ticket

    WHERE idPoliza = ?
      AND modalidadAtencionT = ?
      AND statusT = 'Cerrado'
      AND fechaCierreT >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      AND fechaCierreT < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
";


$stmtConsumo = $mysqli->prepare($queryConsumo);

$stmtConsumo->bind_param(
    "is",
    $idPoliza,
    $modalidad
);

$stmtConsumo->execute();

$consumo = $stmtConsumo
    ->get_result()
    ->fetch_assoc();


// Comprueba que todavía existan servicios disponibles
if ($consumo['utilizados'] >= $limite) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Ya se alcanzó el límite mensual de esta modalidad"
    ]);

    exit;
}


// Busca al siguiente técnico activo mediante Round Robin
$queryTecnico = "
    SELECT e.idEmpleado
    FROM empleado e

    WHERE e.rolEmp = 'Tecnico'
      AND e.estadoEmp = 'Activo'

    ORDER BY
        (
            e.idEmpleado > COALESCE(
                (
                    SELECT t.idEmpleado
                    FROM ticket t
                    WHERE t.idEmpleado IS NOT NULL
                    ORDER BY t.idTicket DESC
                    LIMIT 1
                ),
                0
            )
        ) DESC,
        e.idEmpleado ASC

    LIMIT 1
";


$resultadoTecnico = $mysqli->query($queryTecnico);


// Comprueba que exista algún técnico disponible
if ($resultadoTecnico->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No hay técnicos activos disponibles"
    ]);

    exit;
}


$tecnico = $resultadoTecnico->fetch_assoc();

$idEmpleado = $tecnico['idEmpleado'];


// Guarda el ticket con el técnico asignado
$queryTicket = "
    INSERT INTO ticket (
        idPoliza,
        idEmpleado,
        conceptoT,
        descripcionT,
        notasTecnico,
        statusT,
        modalidadAtencionT,
        fechaCreacionT,
        fechaCierreT
    )
    VALUES (?, ?, ?, ?, '', 'Asignado', ?, CURDATE(), NULL)
";


$stmtTicket = $mysqli->prepare($queryTicket);

if (!$stmtTicket) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


$stmtTicket->bind_param(
    "iisss",
    $idPoliza,
    $idEmpleado,
    $concepto,
    $descripcion,
    $modalidad
);

// Ejecuta el registro del ticket y comprueba que realmente se guarde
if (!$stmtTicket->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Error al guardar el ticket: " . $stmtTicket->error
    ]);

    exit;
}

$idTicket = $mysqli->insert_id;


// Confirma la creación del ticket
echo json_encode([
    "success" => true,
    "mensaje" => "Ticket creado correctamente",
    "idTicket" => $idTicket,
    "idEmpleado" => $idEmpleado
]);


$stmtPoliza->close();
$stmtConsumo->close();
$stmtTicket->close();
$mysqli->close();

?>