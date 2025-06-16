<?php
// Habilitar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Teste de Conexão com Banco de Dados</h1>";

// Configurações do banco de dados
$servername = "database-2.cluxzvykkdac.us-east-1.rds.amazonaws.com";
$username = "admin";
$password = "adminadmin";
$database = "azzo";
$port = 3306;

try {
    // Tentar conexão
    $conn = new mysqli($servername, $username, $password, $database, $port);
    
    // Verificar conexão
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão: " . $conn->connect_error);
    }
    
    echo "<p style='color: green;'>✅ Conexão bem sucedida!</p>";
    
    // Testar consulta
    $result = $conn->query("SELECT 1");
    if ($result) {
        echo "<p style='color: green;'>✅ Consulta básica funcionou!</p>";
    }
    
    // Listar tabelas
    echo "<h2>Tabelas do Banco:</h2>";
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        echo "<ul>";
        while ($row = $result->fetch_array()) {
            echo "<li>" . $row[0] . "</li>";
        }
        echo "</ul>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
    
    // Verificar extensão mysqli
    echo "<h2>Verificação da Extensão MySQLi:</h2>";
    if (extension_loaded('mysqli')) {
        echo "<p style='color: green;'>✅ Extensão mysqli está carregada</p>";
    } else {
        echo "<p style='color: red;'>❌ Extensão mysqli NÃO está carregada</p>";
    }
    
    // Verificar versão do PHP
    echo "<h2>Informações do PHP:</h2>";
    echo "<p>Versão do PHP: " . phpversion() . "</p>";
    
    // Verificar extensões carregadas
    echo "<h2>Extensões Carregadas:</h2>";
    echo "<pre>";
    print_r(get_loaded_extensions());
    echo "</pre>";
}

// Verificar configurações do PHP
echo "<h2>Configurações do PHP:</h2>";
echo "<pre>";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "</pre>";
?> 