const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Intercepta a requisição, busca o token do Supabase e faz o fetch nativo.
async function apiFetch(endpoint, options = {}) {
    try {
        // Interceptor de Request: Busca a sessão ativa do Supabase
        const { data: { session } } = await supabaseClient.auth.getSession();

        // Configura os headers padrão
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        // Se houver uma sessão/token, injeta o Bearer Token automaticamente
        if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            headers: headers
        });

        // Interceptor de Response: Tratamento centralizado de erro
        if (!response.ok) {
            console.error("[API Error]", response.status, response.statusText);
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("[API Global Error Handling]", error.message);
        throw error;
    }
}

async function buscarProdutos() {
    try {
        return await apiFetch("/produtos/pesquisa");
    } catch (error) {
        return [];
    }
}

async function buscarPontosDeVenda() {
    try {
        return await apiFetch("/pvd");
    } catch (error) {
        return [];
    }
}