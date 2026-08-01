<?php
include("../backend_general/conexion.php");

// estas son las variales que se van a actualizar cawn
$idTicket = $_GET['idTicket'];
$modalidad = $_GET['modalidadAtencionT'];
$status = $_GET['statusT'];
$notas = $_GET['notasTecnico'];

// si el estatus es cerrado se llena la fecha de cierre solita cawn
if ($status == "Cerrado") {
    $query = "UPDATE ticket SET 
        modalidadAtencionT = ?,
        statusT = ?,
        notasTecnico = ?,
        fechaCierreT = CURDATE()
    WHERE idTicket = ?";

    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("sssi", $modalidad, $status, $notas, $idTicket);
    // si no esta cerrado la fecha queda como null cawn
} else {
    $query = "UPDATE ticket SET 
        modalidadAtencionT = ?,
        statusT = ?,
        notasTecnico = ?,
        fechaCierreT = NULL
    WHERE idTicket = ?";


    // ahora se prepara el statement cawn
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("sssi", $modalidad, $status, $notas, $idTicket);
}

// si falla ps que tire error y si no que muestre que si cawn
// aqui se encarga el yeison 
// vamos cerrando el papoi
if ($stmt->execute()) {
    echo json_encode(array("success" => true, "mensaje" => "Ticket actualizado correctamente"));
} else {
    echo json_encode(array("success" => false, "mensaje" => "Error al actualizar el ticket"));
}

// y ps ya, se acaba el pedo
$stmt->close();
include("../backend_general/cerrar_conexion.php");

// la cague con el nombre, a ver si no me chingo el git cawn
?>