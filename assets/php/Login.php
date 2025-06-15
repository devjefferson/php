<?php
include 'db.php';

$mensagem = null;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    $query = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($senha, $user['senha'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $mensagem = "Login bem-sucedido!";
        } else {
            $mensagem = "Senha incorreta!";
        }
    } else {
        $mensagem = "Usuário não encontrado!";
    }

    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tela de Login</title>
    <link rel="stylesheet" href="fonts.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: Arial, sans-serif;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f4f7fa;
        }

        .login-form {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .login-form h1 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 1.5rem;
            color: #333333;
        }

        .login-form input[type="email"],
        .login-form input[type="password"],
        .login-form input[type="submit"] {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
        }

        .login-form input[type="submit"] {
            background-color: #00A8FF;
            color: white;
            font-weight: bold;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .login-form input[type="submit"]:hover {
            background-color: #333333;
        }

        .login-form a {
            color: #00A8FF;
            text-decoration: none;
        }

        .login-form a:hover {
            text-decoration: underline;
        }

        .login-form p {
            text-align: center;
            margin-top: 10px;
        }

        .mensagem {
            margin-top: 15px;
            padding: 10px;
            border: 2px solid transparent;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }

        .mensagem.sucesso {
            border-color: #00A8FF;
            color: #00A8FF;
            background-color: #f0f8ff;
        }

        .mensagem.erro {
            border-color: #FF4D4D;
            color: #FF4D4D;
            background-color: #ffe6e6;
        }
    </style>
</head>
<body>
    <div class="login-form">
        <h1>Entrar</h1>
        <form action="Login.php" method="post">
            <label for="email">Email</label>
            <input type="email" name="email" placeholder="Digite seu email..." required>
            
            <label for="senha">Senha</label>
            <input type="password" name="senha" placeholder="Digite sua senha..." required>
            
            <p><a href="Esqueceusenha.html">Esqueceu sua senha?</a></p>
            <input type="submit" value="Entrar"> 

            <!-- Exibir mensagens abaixo do botão -->
            <?php if ($mensagem): ?>
                <div class="mensagem <?php echo strpos($mensagem, 'bem-sucedido') !== false ? 'sucesso' : 'erro'; ?>">
                    <?php echo htmlspecialchars($mensagem); ?>
                </div>
            <?php endif; ?>

            <p>Não tem uma conta? <a href="cadastro.php">Inscreva-se aqui</a></p>
        </form>
    </div>
</body>
</html>
