<?php
include("../backend_general/conexion.php");


//esta es la consulta cawn
$query = "SELECT idTicket, conceptoT, statusT, modalidadAtencionT, fechaCreacionT 
          FROM ticket 
          WHERE idEmpleado = ?
          ORDER BY fechaCreacionT DESC";

//preparar cawn
$stmt = $mysqli->prepare($query);
//sustituir cawn
$stmt->bind_param("i", $_GET['idEmpleado']);
//ejecutar cawn
$stmt->execute();
//obtener resultados cawn
$resultado = $stmt->get_result();

//aqui lo vuelve un arreglo cawn
$tickets = array();

//mientras halla resultados sigue metiendo cawn
while ($row = $resultado->fetch_assoc()) {
    $tickets[] = $row;
}

//aqui lo entra el yeison pa que lo traduzca
echo json_encode($tickets);

//y aqui se acabo el pedo cawn
$stmt->close();
include("../backend_general/cerrar_conexion.php");
?>