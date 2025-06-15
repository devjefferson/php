<?php
// Configurações do banco de dados
$servername = "database-2.cluxzvykkdac.us-east-1.rds.amazonaws.com";
$username = "admin";
$password = "adminadmin";
$database = "azzo";
$port = 3306;

// Manter variáveis antigas para compatibilidade
$host = $servername;
$user = $username;
$dbname = $database;

// Conexão principal (usada pelos scripts antigos)
$conn = new mysqli($servername, $username, $password, $database, $port);

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}
?>