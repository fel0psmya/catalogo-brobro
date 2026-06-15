# 🌶️ Catálogo Online B-R-O-Bró

Este projeto é um catálogo online para os produtos da marca de pimentas **B-R-O-Bró**. Ele foi desenvolvido como trabalho final da disciplina de Desenvolvimento Web, com o objetivo de aplicar conceitos de **HTML, CSS e JavaScript**, integrando com a API do sistema SIGBRO.

O usuário pode visualizar os produtos em estoque, selecionar um Ponto de Venda (PDV) e ser redirecionado diretamente para o WhatsApp do revendedor para concluir a compra.

---

## 🚀 Tecnologias Utilizadas

Para respeitar as restrições da disciplina (sem uso de frameworks JS como React ou Vue), o projeto utiliza:

*   **HTML5 & CSS3** puros.
*   **JavaScript (Vanilla JS)** para manipulação do DOM e consumo da API via `fetch()`.
*   **Tailwind CSS v4** (via CLI) para estilização e sistema de design.
*   **Git & GitHub** utilizando o padrão **Git Flow** para versionamento.

---

## 📂 Estrutura do Projeto

A arquitetura foi pensada para manter o código modularizado mesmo sem o uso de bundlers:

```text
catalogo-brobro/
├── assets/                 # Imagens, logos e ícones
├── css/
│   ├── tokens/             # Variáveis nativas de CSS (cores, tipografia)
│   ├── input.css           # Entrada do Tailwind
│   └── output.css          # CSS final gerado (ignorado pelo Git)
├── js/
│   ├── api.js              # Lógica de integração com o backend (fetch)
│   ├── config.js           # Variáveis de ambiente locais (ignorado pelo Git)
│   └── main.js             # Lógica de interface e manipulação do DOM
├── index.html              # Página principal do catálogo
└── package.json            # Gerenciamento do Tailwind CLI
