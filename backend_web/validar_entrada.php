<?php
    session_start();

include("../backend_general/conexion.php");

    $query = "Select nombresEmp, apellidosEmp, rolEmp from empleado where emailEmp = ? and pass = ?";

    $stmt = $mysqli->prepare($query);

    $stmt->bind_param("ss", $_POST['emailEmp'], $_POST['pass']);

    $stmt->execute();

    $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {

    $row = $resultado->fetch_array();

    session_regenerate_id(true);

    $_SESSION['usuario'] =
        $row['nombresEmp'] . " " . $row['apellidosEmp'];

    $_SESSION['perfil'] = strtoupper(trim($row['rolEmp']));

    switch ($_SESSION['perfil']) {

        case "DIRECTOR":
            header("Location: ../frontend/dg/indexdg.html");
            exit;

        case "TECNICO":
            header("Location: ../frontend/tc/indextc.html");
            exit;


        // case "CL":
        //     header("Location: ../frontend/cliente/index.php");
        //     exit;
        //para el caso de cliente, se puede agregar un nuevo caso aquí si es necesario.

        default:
            session_destroy();
            header("Location: ../frontend/login.html");
            exit;
    }

} else {
    header("Location: ../frontend/login.html");
    exit;
}

        $stmt->close();
    include("../backend_general/cerrar_conexion.php");
?>