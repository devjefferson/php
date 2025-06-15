<?php
// Configurações de segurança
session_start();
header('Content-Type: application/json; charset=utf-8');

// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log de requisição
error_log("=== INÍCIO DO REGISTRO ===");
error_log("Método: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));

// Rate limiting (simple implementation)
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_key = 'register_' . $ip;
if (!isset($_SESSION[$rate_limit_key])) {
    $_SESSION[$rate_limit_key] = ['count' => 0, 'time' => time()];
}

if (time() - $_SESSION[$rate_limit_key]['time'] > 3600) {
    $_SESSION[$rate_limit_key] = ['count' => 0, 'time' => time()];
}

if ($_SESSION[$rate_limit_key]['count'] > 50) {
    error_log("Rate limit excedido para IP: " . $ip);
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Muitas tentativas. Tente novamente em 1 hora.']);
    exit;
}

$_SESSION[$rate_limit_key]['count']++;

// Configurações do banco
require_once 'Config.php';

try {
    error_log("Tentando conectar ao banco de dados...");
    $conn = new mysqli($servername, $username, $password, $database, $port);
    $conn->set_charset("utf8mb4");
    
    if ($conn->connect_error) {
        error_log("Erro na conexão com o banco: " . $conn->connect_error);
        throw new Exception("Falha na conexão com o banco de dados: " . $conn->connect_error);
    }
    error_log("Conexão com o banco estabelecida com sucesso");

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Validação de entrada
        $errors = [];
        
        // Validar nome
        $nome = trim($_POST["nome"] ?? '');
        error_log("Nome recebido: " . $nome);
        if (empty($nome)) {
            $errors[] = "Nome é obrigatório";
        } elseif (strlen($nome) < 2) {
            $errors[] = "Nome deve ter pelo menos 2 caracteres";
        } elseif (!preg_match('/^[a-zA-ZÀ-ÿ\s]+$/', $nome)) {
            $errors[] = "Nome deve conter apenas letras e espaços";
        }
        
        // Validar email
        $email = filter_var($_POST["email"] ?? '', FILTER_SANITIZE_EMAIL);
        error_log("Email recebido: " . $email);
        if (empty($email)) {
            $errors[] = "E-mail é obrigatório";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "E-mail inválido";
        }
        
        // Verificar se email já existe
        if (!empty($email)) {
            error_log("Verificando se email já existe: " . $email);
            $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
            if (!$stmt) {
                error_log("Erro ao preparar consulta de email: " . $conn->error);
                throw new Exception("Erro ao preparar consulta: " . $conn->error);
            }
            $stmt->bind_param("s", $email);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                $errors[] = "E-mail já cadastrado";
                error_log("Email já cadastrado: " . $email);
            }
            $stmt->close();
        }
        
        // Validar telefone (opcional)
        $telefone = trim($_POST["telefone"] ?? '');
        error_log("Telefone recebido: " . $telefone);
        if (!empty($telefone)) {
            // Remove todos os caracteres não numéricos para validação
            $telefone_numeros = preg_replace('/\D/', '', $telefone);
            if (strlen($telefone_numeros) < 10 || strlen($telefone_numeros) > 11) {
                $errors[] = "Telefone inválido. Use o formato (00) 00000-0000";
            }
        }
        
        // Validar gênero
        $genero = trim($_POST["genero"] ?? '');
        error_log("Gênero recebido: " . $genero);
        $generos_validos = ['Masculino', 'Feminino', 'Outro'];
        if (empty($genero)) {
            $errors[] = "Gênero é obrigatório";
        } elseif (!in_array($genero, $generos_validos)) {
            $errors[] = "Gênero inválido";
        }
        
        // Validar data de nascimento
        $datanascimento = $_POST["datanascimento"] ?? '';
        error_log("Data de nascimento recebida: " . $datanascimento);
        if (empty($datanascimento)) {
            $errors[] = "Data de nascimento é obrigatória";
        } else {
            $birth_date = new DateTime($datanascimento);
            $today = new DateTime();
            $age = $today->diff($birth_date)->y;
            if ($age < 13) {
                $errors[] = "Você deve ter pelo menos 13 anos";
            }
        }
        
        // Validar cidade
        $cidade = trim($_POST["cidade"] ?? '');
        error_log("Cidade recebida: " . $cidade);
        if (empty($cidade)) {
            $errors[] = "Cidade é obrigatória";
        } elseif (strlen($cidade) < 2) {
            $errors[] = "Cidade deve ter pelo menos 2 caracteres";
        }
        
        // Validar estado
        $estado = trim($_POST["estado"] ?? '');
        error_log("Estado recebido: " . $estado);
        if (empty($estado)) {
            $errors[] = "Estado é obrigatório";
        } elseif (strlen($estado) < 2) {
            $errors[] = "Estado deve ter pelo menos 2 caracteres";
        }
        
        // Validar endereço
        $endereco = trim($_POST["endereco"] ?? '');
        error_log("Endereço recebido: " . $endereco);
        if (empty($endereco)) {
            $errors[] = "Endereço é obrigatório";
        } elseif (strlen($endereco) < 5) {
            $errors[] = "Endereço deve ter pelo menos 5 caracteres";
        }
        
        // Validar senha
        $senha = $_POST["senha"] ?? '';
        error_log("Senha recebida (tamanho): " . strlen($senha));
        if (empty($senha)) {
            $errors[] = "Senha é obrigatória";
        } elseif (strlen($senha) < 8) {
            $errors[] = "Senha deve ter pelo menos 8 caracteres";
        }
        
        // Se há erros, retornar
        if (!empty($errors)) {
            error_log("Erros de validação encontrados: " . print_r($errors, true));
            http_response_code(400);
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }
        
        // Hash da senha
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        
        // Preparar inserção
        error_log("Preparando inserção no banco de dados...");
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, telefone, genero, datanascimento, cidade, estado, endereco, senha, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        if (!$stmt) {
            error_log("Erro ao preparar inserção: " . $conn->error);
            throw new Exception("Erro ao preparar inserção: " . $conn->error);
        }
        
        $stmt->bind_param("sssssssss", $nome, $email, $telefone, $genero, $datanascimento, $cidade, $estado, $endereco, $senha_hash);
        
        if ($stmt->execute()) {
            $user_id = $conn->insert_id;
            error_log("Usuário cadastrado com sucesso. ID: " . $user_id);
            
            // Reset rate limit counter on success
            $_SESSION[$rate_limit_key]['count'] = 0;
            
            echo json_encode([
                'success' => true, 
                'message' => 'Conta criada com sucesso!',
                'redirect' => 'login-new.html'
            ]);
            exit();
        } else {
            error_log("Erro ao executar inserção: " . $stmt->error);
            throw new Exception("Erro ao cadastrar usuário: " . $stmt->error);
        }
        
    } else {
        error_log("Método não permitido: " . $_SERVER['REQUEST_METHOD']);
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
    
} catch (Exception $e) {
    error_log("Erro no cadastro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor: ' . $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
    error_log("=== FIM DO REGISTRO ===");
}
?>