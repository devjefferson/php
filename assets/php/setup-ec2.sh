#!/bin/bash

# Atualizar o sistema
sudo yum update -y

# Instalar dependências
sudo yum install -y httpd php php-mysqli php-mbstring php-xml php-json php-curl mod_ssl

# Criar estrutura de diretórios
sudo mkdir -p /var/www/html/{assets,config,src,includes}
sudo mkdir -p /var/www/html/assets/{css,js,php,images}
sudo mkdir -p /var/lib/php/session
sudo mkdir -p /var/log/php

# Configurar permissões
sudo chown -R apache:apache /var/www/html
sudo chmod -R 755 /var/www/html
sudo chown -R apache:apache /var/lib/php/session
sudo chmod -R 755 /var/lib/php/session

# Criar arquivo de log do PHP
sudo touch /var/log/php/php_errors.log
sudo chown apache:apache /var/log/php/php_errors.log
sudo chmod 644 /var/log/php/php_errors.log

# Configurar PHP
sudo cp php.ini /etc/php.ini

# Configurar Apache
sudo cp azzo.conf /etc/httpd/conf.d/

# Habilitar e iniciar serviços
sudo systemctl enable httpd
sudo systemctl start httpd

# Verificar status
echo "Verificando status do Apache..."
sudo systemctl status httpd

echo "Verificando versão do PHP..."
php -v

echo "Verificando extensões do PHP..."
php -m

echo "Configuração concluída!" 