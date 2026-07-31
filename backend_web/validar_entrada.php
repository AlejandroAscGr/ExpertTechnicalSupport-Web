<?php
    session_start();

include("../backend_general/conexion.php");

    $query = "Select nombresEmp, apellidosEmp, rolEmp from empleado where emailEmp = ? and pass = ?";

    $stmt = $mysqli->prepare($query);

    $stmt->bind_param("ss", $_POST['emailEmp'], $_POST['pass']);

    $stmt->execute();

    $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0){
            $row = $resultado->fetch_array();
            $_SESSION['usuario'] = $row['nombresEmp']." ". $row['apellidosEmp'];

            $_SESSION['perfil'] = $row['rolEmp']; 
            header("Location: ../frontend/index.html");

        }else {
            header("Location: ../frontend/login.html");
        }

        $stmt->close();
    include("../backend_general/cerrar_conexion.php");
?>