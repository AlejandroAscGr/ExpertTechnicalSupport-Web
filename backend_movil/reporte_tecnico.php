<?php
include("../backend_general/conexion.php");

$idEmpleado = $_GET['idEmpleado'];

// aqui se obtiene el mes y año actual del servidor cawn
$mesActual = date('m');
$anioActual = date('Y');

// aqui se traen todos los tickets del tecnico del mes actual cawn
$query = "SELECT 
    t.idTicket,
    t.conceptoT,
    t.statusT,
    t.modalidadAtencionT,
    t.fechaCreacionT
FROM ticket t
WHERE t.idEmpleado = ?
AND MONTH(t.fechaCreacionT) = ?
AND YEAR(t.fechaCreacionT) = ?
ORDER BY t.fechaCreacionT DESC";
// es un querisote x k esta mamada es un reporte, tons se tiene que traer un chingo de informacion, cawn
// se trae el concepto del ticket, el estatus, la modalidad, y la fecha de creacion
// se ordena por fecha de creacion, de mas reciente a mas antiguo, cawn

// se prepara el statement cawn
$stmt = $mysqli->prepare($query);
$stmt->bind_param("iii", $idEmpleado, $mesActual, $anioActual);
$stmt->execute();
$resultado = $stmt->get_result();

// aqui se arma el arreglo de tickets cawn
$tickets = array();
$totalTickets = 0;
$cerrados = 0;
$enProceso = 0;
$asignados = 0;

while ($row = $resultado->fetch_assoc()) {
    $tickets[] = $row;
    $totalTickets++;

    // aqui se cuentan los tickets por estatus cawn
    if ($row['statusT'] == 'Cerrado') {
        $cerrados++;
    } else if ($row['statusT'] == 'Proceso') {
        $enProceso++;
    } else if ($row['statusT'] == 'Asignado') {
        $asignados++;
    }
}

// aqui se calcula el porcentaje de progreso cawn
$progreso = 0;
if ($totalTickets > 0) {
    $progreso = round(($cerrados / $totalTickets) * 100);
}

// aqui se arma la respuesta completa cawn
$respuesta = array(
    "mes" => date('F Y'), // nombre del mes en ingles, en kotlin lo traducimos
    "mesNumero" => $mesActual,
    "anio" => $anioActual,
    "totalTickets" => $totalTickets,
    "cerrados" => $cerrados,
    "enProceso" => $enProceso,
    "asignados" => $asignados,
    "progreso" => $progreso,
    "tickets" => $tickets
);


//aqui el yeison la traduce pa que el kotlin le entienda cawn
echo json_encode($respuesta);


// y pues aqui ya se acaba el pedo cawn
$stmt->close();
include("../backend_general/cerrar_conexion.php");
?>