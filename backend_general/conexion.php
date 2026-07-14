<?php
//abre la conexion 

$servidor = "localhost:3306"; // este puede cambiar depende del tema del vepene
$usuariobd = "root"; // este puede cambiar tambien cawn
$passwordbd = ""; // este tambien cawn
$basedatos = "isana2labs"; // Segun yo asi se llama cawn

//aqui se enlaza el pedo cawn
$mysqli = new mysqli($servidor, $usuariobd, $passwordbd, $basedatos);

// y aqui le calamos el pedo cawn
if (mysqli_connect_error()) {
    printf("Fallo en la conexión: %s\n", mysqli_connect_error());
    exit();
}
?>