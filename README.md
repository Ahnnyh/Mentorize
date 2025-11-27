Mentorize

Sistema de organização pessoal.

## Funcionalidades
- Dashboard com métricas de produtividade
- Gerenciamento de tarefas e metas
- Controle de sessões de estudo
- Sistema de anotações pessoais

## Tecnologias
- Frontend: HTML, CSS, JavaScript
- Backend: Java Spring Boot
- Database: MySQL

Pré-requisitos
Java JDK 17 ou superior
Maven 3.6 ou superior
MySQL 8.0 ou superior
MySQL Workbench
Navegador web moderno

## Abrir MySQL Workbench
Inicie o MySQL Workbench

Conecte-se ao servidor MySQL local
(Caso tenha senha, coloque em application.propeties)
Copie o conteúdo do db.sql e rode

## Verificar Instalação do Java
bash
java -version
# Deve mostrar: java version "17" ou superior

javac -version
# Deve mostrar: javac 17 ou superior

## Verificar Instalação do Maven
bash
mvn -version
# Deve mostrar: Apache Maven 3.6+ 

## Executar a Aplicação
Opção 1: Executar com Maven
bash
# Executar a aplicação Spring Boot
# Navegar até a pasta do projeto
cd mentorize

# Limpar e compilar
mvn clean compile

# Executar a aplicação
mvn spring-boot:run

## Acessar a Aplicação
Aplicação Web: http://localhost:8080/index.html
