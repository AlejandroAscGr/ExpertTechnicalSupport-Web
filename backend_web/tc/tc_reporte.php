<?php
session_start();
include("../../backend_general/conexion.php");
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION['idEmpleado']) || $_SESSION['perfil'] !== 'TECNICO') {
    echo json_encode(["success" => false, "mensaje" => "Acceso denegado"]);
    exit;
}

$idEmpleado = $_SESSION['idEmpleado'];
$mesActual = date('m'); 
$anioActual = date('Y');

$query = "SELECT idTicket, conceptoT, statusT, modalidadAtencionT, fechaCreacionT
          FROM ticket
          WHERE idEmpleado = ? AND MONTH(fechaCreacionT) = ? AND YEAR(fechaCreacionT) = ?
          ORDER BY fechaCreacionT DESC";

$stmt = $mysqli->prepare($query);
$stmt->bind_param("iii", $idEmpleado, $mesActual, $anioActual);
$stmt->execute();
$resultado = $stmt->get_result();

$tickets = [];
$total = 0; $cerrados = 0; $proceso = 0; $asignados = 0;
$modalidades = ["Presencial" => 0, "Remoto" => 0, "Asesoria" => 0];

while($row = $resultado->fetch_assoc()){
    $tickets[] = $row;
    $total++;
    
    // Conteo por estatus
    if($row['statusT'] == 'Cerrado') $cerrados++;
    else if($row['statusT'] == 'Proceso') $proceso++;
    else if($row['statusT'] == 'Asignado') $asignados++;

    // Conteo por modalidad para la gráfica
    if(isset($modalidades[$row['modalidadAtencionT']])) {
        $modalidades[$row['modalidadAtencionT']]++;
    }
}

$progreso = $total > 0 ? round(($cerrados / $total) * 100) : 0;
$meses = ["01"=>"Enero","02"=>"Febrero","03"=>"Marzo","04"=>"Abril","05"=>"Mayo","06"=>"Junio","07"=>"Julio","08"=>"Agosto","09"=>"Septiembre","10"=>"Octubre","11"=>"Noviembre","12"=>"Diciembre"];

echo json_encode([
    "success" => true,
    "tecnico" => $_SESSION['usuario'],
    "mesNombre" => $meses[$mesActual],
    "anio" => $anioActual,
    "total" => $total,
    "cerrados" => $cerrados,
    "proceso" => $proceso,
    "asignados" => $asignados,
    "progreso" => $progreso,
    "historial" => $tickets,
    "graficas" => [
        "estatus" => [$cerrados, $proceso, $asignados],
        "modalidad" => [$modalidades["Presencial"], $modalidades["Remoto"], $modalidades["Asesoria"]]
    ]
]);

$stmt->close();
$mysqli->close();
?>