<?php
// Exibir erros para depuração
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurações do banco de dados
$servername = "database-2.cluxzvykkdac.us-east-1.rds.amazonaws.com:3306";
$username = "admin";
$password = "adminadmin";
$database = "azzo"; // Substitua pelo nome correto do seu banco

// Cria a conexão
$conn = new mysqli($servername, $username, $password, $database);

// Verifica a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Verifica se o formulário foi enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = isset($_POST["nome"]) ? trim($_POST["nome"]) : '';
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
    $telefone = isset($_POST["telefone"]) ? trim($_POST["telefone"]) : '';
    $genero = isset($_POST["genero"]) ? trim($_POST["genero"]) : '';
    $datanascimento = isset($_POST["datanascimento"]) ? trim($_POST["datanascimento"]) : '';
    $cidade = isset($_POST["cidade"]) ? trim($_POST["cidade"]) : '';
    $estado = isset($_POST["estado"]) ? trim($_POST["estado"]) : '';
    $endereco = isset($_POST["endereco"]) ? trim($_POST["endereco"]) : '';
    $senha = isset($_POST["senha"]) ? password_hash(trim($_POST["senha"]), PASSWORD_DEFAULT) : '';

    if (empty($email) || empty($senha)) {
        die("Erro: O campo 'email' e 'senha' são obrigatórios!");
    }

    // Verifica se o email já existe
    $stmt_check = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        die("Erro: Esse email já está cadastrado!");
    }

    $stmt_check->close();

    // Inserção segura dos dados
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, telefone, genero, datanascimento, cidade, estado, endereco, senha) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $nome, $email, $telefone, $genero, $datanascimento, $cidade, $estado, $endereco, $senha);

    if ($stmt->execute()) {
        echo "Cadastro realizado com sucesso!";
        header("refresh:3;url=pagina_de_sucesso.html");
        exit();
    } else {
        echo "Erro ao cadastrar: " . $stmt->error;
    }

    $stmt->close();
}

// Excluir usuário
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $deleteQuery = "DELETE FROM usuarios WHERE id = ?";
    $deleteStmt = $conn->prepare($deleteQuery);
    $deleteStmt->bind_param("i", $id);

    if ($deleteStmt->execute()) {
        echo "Usuário excluído com sucesso!";
    } else {
        echo "Erro ao excluir o usuário: " . $deleteStmt->error;
    }
    $deleteStmt->close();
}

// Selecionar usuários e exibir na tabela
$query = "SELECT * FROM usuarios";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    echo "<table border='1'>
            <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Gênero</th>
                <th>Data de Nascimento</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Endereço</th>
                <th>Ações</th>
            </tr>";

    while ($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>{$row['nome']}</td>
                <td>{$row['email']}</td>
                <td>{$row['telefone']}</td>
                <td>{$row['genero']}</td>
                <td>{$row['datanascimento']}</td>
                <td>{$row['cidade']}</td>
                <td>{$row['estado']}</td>
                <td>{$row['endereco']}</td>
                <td>
                    <a href='?delete={$row['id']}' onclick=\"return confirm('Tem certeza que deseja excluir este usuário?');\">Excluir</a>
                </td>
              </tr>";
    }
    echo "</table>";
} else {
    echo "Nenhum registro encontrado.";
}

// Fecha a conexão
$conn->close();
?>