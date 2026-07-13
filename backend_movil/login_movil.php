<?php
include ("../backend_general/conexion.php");

//TEST DE GIT A VER SI JALA

// aqui se prepara el query para solicitar entrar cawn
$query = "Select pass from empleado where emailEmp = ?";

// statement para preparar cawn
$stmt = $mysqli->prepare($query);

//aqui van los datos que hay que sustituir cawn
$stmt->bind_param("s", $_GET['emailEmp']);

//aqui se ejecuta cawn
$stmt->execute();

//aqui se obtiene el resultado cawn
$resultado = $stmt->get_result();

// si el numero de filas retoradas es mayor que cero existe por tanto se loguea
if ($resultado->num_rows > 0) {
    $row = $resultado->fetch_array();
    $respuesta['password'] = $row['password'];
    echo json_encode(array($respuesta));
}
$stmt->close();

include ("../backend_general/cerrar_conexion.php");

?>