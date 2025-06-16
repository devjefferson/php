<?php
// Habilitar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Teste de Conectividade com RDS</h1>";

// Configurações do banco de dados
$servername = "database-2.cluxzvykkdac.us-east-1.rds.amazonaws.com";
$username = "admin";
$password = "adminadmin";
$database = "azzo";
$port = 3306;

// 1. Testar DNS
echo "<h2>1. Teste de DNS</h2>";
$ip = gethostbyname($servername);
echo "Hostname: $servername<br>";
echo "IP: $ip<br>";

// 2. Testar Ping
echo "<h2>2. Teste de Ping</h2>";
$ping = shell_exec("ping -c 1 $servername");
echo "<pre>$ping</pre>";

// 3. Testar Porta
echo "<h2>3. Teste de Porta</h2>";
$connection = @fsockopen($servername, $port, $errno, $errstr, 5);
if ($connection) {
    echo "Porta $port está aberta!<br>";
    fclose($connection);
} else {
    echo "Não foi possível conectar na porta $port: $errstr ($errno)<br>";
}

// 4. Testar Conexão MySQL
echo "<h2>4. Teste de Conexão MySQL</h2>";
try {
    $conn = new mysqli($servername, $username, $password, $database, $port);
    
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão: " . $conn->connect_error);
    }
    
    echo "Conexão bem sucedida!<br>";
    
    // 5. Testar Consulta
    echo "<h2>5. Teste de Consulta</h2>";
    $result = $conn->query("SELECT 1");
    if ($result) {
        echo "Consulta básica funcionou!<br>";
    }
    
    // 6. Listar Tabelas
    echo "<h2>6. Lista de Tabelas</h2>";
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        echo "<ul>";
        while ($row = $result->fetch_array()) {
            echo "<li>" . $row[0] . "</li>";
        }
        echo "</ul>";
    }
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "<br>";
    
    // 7. Verificar Extensão MySQL
    echo "<h2>7. Verificar Extensão MySQL</h2>";
    if (extension_loaded('mysqli')) {
        echo "Extensão mysqli está carregada<br>";
    } else {
        echo "Extensão mysqli NÃO está carregada<br>";
    }
    
    // 8. Verificar Versão do PHP
    echo "<h2>8. Informações do PHP</h2>";
    echo "Versão do PHP: " . phpversion() . "<br>";
    echo "Extensões carregadas:<br>";
    echo "<pre>";
    print_r(get_loaded_extensions());
    echo "</pre>";
}

// 9. Verificar Configurações do PHP
echo "<h2>9. Configurações do PHP</h2>";
echo "<pre>";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "</pre>";

// 10. Verificar IP da Instância
echo "<h2>10. IP da Instância EC2</h2>";
echo "IP Público: " . file_get_contents('http://169.254.169.254/latest/meta-data/public-ipv4') . "<br>";
echo "IP Privado: " . file_get_contents('http://169.254.169.254/latest/meta-data/local-ipv4') . "<br>";
?> 