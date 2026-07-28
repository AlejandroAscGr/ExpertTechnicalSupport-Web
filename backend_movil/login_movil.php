<?php
include ("../backend_general/conexion.php");

//aqui se prepara el query para solicitar entrar cawn
$query = "SELECT pass, nombresEmp, apellidosEmp, idEmpleado FROM empleado WHERE emailEmp = ?";

// statement para preparar cawn
$stmt = $mysqli->prepare($query);
//aqui van los datos que hay que sustituir cawn
$stmt->bind_param("s", $_GET['emailEmp']);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $row = $resultado->fetch_array();
    $respuesta['pass'] = $row['pass'];
    $respuesta['nombre'] = $row['nombresEmp'] . " " . $row['apellidosEmp'];
    $respuesta['idEmpleado'] = $row['idEmpleado'];
    echo json_encode(array($respuesta));
}
// todos los datos extras son para poder pasarlos al siguiente frame en el intent cawn 

$stmt->close();
include ("../backend_general/cerrar_conexion.php");
?>