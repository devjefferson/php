<?php
// Configurações de segurança
session_start();
header('Content-Type: application/json; charset=utf-8');

// // CSRF Protection
// if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
//     // For backward compatibility, allow requests without CSRF token for now
//     // In production, uncomment the line below:
//     // http_response_code(403); echo json_encode(['success' => false, 'message' => 'Token CSRF inválido']); exit;
// }

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
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Muitas tentativas. Tente novamente em 1 hora.']);
    exit;
}

$_SESSION[$rate_limit_key]['count']++;

// Configurações do banco
require_once 'Config.php';

try {
    $conn = new mysqli($servername, $username, $password, $database);
    $conn->set_charset("utf8mb4");
    
    if ($conn->connect_error) {
        throw new Exception("Falha na conexão com o banco de dados");
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Validação de entrada
        $errors = [];
        
        // Validar nome
        $nome = trim($_POST["nome"] ?? '');
        if (empty($nome)) {
            $errors[] = "Nome é obrigatório";
        } elseif (strlen($nome) < 2) {
            $errors[] = "Nome deve ter pelo menos 2 caracteres";
        } elseif (!preg_match('/^[a-zA-ZÀ-ÿ\s]+$/', $nome)) {
            $errors[] = "Nome deve conter apenas letras e espaços";
        }
        
        // Validar email
        $email = filter_var($_POST["email"] ?? '', FILTER_SANITIZE_EMAIL);
        if (empty($email)) {
            $errors[] = "E-mail é obrigatório";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "E-mail inválido";
        }
        
        // Verificar se email já existe
        if (!empty($email)) {
            $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                $errors[] = "E-mail já cadastrado";
            }
            $stmt->close();
        }
        
        // Validar telefone
        $telefone = trim($_POST["telefone"] ?? '');
        if (empty($telefone)) {
            $errors[] = "Telefone é obrigatório";
        } elseif (!preg_match('/^\(\d{2}\)\s\d{4,5}-\d{4}$/', $telefone)) {
            $errors[] = "Telefone inválido. Use o formato (11) 99999-9999";
        }
        
        // Validar gênero
        $genero = trim($_POST["genero"] ?? '');
        $generos_validos = ['Masculino', 'Feminino', 'Outro'];
        if (empty($genero)) {
            $errors[] = "Gênero é obrigatório";
        } elseif (!in_array($genero, $generos_validos)) {
            $errors[] = "Gênero inválido";
        }
        
        // Validar data de nascimento
        $datanascimento = $_POST["datanascimento"] ?? '';
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
        if (empty($cidade)) {
            $errors[] = "Cidade é obrigatória";
        } elseif (strlen($cidade) < 2) {
            $errors[] = "Cidade deve ter pelo menos 2 caracteres";
        }
        
        // Validar estado
        $estado = trim($_POST["estado"] ?? '');
        if (empty($estado)) {
            $errors[] = "Estado é obrigatório";
        } elseif (strlen($estado) < 2) {
            $errors[] = "Estado deve ter pelo menos 2 caracteres";
        }
        
        // Validar endereço
        $endereco = trim($_POST["endereco"] ?? '');
        if (empty($endereco)) {
            $errors[] = "Endereço é obrigatório";
        } elseif (strlen($endereco) < 5) {
            $errors[] = "Endereço deve ter pelo menos 5 caracteres";
        }
        
        // Validar senha
        $senha = $_POST["senha"] ?? '';
        if (empty($senha)) {
            $errors[] = "Senha é obrigatória";
        } elseif (strlen($senha) < 8) {
            $errors[] = "Senha deve ter pelo menos 8 caracteres";
        }
        
        // Se há erros, retornar
        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }
        
        // Hash da senha
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        
        // Preparar inserção
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, telefone, genero, datanascimento, cidade, estado, endereco, senha, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param("sssssssss", $nome, $email, $telefone, $genero, $datanascimento, $cidade, $estado, $endereco, $senha_hash);
        
        if ($stmt->execute()) {
            $user_id = $conn->insert_id;
            
            // Log da ação
            error_log("Novo usuário cadastrado: ID {$user_id}, Email: {$email}, IP: {$ip}");
            
            // Reset rate limit counter on success
            $_SESSION[$rate_limit_key]['count'] = 0;
            
            // Verificar se é uma requisição AJAX
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Conta criada com sucesso!',
                    'redirect' => 'login-new.html'
                ]);
            } else {
                // Redirecionar para página de sucesso
                header("Location: ../cadastro-new.html?sucesso=1");
            }
            exit();
        } else {
            throw new Exception("Erro ao cadastrar usuário");
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
    
} catch (Exception $e) {
    error_log("Erro no cadastro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>