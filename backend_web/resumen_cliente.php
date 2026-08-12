<?php
session_start();
include("../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idCliente'])) {
    echo json_encode(["success" => false, "mensaje" => "No has iniciado sesión."]);
    exit;
}

$idCliente = $_SESSION['idCliente'];

// Contadores Rápidos
$queryAbiertos = "SELECT COUNT(*) as total FROM ticket t JOIN poliza p ON t.idPoliza = p.idPoliza WHERE p.idCliente = ? AND t.statusT != 'Cerrado'";
$stmt = $mysqli->prepare($queryAbiertos);
$stmt->bind_param("i", $idCliente);
$stmt->execute();
$abiertos = $stmt->get_result()->fetch_assoc()['total'];

$queryCerrados = "SELECT COUNT(*) as total FROM ticket t JOIN poliza p ON t.idPoliza = p.idPoliza WHERE p.idCliente = ? AND t.statusT = 'Cerrado'";
$stmt2 = $mysqli->prepare($queryCerrados);
$stmt2->bind_param("i", $idCliente);
$stmt2->execute();
$resueltos = $stmt2->get_result()->fetch_assoc()['total'];

// Grafica Tickets por Empresa
$queryEmpresas = "SELECT p.nombreEmpresaP, COUNT(t.idTicket) as cantidad FROM ticket t JOIN poliza p ON t.idPoliza = p.idPoliza WHERE p.idCliente = ? GROUP BY p.nombreEmpresaP LIMIT 5";
$stmt3 = $mysqli->prepare($queryEmpresas);
$stmt3->bind_param("i", $idCliente);
$stmt3->execute();
$resEmpresas = $stmt3->get_result();
$graficaEmpresas = [];
while($r = $resEmpresas->fetch_assoc()){ $graficaEmpresas[] = $r; }

// Grafica Tickets por Estatus
$queryStatus = "SELECT t.statusT, COUNT(t.idTicket) as cantidad FROM ticket t JOIN poliza p ON t.idPoliza = p.idPoliza WHERE p.idCliente = ? GROUP BY t.statusT";
$stmt4 = $mysqli->prepare($queryStatus);
$stmt4->bind_param("i", $idCliente);
$stmt4->execute();
$resStatus = $stmt4->get_result();
$graficaStatus = [];
while($r = $resStatus->fetch_assoc()){ $graficaStatus[] = $r; }

// Grafica Tickets por Mes (ultimos 6 meses)
$queryMeses = "SELECT DATE_FORMAT(t.fechaCreacionT, '%Y-%m') as mes, COUNT(t.idTicket) as cantidad FROM ticket t JOIN poliza p ON t.idPoliza = p.idPoliza WHERE p.idCliente = ? GROUP BY mes ORDER BY mes DESC LIMIT 6";
$stmt5 = $mysqli->prepare($queryMeses);
$stmt5->bind_param("i", $idCliente);
$stmt5->execute();
$resMeses = $stmt5->get_result();
$graficaMeses = [];
while($r = $resMeses->fetch_assoc()){ $graficaMeses[] = $r; }

echo json_encode([
    "success" => true,
    "abiertos" => $abiertos,
    "resueltos" => $resueltos,
    "graficas" => [
        "empresas" => $graficaEmpresas,
        "status" => $graficaStatus,
        "meses" => array_reverse($graficaMeses) //mes más viejo quede a la izquierda
    ]
]);

$mysqli->close();
?>