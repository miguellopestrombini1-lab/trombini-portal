---
description: Sincroniza o código do projeto com o GitHub e Vercel, conectando o PC do Miguel com o Mac do Diogo.
---

Este workflow automatiza o envio e recebimento de código entre a máquina atual e o repositório remoto (GitHub).
Ele é essencial para a colaboração entre o Miguel (Windows) e o Diogo (Mac).

Siga estes passos EXATAMENTE nesta ordem, toda vez que o usuário pedir para sincronizar, salvar o progresso, ou atualizar o site para o Diogo ver:

1.  **Verificar e Resumir Alterações**:
    Antes de sincronizar, avalie rapidamente o que foi feito na sessão atual. 
    Se você (Antigravity) fez mudanças significativas no código hoje, adicione um breve resumo no topo da seção de histórico do arquivo `DIARIO_DE_BORDO.md`. 
    *Exemplo: "O Miguel criou a tela de login; O Diogo finalizou os botões azuis"*. 
    Isso é vital para que a outra IA entenda o contexto quando puxar o código.

2.  **Configurar Identidade Git (Segurança)**:
    // turbo-all
    Execute este comando para garantir que o Git saiba quem está fazendo a alteração (evita erros em computadores novos):
    `git config user.name "Sincronizacao Antigravity" && git config user.email "antigravity@trombiny.com"`

3.  **Adicionar e Commitar Mudanças**:
    Execute este comando para preparar todas as alterações feitas nesta máquina:
    `git add . && git commit -m "Auto-sync via Antigravity Workflow"`
    *Nota: É normal que este comando falhe se não houver nada para commitar. Ignore o erro caso "nothing to commit" apareça e siga para o passo 4.*

4.  **Puxar Alterações do Parceiro (Pull)**:
    Execute este comando para baixar o que a outra pessoa (Miguel ou Diogo) fez.
    `git pull origin main --rebase`
    *Nota: Usamos `--rebase` para juntar as histórias limpas.*

5.  **Enviar Alterações para a Nuvem e Vercel (Push)**:
    Execute este comando para enviar as mudanças da máquina atual para o GitHub:
    `git push origin main`

6.  **Ler o Diário (Apenas ao puxar)**:
    Após o Pull ser finalizado com sucesso, leia o arquivo `DIARIO_DE_BORDO.md` usando a ferramenta de leitura de arquivos para que você (Antigravity) possa atualizar seu próprio contexto sobre o que a outra pessoa e a outra IA fizeram recentemente.
    
7.  **Avisar o Usuário**:
    Informe ao usuário (usando a linguagem simples e em português) que a sincronização foi concluída com sucesso e que o pacote já está com a Vercel (se ele enviou) ou que as novidades do Diogo já estão no computador (se ele puxou).
