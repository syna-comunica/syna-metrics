#!/bin/bash

# Script para fazer push do projeto para o GitHub
# Execute este script após instalar as ferramentas de desenvolvedor do Xcode

cd "$(dirname "$0")"

echo "Inicializando repositório Git..."
git init

echo "Adicionando arquivos..."
git add .

echo "Fazendo commit inicial..."
git commit -m "Initial commit"

echo "Configurando remote..."
git remote add origin https://github.com/syna-comunica/centralsyna.git 2>/dev/null || git remote set-url origin https://github.com/syna-comunica/centralsyna.git

echo "Criando branch main..."
git branch -M main

echo "Fazendo push com force..."
git push -f origin main

echo "Concluído!"

