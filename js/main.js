document.addEventListener("DOMContentLoaded", async () => {
    console.log("Inicializando o Catálogo B-R-O-Bró...");

    try {
        const produtos = await buscarProdutos();
        console.log("Produtos recebidos do backend:", produtos);
        
        const pdvs = await buscarPontosDeVenda();
        console.log("Pontos de Venda recebidos:", pdvs);
        
        if (produtos && produtos.length > 0) {
            document.getElementById("loading-state").innerHTML = "<p class='text-green text-h4'>Conexão estabelecida com sucesso! Verifique o console.</p>";
        }
    } catch (error) {
        console.error("Erro ao conectar:", error);
        document.getElementById("loading-state").classList.add("hidden");
        document.getElementById("error-state").classList.remove("hidden");
    }
});