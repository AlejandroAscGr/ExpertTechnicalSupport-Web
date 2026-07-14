<?php
    session_start();

    include ("conexion.php"); 
    $query = "Select nombresEmp, apellidosEmp, rolEmp from isana2labs where emailemp = ? and pass = ?";

    $stmt = $mysqli->prepare($query);

    $stmt->bind_param("ss", $_POST['emailemp'], $_POST['pass']);

    $stmt->execute();

    $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0){
            $row = $resultado->fetch_array();
            $_SESSION['usuario'] = $row['nombresEmp']." ". $row['apellidosEmp'];
            $_SESSION['perfil'] = $row['rolEmp']; 
            header("Location: ../frontend");

        }else {
             header("Location: ../");

        }

        $stmt->close();
    include ("cerrar_conexion.php");
?>