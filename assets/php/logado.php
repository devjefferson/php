<?php
// Você pode colocar validações de sessão aqui, se quiser
$sucesso = isset($_GET['sucesso']) && $_GET['sucesso'] == 1;
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Cadastro Concluído</title>
    <link rel="stylesheet" href="assets/css/logado.css">
</head>
<body>

    <?php if ($sucesso): ?>
        <div class="mensagem">
            <h2>Cadastro realizado com sucesso!</h2>
            <p>Seja bem-vindo(a) à plataforma 🚀</p>
        </div>
        <a href="login.php">Ir para o login</a>
    <?php else: ?>
        <div class="mensagem" style="background-color: #f8d7da; color: #721c24; border-color: #f5c6cb;">
            <h2>Ops... algo deu errado!</h2>
            <p>Você acessou essa página sem se cadastrar corretamente.</p>
        </div>
        <a href="assets/login-new.html">ir para o login</a>
    <?php endif; ?>

</body>
</html>
