// Script para atualizar todas as páginas HTML com o sistema de navbar
// Execute com: node update-navbar-all-pages.js

const fs = require('fs');
const path = require('path');

// Lista de páginas HTML para atualizar
const htmlPages = [
    'Java.html',
    'Csharp.html',
    'C.html',
    'Frontend.html',
    'Backend.html',
    'programacao-new.html',
    'Programaçao.html',
    'desenvolvimentopessoal.html',
    'marketing.html',
    'vestibular.html',
    'Cadastro.html',
    'login.html'
];

// Função para atualizar uma página HTML
function updateHtmlPage(filename) {
    try {
        console.log(`Atualizando ${filename}...`);
        
        // Ler o arquivo
        let content = fs.readFileSync(filename, 'utf8');
        
        // Verificar se já tem o CSS da navbar
        if (!content.includes('src/styles/navbar-auth.css')) {
            // Adicionar CSS da navbar após outros CSS
            content = content.replace(
                /<link rel="stylesheet" href="[^"]*\.css">/g,
                (match) => match + '\n    <link rel="stylesheet" href="src/styles/navbar-auth.css">'
            );
            
            // Se não encontrou nenhum CSS, adicionar no head
            if (!content.includes('src/styles/navbar-auth.css')) {
                content = content.replace(
                    '</head>',
                    '    <link rel="stylesheet" href="src/styles/navbar-auth.css">\n</head>'
                );
            }
        }
        
        // Verificar se já tem os scripts da navbar
        if (!content.includes('src/js/navbar-auth.js')) {
            // Substituir scripts antigos pelos novos
            content = content.replace(
                /<script src="src\/js\/auth\.js"><\/script>/g,
                '<script src="src/js/auth-localStorage.js"></script>\n    <script src="src/js/navbar-auth.js"></script>'
            );
            
            // Se não encontrou auth.js, adicionar antes do fechamento do body
            if (!content.includes('src/js/navbar-auth.js')) {
                content = content.replace(
                    '</body>',
                    '    <script src="src/js/utils.js"></script>\n    <script src="src/js/auth-localStorage.js"></script>\n    <script src="src/js/navbar-auth.js"></script>\n    <script src="src/js/auth-ui.js"></script>\n</body>'
                );
            }
        }
        
        // Escrever o arquivo atualizado
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`✅ ${filename} atualizado com sucesso!`);
        
    } catch (error) {
        console.error(`❌ Erro ao atualizar ${filename}:`, error.message);
    }
}

// Função principal
function main() {
    console.log('🚀 Iniciando atualização das páginas HTML...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    htmlPages.forEach(filename => {
        if (fs.existsSync(filename)) {
            try {
                updateHtmlPage(filename);
                successCount++;
            } catch (error) {
                console.error(`❌ Erro ao processar ${filename}:`, error.message);
                errorCount++;
            }
        } else {
            console.log(`⚠️  Arquivo ${filename} não encontrado, pulando...`);
        }
    });
    
    console.log('\n📊 Resumo da atualização:');
    console.log(`✅ Páginas atualizadas com sucesso: ${successCount}`);
    console.log(`❌ Páginas com erro: ${errorCount}`);
    console.log(`⚠️  Páginas não encontradas: ${htmlPages.length - successCount - errorCount}`);
    
    if (successCount > 0) {
        console.log('\n🎉 Atualização concluída! Todas as páginas agora têm o sistema de navbar com autenticação.');
        console.log('\n📝 Próximos passos:');
        console.log('1. Teste o login em test-auth.html');
        console.log('2. Navegue pelas páginas para verificar se a navbar está funcionando');
        console.log('3. Verifique se o logout funciona corretamente');
    }
}

// Executar o script
main();
