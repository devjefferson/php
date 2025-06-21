# Sistema de Autenticação localStorage - Azzo

## 📋 Resumo das Alterações

O sistema de autenticação da plataforma Azzo foi migrado do banco de dados MySQL/PHP para localStorage, permitindo funcionamento totalmente client-side sem necessidade de servidor backend.

## 🔄 Mudanças Realizadas

### 1. Novo Sistema de Autenticação
- **Arquivo criado:** `src/js/auth-localStorage.js`
- **Funcionalidade:** Gerencia cadastro, login e sessões usando localStorage
- **Características:**
  - Armazenamento local de usuários
  - Hash simples de senhas
  - Validação completa de formulários
  - Gerenciamento de sessões com timeout (24h)
  - Função "Lembrar de mim"

### 2. Páginas Atualizadas

#### `cadastro-new.html`
- ✅ Removido `action="assets/php/Register.php"` e `method="POST"`
- ✅ Atualizado script para usar `auth-localStorage.js`
- ✅ Mantida toda validação e UX existente

#### `login-new.html`
- ✅ Removido `action="assets/php/Login.php"` e `method="post"`
- ✅ Atualizado script para usar `auth-localStorage.js`
- ✅ Corrigido link para página de cadastro
- ✅ Mantida toda validação e UX existente

### 3. Arquivo de Teste
- **Arquivo criado:** `test-auth.html`
- **Funcionalidade:** Interface para testar o sistema de autenticação
- **Recursos:**
  - Verificar status da sessão
  - Listar usuários cadastrados
  - Criar usuário de teste
  - Visualizar dados do localStorage
  - Limpar dados para testes

## 🚀 Como Usar

### 1. Testando o Sistema
1. Abra `test-auth.html` no navegador
2. Clique em "Criar Usuário de Teste" para criar:
   - **Email:** teste@azzo.com
   - **Senha:** 12345678
3. Acesse `login-new.html` e faça login com essas credenciais
4. Teste o cadastro em `cadastro-new.html`

### 2. Estrutura de Dados

#### Usuário no localStorage
```json
{
  "id": "1640995200000abc123",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "genero": "Masculino",
  "datanascimento": "1990-01-01",
  "cidade": "São Paulo",
  "estado": "SP",
  "endereco": "Rua Exemplo, 123",
  "senha": "hash_da_senha",
  "created_at": "2023-12-31T23:59:59.999Z"
}
```

#### Chaves do localStorage
- `azzo_users`: Array com todos os usuários cadastrados
- `azzo_current_user`: Dados do usuário logado
- `azzo_is_logged_in`: Boolean indicando se há usuário logado
- `azzo_login_time`: Timestamp do login para controle de sessão
- `azzo_remember_email`: Email para função "Lembrar de mim"

## 🔧 Funcionalidades

### ✅ Cadastro de Usuários
- Validação completa de todos os campos
- Verificação de email duplicado
- Hash simples da senha
- Armazenamento no localStorage
- Redirecionamento automático para login

### ✅ Login de Usuários
- Validação de email e senha
- Verificação de credenciais
- Criação de sessão
- Função "Lembrar de mim"
- Redirecionamento para home

### ✅ Gerenciamento de Sessão
- Timeout automático de 24 horas
- Verificação de estado de login
- Logout com limpeza de dados
- Preenchimento automático de email lembrado

### ✅ Validações
- Email válido
- Senha mínima de 8 caracteres
- Nome com pelo menos 2 caracteres
- Telefone opcional com formato brasileiro
- Data de nascimento (mínimo 13 anos)
- Campos de endereço obrigatórios
- Aceitação de termos obrigatória

## 🔒 Segurança

### Limitações do Sistema Atual
- **Hash simples:** Implementação básica para demonstração
- **Dados locais:** Armazenados no navegador do usuário
- **Sem criptografia:** Dados visíveis no localStorage

### Recomendações para Produção
- Implementar hash seguro (bcrypt, scrypt, etc.)
- Adicionar criptografia dos dados
- Implementar rate limiting
- Adicionar validação CSRF
- Usar HTTPS obrigatório

## 📁 Arquivos Modificados

```
├── src/js/
│   └── auth-localStorage.js          # Novo sistema de autenticação
├── cadastro-new.html                 # Atualizado para localStorage
├── login-new.html                    # Atualizado para localStorage
├── test-auth.html                    # Página de teste (novo)
└── README-localStorage.md            # Esta documentação
```

## 🎯 Próximos Passos

1. **Testar funcionalidades:**
   - Cadastro de novos usuários
   - Login com diferentes credenciais
   - Logout e timeout de sessão
   - Função "Lembrar de mim"

2. **Integrar com outras páginas:**
   - Verificar autenticação em páginas protegidas
   - Adicionar botão de logout no header
   - Mostrar nome do usuário logado

3. **Melhorias futuras:**
   - Implementar recuperação de senha
   - Adicionar perfil do usuário
   - Implementar níveis de acesso
   - Adicionar logs de atividade

## 🐛 Resolução de Problemas

### Problema: Formulário não funciona
- **Solução:** Verifique se `auth-localStorage.js` está carregado
- **Verificação:** Abra o console e digite `localAuthManager`

### Problema: Dados não persistem
- **Solução:** Verifique se localStorage está habilitado
- **Verificação:** Teste em modo privado/incógnito

### Problema: Validação não funciona
- **Solução:** Verifique se todos os IDs dos campos estão corretos
- **Verificação:** Compare com a estrutura HTML original

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador para erros
2. Use `test-auth.html` para diagnosticar problemas
3. Verifique se todos os arquivos estão no local correto
4. Confirme que não há conflitos com outros scripts

---

**Nota:** Este sistema foi desenvolvido para demonstração e prototipagem. Para uso em produção, considere implementar medidas de segurança adicionais.
