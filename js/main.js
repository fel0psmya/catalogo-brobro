// Variáveis de estado
let todosProdutos = [];
let filtroCategoriaAtual = "todos";
let termoBuscaAtual = "";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🔥 Inicializando o Catálogo B-R-O-Bró...");

    try {
        const resposta = await buscarProdutos();
        // Captura o array de produtos de dentro do objeto retornado pela API (.products)
        todosProdutos = resposta.products || [];
        
        // Inicializa os listeners de eventos para busca e filtro
        configurarFiltros();

        // Renderização inicial (Chama a função mesmo se ela for provisória por enquanto)
        executarFiltragem();

    } catch (error) {
        console.error("❌ Erro ao inicializar catálogo:", error);
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

    // Restaura as colunas do grid e injeta caixas simples de teste
    grid.classList.add("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
    
    produtosFiltrados.forEach(produto => {
        grid.innerHTML += `
            <div class="bg-bg-surface border border-border-default p-md rounded-sm shadow-sm">
                <span class="text-label text-brand uppercase font-bold tracking-widest">${produto.tipo}</span>
                <h3 class="text-h3 text-txt-primary mt-xs mb-sm">${produto.nome}</h3>
                <p class="text-body-sm text-txt-secondary">Preço: R$ ${produto.preco_varejo}</p>
            </div>
        `;
    });
};