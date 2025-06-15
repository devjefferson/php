<?php
// Teste de conexão com o banco de dados
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Teste de Conexão - Banco de Dados</h1>";

// Incluir configurações
require_once 'assets/php/Config.php';

echo "<h2>Configurações:</h2>";
echo "Servidor: " . $servername . "<br>";
echo "Usuário: " . $username . "<br>";
echo "Banco: " . $database . "<br>";
echo "Porta: " . $port . "<br>";

echo "<h2>Teste de Conexão:</h2>";

try {
    // Testar conexão MySQL
    $test_conn = new mysqli($servername, $username, $password, $database, $port);
    
    if ($test_conn->connect_error) {
        echo "❌ Erro de conexão: " . $test_conn->connect_error . "<br>";
        echo "Código do erro: " . $test_conn->connect_errno . "<br>";
    } else {
        echo "✅ Conexão bem-sucedida!<br>";
        echo "Versão do MySQL: " . $test_conn->server_info . "<br>";
        
        // Testar se a tabela existe
        $result = $test_conn->query("SHOW TABLES LIKE 'usuarios'");
        if ($result->num_rows > 0) {
            echo "✅ Tabela 'usuarios' encontrada<br>";
            
            // Mostrar estrutura da tabela
            $structure = $test_conn->query("DESCRIBE usuarios");
            echo "<h3>Estrutura da tabela 'usuarios':</h3>";
            echo "<ul>";
            while ($row = $structure->fetch_assoc()) {
                echo "<li>" . $row['Field'] . " - " . $row['Type'] . "</li>";
            }
            echo "</ul>";
        } else {
            echo "❌ Tabela 'usuarios' não encontrada<br>";
        }
    }
    
    $test_conn->close();
    
} catch (Exception $e) {
    echo "❌ Exceção: " . $e->getMessage() . "<br>";
}

echo "<h2>Informações do PHP:</h2>";
echo "Versão do PHP: " . phpversion() . "<br>";
echo "Extensão MySQLi: " . (extension_loaded('mysqli') ? '✅ Carregada' : '❌ Não carregada') . "<br>";

if (extension_loaded('mysqli')) {
    echo "Versão da extensão MySQLi: " . mysqli_get_client_info() . "<br>";
}
?>
