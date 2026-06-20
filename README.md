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
├── assets/                 # Imagens, logos e ícones da marca
├── css/
│   ├── tokens/             # Variáveis nativas de CSS (cores, tipografia, layout)
│   ├── input.css           # Arquivo base de entrada do Tailwind
│   └── output.css          # CSS final compilado
├── js/
│   ├── api.js              # Lógica de integração com o backend (fetch)
│   ├── config.js           # Variáveis de ambiente locais (ignorado pelo Git)
│   └── main.js             # Lógica de interface, filtros e manipulação do DOM da Home
├── pages/
│   └── produto.html        # Página de detalhes do produto e redirecionamento pro WhatsApp
├── index.html              # Página principal do catálogo (Home)
└── package.json            # Gerenciamento de scripts do Tailwind CLI