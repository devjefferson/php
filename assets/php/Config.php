<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

try {
    // Tentar conexão com timeout
    $conn = new mysqli($servername, $username, $password, $database, $port);
    
    // Configurar timeout da conexão
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
    
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados: " . $conn->connect_error);
    }
    
    // Configurar charset
    if (!$conn->set_charset("utf8mb4")) {
        throw new Exception("Erro ao configurar charset: " . $conn->error);
    }
    
    // Verificar se o banco existe
    $result = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$database'");
    if ($result->num_rows === 0) {
        throw new Exception("Banco de dados '$database' não existe");
    }
    
    // Verificar se a tabela usuarios existe
    $result = $conn->query("SHOW TABLES LIKE 'usuarios'");
    if ($result->num_rows === 0) {
        throw new Exception("Tabela 'usuarios' não existe no banco de dados");
    }
    
} catch (Exception $e) {
    // Log do erro
    error_log("Erro de conexão com o banco: " . $e->getMessage());
    
    // Retornar erro em formato JSON
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com o banco de dados',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>