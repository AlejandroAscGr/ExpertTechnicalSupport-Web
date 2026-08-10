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


$idCliente = $_SESSION['idCliente'];
$idPoliza = intval($_POST['idPoliza'] ?? 0);
$nombrePlanNuevo = trim($_POST['nombrePlan'] ?? "");


if (
    $idPoliza <= 0 ||
    empty($nombrePlanNuevo)
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "Selecciona un plan válido"
    ]);

    exit;
}


// Planes permitidos dentro del catálogo
$planesValidos = [
    "Esencial",
    "Profesional",
    "Empresarial"
];


// Consulta la póliza y comprueba que pertenezca al cliente
$queryActual = "
    SELECT
        p.estadoP,
        pl.nombreP AS planActual

    FROM poliza p

    INNER JOIN plan pl
        ON p.idPlan = pl.idPlan

    WHERE p.idPoliza = ?
    AND p.idCliente = ?

    LIMIT 1
";


$stmtActual = $mysqli->prepare($queryActual);


if (!$stmtActual) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


$stmtActual->bind_param(
    "ii",
    $idPoliza,
    $idCliente
);


if (!$stmtActual->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmtActual->error
    ]);

    exit;
}


$resultadoActual = $stmtActual->get_result();
$poliza = $resultadoActual->fetch_assoc();


if (!$poliza) {

    echo json_encode([
        "success" => false,
        "mensaje" => "La póliza no existe o no pertenece al cliente"
    ]);

    $stmtActual->close();
    $mysqli->close();

    exit;
}


if ($poliza['estadoP'] === "Cancelada") {

    echo json_encode([
        "success" => false,
        "mensaje" => "Primero debes renovar la póliza cancelada"
    ]);

    $stmtActual->close();
    $mysqli->close();

    exit;
}


$planActual = $poliza['planActual'];


if (
    !in_array(
        $planActual,
        $planesValidos,
        true
    ) ||
    !in_array(
        $nombrePlanNuevo,
        $planesValidos,
        true
    )
) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El plan seleccionado no es válido"
    ]);

    $stmtActual->close();
    $mysqli->close();

    exit;
}

// Impide enviar el mismo plan que ya tiene
if ($nombrePlanNuevo === $planActual) {

    echo json_encode([
        "success" => false,
        "mensaje" => "La póliza ya tiene seleccionado ese plan"
    ]);

    $stmtActual->close();
    $mysqli->close();

    exit;
}

$stmtActual->close();


// Obtiene el ID real del nuevo plan
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
    $nombrePlanNuevo
);


if (!$stmtPlan->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmtPlan->error
    ]);

    exit;
}


$resultadoPlan = $stmtPlan->get_result();
$planNuevo = $resultadoPlan->fetch_assoc();


if (!$planNuevo) {

    echo json_encode([
        "success" => false,
        "mensaje" => "El plan seleccionado no existe"
    ]);

    $stmtPlan->close();
    $mysqli->close();

    exit;
}


$idPlanNuevo = intval(
    $planNuevo['idPlan']
);

$stmtPlan->close();


// Actualiza solamente el plan de la póliza
$queryActualizar = "
    UPDATE poliza

    SET idPlan = ?

    WHERE idPoliza = ?
    AND idCliente = ?
";


$stmtActualizar = $mysqli->prepare(
    $queryActualizar
);


if (!$stmtActualizar) {

    echo json_encode([
        "success" => false,
        "mensaje" => $mysqli->error
    ]);

    exit;
}


$stmtActualizar->bind_param(
    "iii",
    $idPlanNuevo,
    $idPoliza,
    $idCliente
);


if (!$stmtActualizar->execute()) {

    echo json_encode([
        "success" => false,
        "mensaje" => $stmtActualizar->error
    ]);

    exit;
}


if ($stmtActualizar->affected_rows === 0) {

    echo json_encode([
        "success" => false,
        "mensaje" => "No fue posible actualizar la póliza"
    ]);

    $stmtActualizar->close();
    $mysqli->close();

    exit;
}


echo json_encode([
    "success" => true,
    "mensaje" => "Plan de la póliza actualizado correctamente"
]);


$stmtActualizar->close();
$mysqli->close();

?>