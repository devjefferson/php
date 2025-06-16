<?php
// Habilitar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Teste da Extensão MySQLi</h1>";

// Verificar se a extensão está carregada
if (extension_loaded('mysqli')) {
    echo "<p style='color: green;'>✅ Extensão mysqli está instalada e carregada!</p>";
    
    // Mostrar informações da extensão
    echo "<h2>Informações da Extensão:</h2>";
    echo "<pre>";
    print_r(get_loaded_extensions());
    echo "</pre>";
    
    // Tentar conexão
    echo "<h2>Teste de Conexão:</h2>";
    try {
        $conn = new mysqli(
            "database-2.cluxzvykkdac.us-east-1.rds.amazonaws.com",
            "admin",
            "adminadmin",
            "azzo",
            3306
        );
        
        if ($conn->connect_error) {
            throw new Exception("Falha na conexão: " . $conn->connect_error);
        }
        
        echo "<p style='color: green;'>✅ Conexão bem sucedida!</p>";
        echo "<p>Versão do servidor: " . $conn->server_info . "</p>";
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Erro na conexão: " . $e->getMessage() . "</p>";
    }
    
} else {
    echo "<p style='color: red;'>❌ Extensão mysqli NÃO está instalada!</p>";
    
    // Mostrar informações do PHP
    echo "<h2>Informações do PHP:</h2>";
    echo "<p>Versão do PHP: " . phpversion() . "</p>";
    echo "<p>Extensões carregadas:</p>";
    echo "<pre>";
    print_r(get_loaded_extensions());
    echo "</pre>";
    
    // Instruções de instalação
    echo "<h2>Como instalar:</h2>";
    echo "<p>Execute no terminal:</p>";
    echo "<pre>sudo yum install php-mysqli</pre>";
    echo "<p>Ou para versões específicas do PHP:</p>";
    echo "<pre>sudo yum install php80-mysqli  # Para PHP 8.0
sudo yum install php81-mysqli  # Para PHP 8.1</pre>";
}
?> 