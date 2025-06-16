<?php
// Habilitar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações do banco de dados
require_once 'Config.php';

try {
    // Testar conexão
    echo "Tentando conectar ao banco de dados...\n";
    echo "Host: $servername\n";
    echo "Porta: $port\n";
    echo "Usuário: $username\n";
    echo "Banco: $database\n";
    
    $conn = new mysqli($servername, $username, $password, $database, $port);
    
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão: " . $conn->connect_error);
    }
    
    echo "Conexão bem sucedida!\n";
    
    // Testar consulta
    echo "\nTestando consulta...\n";
    $result = $conn->query("SELECT 1");
    if ($result) {
        echo "Consulta bem sucedida!\n";
    }
    
    // Verificar tabelas
    echo "\nListando tabelas:\n";
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        while ($row = $result->fetch_array()) {
            echo "- " . $row[0] . "\n";
        }
    }
    
    // Verificar usuários
    echo "\nVerificando tabela de usuários:\n";
    $result = $conn->query("SELECT COUNT(*) as total FROM usuarios");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "Total de usuários: " . $row['total'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
    
    // Verificar se o host está acessível
    echo "\nTestando ping ao host do banco...\n";
    $ping = shell_exec("ping -c 1 $servername");
    echo $ping;
    
    // Verificar se a porta está aberta
    echo "\nTestando conexão na porta $port...\n";
    $connection = @fsockopen($servername, $port, $errno, $errstr, 5);
    if ($connection) {
        echo "Porta $port está aberta!\n";
        fclose($connection);
    } else {
        echo "Não foi possível conectar na porta $port: $errstr ($errno)\n";
    }
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?> 