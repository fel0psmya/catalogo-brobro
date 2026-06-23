// Variáveis de estado
let todosProdutos = [];
let filtroCategoriaAtual = "todos";
let termoBuscaAtual = "";

// Mapeamento de tipos para exibição
const tipoLabels = {
    molho: "Molho",
    geleia: "Geleia",
    conserva: "Conserva",
};

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Inicializando o Catálogo B-R-O-Bró");

    try {
        const resposta = await buscarProdutos();
        
        // Captura o array de produtos, filtra apenas os ativos, ordena por id e armazena na variável global
        const listaBruta = resposta.products || [];
        const produtosAtivos = listaBruta.filter(produto => produto.ativo === true);
        todosProdutos = [...produtosAtivos].sort((a, b) => a.id - b.id);
        
        configurarFiltros();
        executarFiltragem();
    } catch (error) {
        console.error("Erro ao inicializar catálogo:", error);
        document.getElementById("loading-state").classList.add("hidden");
        document.getElementById("error-state").classList.remove("hidden");
    }
});

function configurarFiltros() {
    const searchInput = document.getElementById("search-input");
    const botoesFiltro = document.querySelectorAll(".btn-filter");

    searchInput.addEventListener("input", (e) => {
        termoBuscaAtual = e.target.value.toLowerCase().trim();
        executarFiltragem();
    });

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", (e) => {
            filtroCategoriaAtual = e.target.getAttribute("data-category");
            
            botoesFiltro.forEach(b => {
                b.classList.remove("bg-brand", "text-txt-on-brand");
                b.classList.add("bg-bg-primary", "text-txt-secondary");
            });
            e.target.classList.remove("bg-bg-primary", "text-txt-secondary");
            e.target.classList.add("bg-brand", "text-txt-on-brand");

            executarFiltragem();
        });
    });
}

function executarFiltragem() {
    const produtosFiltrados = todosProdutos.filter(produto => {
        const correspondeTexto = produto.nome.toLowerCase().includes(termoBuscaAtual) || 
                                 produto.descricao.toLowerCase().includes(termoBuscaAtual);
        
        const correspondeCategoria = filtroCategoriaAtual === "todos" || 
                                     produto.tipo.toLowerCase() === filtroCategoriaAtual;

        return correspondeTexto && correspondeCategoria;
    });

    console.log(`Encontrados: ${produtosFiltrados.length} produtos.`);
    
    // Esconde o loading
    document.getElementById("loading-state").classList.add("hidden");
    
    const gridElement = document.getElementById("produtos-grid");
    gridElement.classList.remove("hidden");
    gridElement.classList.add("grid");
    
    renderizarCatalogo(produtosFiltrados);
}

// Função global pra renderizar o catálogo, pode ser chamada de qualquer lugar
window.renderizarCatalogo = function(produtosFiltrados) {
    const grid = document.getElementById("produtos-grid");
    
    // Limpa a tela
    grid.innerHTML = ""; 

    // Se a busca não encontrar nada
    if (produtosFiltrados.length === 0) {
        grid.classList.remove("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
        grid.innerHTML = `
            <div class="col-span-full text-center py-lg border border-dashed border-border-default rounded-sm">
                <p class="text-h4 text-txt-secondary">Nenhuma pimenta encontrada para essa busca.</p>
            </div>`;
        return;
    }

    // Restaura as colunas do grid
    grid.classList.add("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
    
    produtosFiltrados.forEach(produto => {
        const BUCKET = "SigBro_imgs/";
        const urlBase = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/`;
        
        const imagemUrl = produto.imagem_path 
            ? `${urlBase}${BUCKET}${produto.imagem_path}`
            : null;

        const tipoLabel = tipoLabels[produto.tipo] || produto.tipo;
        const preco = Number(produto.preco_varejo).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });

        const card = document.createElement("div");
        card.className = [
            "bg-bg-surface",
            "border border-border-default",
            "rounded-sm",
            "shadow-sm",
            "flex flex-col",
            "cursor-pointer",
            "hover:shadow-md",
            "hover:-translate-y-1",
            "transition-all duration-200",
            "overflow-hidden",
        ].join(" ");

        card.innerHTML = `
            <div class="aspect-square w-full overflow-hidden bg-bg-primary flex items-center justify-center">
                ${
                    imagemUrl
                        ? `<img
                            src="${imagemUrl}"
                            alt="${produto.nome}"
                            class="w-full h-full object-cover"
                            onerror="this.parentElement.innerHTML='<span class=\\'text-4xl\\'>🌶️</span>'"
                          />`
                        : `<span class="text-4xl">🌶️</span>`
                }
            </div>

            <div class="flex flex-col gap-xs p-md flex-1">
                <span class="text-label text-brand uppercase font-bold tracking-widest">${tipoLabel}</span>
                <h3 class="text-h3 text-txt-primary mt-xs mb-sm">${produto.nome}</h3>
                <p class="text-body-sm text-txt-secondary line-clamp-2 flex-1">${produto.descricao || ""}</p>
                <div class="flex items-center justify-between mt-sm pt-sm border-t border-border-default">
                    <span class="text-h4 text-brand font-bold">${preco}</span>
                    <span class="text-label text-txt-secondary bg-bg-primary px-xs py-1 rounded-sm border border-border-default">
                        Ver detalhes →
                    </span>
                </div>
            </div>
        `;

        // Navegação ao clicar no card
        card.addEventListener("click", () => {
            window.location.href = `./pages/produto.html?id=${produto.id}`;
        });

        grid.appendChild(card);
    });
}