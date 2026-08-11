<?php

session_start();
include("../backend_general/conexion.php");

header("Content-Type: application/json; charset=utf-8");


if (!isset($_SESSION['idCliente'])) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No hay una sesión de cliente activa"
    ]);

    exit;
}


$idCliente = intval($_SESSION['idCliente']);

$nombrePlan = trim(
    $_POST['nombrePlan'] ?? ""
);

$empresa = trim(
    $_POST['empresa'] ?? ""
);

$telefono = trim(
    $_POST['telefono'] ?? ""
);

$direccion = trim(
    $_POST['direccion'] ?? ""
);

$correo = trim(
    $_POST['correo'] ?? ""
);


// Comprueba los campos obligatorios
if (
    empty($nombrePlan) ||
    empty($empresa) ||
    empty($telefono) ||
    empty($direccion) ||
    empty($correo)
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Completa todos los campos obligatorios"
    ]);

    exit;
}


// Valida el correo
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El correo no tiene un formato válido"
    ]);

    exit;
}


// Valida los planes aceptados
$planesValidos = [
    "Esencial",
    "Profesional",
    "Empresarial"
];


if (
    !in_array(
        $nombrePlan,
        $planesValidos,
        true
    )
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El plan seleccionado no es válido"
    ]);

    exit;
}


// Obtiene el ID real del plan
$queryPlan = "
    SELECT idPlan

    FROM plan

    WHERE nombreP = ?

    LIMIT 1
";


$stmtPlan = $mysqli->prepare($queryPlan);


if (!$stmtPlan) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


$stmtPlan->bind_param(
    "s",
    $nombrePlan
);


if (!$stmtPlan->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmtPlan->error
    ]);

    $stmtPlan->close();
    $mysqli->close();

    exit;
}


$resultadoPlan = $stmtPlan->get_result();
$plan = $resultadoPlan->fetch_assoc();


if (!$plan) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El plan seleccionado no existe"
    ]);

    $stmtPlan->close();
    $mysqli->close();

    exit;
}


$idPlan = intval($plan['idPlan']);

$stmtPlan->close();


// Registra la póliza con vigencia de un mes
$queryPoliza = "
    INSERT INTO poliza (
        idCliente,
        idPlan,
        nombreEmpresaP,
        direccionServicioP,
        correoP,
        telefonoP,
        estadoP,
        fechaInicioP,
        fechaVencimientoP
    )

    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'Activa',
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
    )
";


$stmtPoliza = $mysqli->prepare($queryPoliza);


if (!$stmtPoliza) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    $mysqli->close();

    exit;
}


$stmtPoliza->bind_param(
    "iissss",
    $idCliente,
    $idPlan,
    $empresa,
    $direccion,
    $correo,
    $telefono
);


if (!$stmtPoliza->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmtPoliza->error
    ]);

    $stmtPoliza->close();
    $mysqli->close();

    exit;
}


$idPoliza = $stmtPoliza->insert_id;


echo json_encode([
    "success" => true,
    "mensaje" => "Póliza contratada correctamente",
    "idPoliza" => $idPoliza
]);


$stmtPoliza->close();
$mysqli->close();

?>