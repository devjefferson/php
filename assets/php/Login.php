<?php
// Configurações de segurança
session_start();
header('Content-Type: application/json; charset=utf-8');

// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log de requisição
error_log("=== INÍCIO DO LOGIN ===");
error_log("Método: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));

// Verificar se é uma requisição POST
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    error_log("Método não permitido: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Verificar se os campos necessários foram enviados
if (!isset($_POST['email']) || !isset($_POST['senha'])) {
    error_log("Campos obrigatórios não fornecidos");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios']);
    exit;
}

// Configurações do banco
require_once 'Config.php';

try {
    error_log("Tentando conectar ao banco de dados...");
    $conn = new mysqli($servername, $username, $password, $database, $port);
    $conn->set_charset("utf8mb4");
    
    if ($conn->connect_error) {
        error_log("Erro na conexão com o banco: " . $conn->connect_error);
        throw new Exception("Falha na conexão com o banco de dados");
    }
    error_log("Conexão com o banco estabelecida com sucesso");

    // Sanitizar e validar email
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Email inválido: " . $email);
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email inválido']);
        exit;
    }

    // Buscar usuário
    $stmt = $conn->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = ?");
    if (!$stmt) {
        error_log("Erro ao preparar consulta: " . $conn->error);
        throw new Exception("Erro ao preparar consulta");
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log("Usuário não encontrado: " . $email);
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos']);
        exit;
    }

    $user = $result->fetch_assoc();

    // Verificar senha
    if (!password_verify($_POST['senha'], $user['senha'])) {
        error_log("Senha incorreta para o usuário: " . $email);
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos']);
        exit;
    }

    // Login bem sucedido
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['nome'];
    $_SESSION['user_email'] = $user['email'];
    
    error_log("Login bem sucedido para o usuário: " . $email);

    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso!',
        'user' => [
            'id' => $user['id'],
            'nome' => $user['nome'],
            'email' => $user['email']
        ],
        'redirect' => 'home.html'
    ]);

} catch (Exception $e) {
    error_log("Erro no login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
    error_log("=== FIM DO LOGIN ===");
}
?>
