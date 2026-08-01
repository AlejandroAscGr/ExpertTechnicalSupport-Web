<?php

// Incluye la conexión a la base de datos
include("../backend_general/conexion.php");

// Recibe los datos del formulario
$nombre = trim($_POST['nombreC']);
$apellido = trim($_POST['apellidoC']);
$telefono = trim($_POST['telefonoC']);
$correo = trim($_POST['correoC']);
$empresa = trim($_POST['empresaC']);
$password = trim($_POST['passC']);

// Verifica que el correo no esté registrado
$queryCorreo = "SELECT idCliente
                FROM cliente
                WHERE correoC = ?";

$stmtCorreo = $mysqli->prepare($queryCorreo);
$stmtCorreo->bind_param("s", $correo);
$stmtCorreo->execute();

$resultadoCorreo = $stmtCorreo->get_result();

if ($resultadoCorreo->num_rows > 0) {

    // Regresa al formulario si el correo ya existe
    header("Location: ../frontend/cliente/registro_cliente.html?error=correo");
    exit;
}

// Inserta al cliente
$query = "INSERT INTO cliente
          (nombreC, apellidoC, telefonoC, correoC, empresaC, passC, fechaAltaC)
          VALUES (?, ?, ?, ?, ?, ?, CURDATE())";

$stmt = $mysqli->prepare($query);

$stmt->bind_param(
    "ssssss",
    $nombre,
    $apellido,
    $telefono,
    $correo,
    $empresa,
    $password
);

if ($stmt->execute()) {

    // Registro exitoso: envía al inicio de sesión
    header("Location: ../frontend/cliente/registro_cliente.html?registro=exito");
    exit;

} else {

    // Si ocurre un error, regresa al registro
    header("Location: ../frontend/cliente/registro_cliente.html?error=registro");
    exit;
}

?>