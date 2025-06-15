<?php
$host = "database-2.cluxzvykkdac.us-east-1.rds.amazonaws.com";
$user = "admin";
$password = "adminadmin"; // Se houver uma senha, coloque-a aqui.
$dbname = "azzo";
$port = 3306;

$conn = new mysqli($host, $user, $password, $dbname);

// Verifica se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error . " (Código de erro: " . $conn->connect_errno . ")");
}
?>