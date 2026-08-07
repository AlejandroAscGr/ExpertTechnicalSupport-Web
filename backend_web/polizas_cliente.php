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


// Busca las pólizas que pertenecen al cliente y obtiene su plan
$query = "
    SELECT
        p.idPoliza,
        p.nombreEmpresaP,
        p.idPlan,
        pl.nombreP,
        pl.maxPres,
        pl.maxRem,
        pl.maxAse
    FROM poliza p

    INNER JOIN plan pl
        ON p.idPlan = pl.idPlan

    WHERE p.idCliente = ?

    ORDER BY p.idPoliza
";


$stmt = $mysqli->prepare($query);

// Muestra el error real si la consulta no pudo prepararse
if (!$stmt) {
    die("Error al preparar la consulta: " . $mysqli->error);
}


// Coloca el id del cliente en el signo ?
$stmt->bind_param("i", $idCliente);

$stmt->execute();

$resultado = $stmt->get_result();

$polizas = [];


// Guarda cada póliza encontrada en el arreglo
while ($row = $resultado->fetch_assoc()) {

    $polizas[] = $row;
}


// Devuelve las pólizas al frontend en formato JSON
echo json_encode([
    "success" => true,
    "polizas" => $polizas
]);


$stmt->close();
$mysqli->close();

?>