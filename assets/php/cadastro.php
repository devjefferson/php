<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao meu site</title>
    <link rel="stylesheet" href="assets/css/cadastro.css">
    <link rel="stylesheet" href="assets/css/fonts.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/cadastro.css">
    
    <script>
        // Verificar se há o parâmetro "sucesso=1" na URL
        window.onload = function() {
            const params = new URLSearchParams(window.location.search);
            if (params.get("sucesso") === "1") {
                document.getElementById("mensagem").innerHTML = "<p style='color: green;'>Cadastro realizado com sucesso!</p>";
            }
        };
    </script>
</head>
<body>
    <div class="box">
        <form action="assets/php/Register.php" method="POST">
            <input type="text" name="nome" placeholder="Digite seu Nome Completo..." required>
            <input type="email" name="email" placeholder="Digite seu Email..." required>
            <input type="text" name="telefone" placeholder="Digite seu Telefone..." required>
            <input type="radio" name="genero" value="Masculino" required> Masculino
            <input type="radio" name="genero" value="Feminino" required> Feminino
            <input type="radio" name="genero" value="Outro" required> Outro
            <input type="date" name="datanascimento" required>
            <input type="text" name="cidade" placeholder="Digite sua Cidade..." required>
            <input type="text" name="estado" placeholder="Digite seu Estado..." required>
            <input type="text" name="endereco" placeholder="Digite seu Endereço..." required>
            <input type="password" name="senha" placeholder="Digite sua Senha..." required>
            <input type="submit" value="Cadastrar">
        </form>

        <!-- Div onde a mensagem será exibida -->
        <div id="mensagem"></div>
    </div>
</body>
</html>