<?php

session_start();
include("../backend_general/conexion.php");

// Recibe los datos enviados desde el formulario
$correo = $_POST['emailEmp'];
$password = $_POST['pass'];

// Busca las credenciales en empleados y clientes
$query = "
    SELECT
        idEmpleado AS id,
        nombresEmp AS nombre,
        apellidosEmp AS apellido,
        rolEmp AS perfil,
        NULL AS empresa
    FROM empleado
    WHERE emailEmp = ? AND pass = ?

    UNION ALL

    SELECT
        idCliente AS id,
        nombreC AS nombre,
        apellidoC AS apellido,
        'CLIENTE' AS perfil,
        empresaC AS empresa
    FROM cliente
    WHERE correoC = ? AND passC = ?

    LIMIT 1
";

$stmt = $mysqli->prepare($query);

// Coloca el correo y contraseña en los cuatro signos ?
$stmt->bind_param(
    "ssss",
    $correo,
    $password,
    $correo,
    $password
);

$stmt->execute();

$resultado = $stmt->get_result();

// Comprueba si encontró una cuenta
if ($resultado->num_rows > 0) {

    // Guarda la cuenta encontrada
    $row = $resultado->fetch_array();

    // Genera un nuevo identificador para la sesión
    session_regenerate_id(true);

    // Guarda el nombre completo
    $_SESSION['usuario'] =
        $row['nombre'] . " " . $row['apellido'];

    // Guarda el perfil en mayúsculas
    $_SESSION['perfil'] =
        strtoupper(trim($row['perfil']));

    // Envía al usuario al panel correspondiente
    switch ($_SESSION['perfil']) {

        case "DIRECTOR":

            $_SESSION['idEmpleado'] = $row['id'];

            header("Location: ../frontend/dg/indexdg.html");
            exit;

        case "TECNICO":

            $_SESSION['idEmpleado'] = $row['id'];

            header("Location: ../frontend/tc/indextc.html");
            exit;

        case "CLIENTE":

            $_SESSION['idCliente'] = $row['id'];
            $_SESSION['empresa'] = $row['empresa'];

            header("Location: ../frontend/cliente/indexcliente.html");
            exit;

        default:

            // Si el perfil no está reconocido, destruye la sesión
            session_destroy();

            header("Location: ../frontend/login.html");
            exit;
    }

} else {

    // Si las credenciales no coinciden, regresa al login
    header("Location: ../frontend/login.html");
    exit;
}

?>