<?php
include ("../backend_general/conexion.php");

//este es el query cawn
// trae un filtrote con join y alias para que muestre el detalle del ticket 
// y el nombre del usuario que lo creo
// ya si hay que cambiarle algo ps vemos cawn 
$query = "SELECT 
    t.idTicket,
    t.conceptoT,
    t.descripcionT,
    t.notasTecnico,
    t.statusT,
    t.modalidadAtencionT,
    t.fechaCreacionT,
    t.fechaCierreT,
    u.nombresU,
    u.apellidosU,
    u.locacionU,
    u.correoU
FROM ticket t
JOIN usuario u ON t.idUsuario = u.idUsuario
WHERE t.idTicket = ?";

// se ejecuta el statement cawn
$stmt = $mysqli->prepare($query);
$stmt->bind_param("i", $_GET['idTicket']);
$stmt->execute();
$resultado = $stmt->get_result();

// y aqui se encarga el yeison de lo demas cawn
if ($resultado->num_rows > 0) {
    $row = $resultado->fetch_assoc();
    echo json_encode($row);
}
// 

// cierra la conexion cawn
$stmt->close();
include ("../backend_general/cerrar_conexion.php");
?>