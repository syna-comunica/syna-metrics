# Instruções para fazer push no GitHub

## Passo 1: Aceitar a licença do Xcode

Abra o Terminal e execute:
```bash
sudo xcodebuild -license
```

Pressione `q` para sair do visualizador de licença e depois digite `agree` quando solicitado.

## Passo 2: Executar o script de push

Depois de aceitar a licença, execute:
```bash
cd "/Users/allaneduardo/Downloads/centralsyna-main 2"
./push-to-github.sh
```

## Alternativa: Comandos manuais

Se preferir executar os comandos manualmente:

```bash
cd "/Users/allaneduardo/Downloads/centralsyna-main 2"

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit"

# Adicionar remote (ou atualizar se já existir)
git remote add origin https://github.com/syna-comunica/centralsyna.git
# ou se já existir:
# git remote set-url origin https://github.com/syna-comunica/centralsyna.git

# Criar branch main
git branch -M main

# Push com force
git push -f origin main
```

## Nota sobre autenticação

Se o GitHub solicitar autenticação:
- Use um Personal Access Token (PAT) como senha
- Ou configure SSH keys para autenticação sem senha

