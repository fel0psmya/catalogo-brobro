// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(value) {
    const map = { '&': '&', '<': '<', '>': '>', '"': '"' };
    return String(value ?? '').replace(/[&<>"]/g, (c) => map[c] ?? c);
}

function formatDate(value) {
    if (!value) return 'Não informado';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(date);
}

function formatCurrency(value) {
    const n = Number(value ?? 0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        .format(Number.isNaN(n) ? 0 : n);
}

// ─── URL builders ─────────────────────────────────────────────────────────────

function buildImageUrl(path) {
    if (!path) return null;
    return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/SigBro_imgs/${path}`;
}

function buildWhatsappLink(phone, productName) {
    const digits = String(phone ?? '').replace(/\D+/g, '');
    if (!digits) return null;
    const normalized = digits.length >= 12 ? digits : `55${digits}`;
    const text = encodeURIComponent(
        `Olá! Vi o produto no catálogo B-R-O-Bró e quero saber mais sobre ${productName}.`
    );
    return `https://wa.me/${normalized}?text=${text}`;
}

function buildInstagramLink(handle) {
    if (!handle) return null;
    if (/^https?:\/\//i.test(handle)) return handle;
    const clean = String(handle).replace(/^@/, '').trim();
    return clean ? `https://www.instagram.com/${clean}` : null;
}

function buildMapsLink(pdv) {
    if (pdv.google_maps_url) return pdv.google_maps_url;
    const query = [pdv.nome || pdv.name, pdv.endereco].filter(Boolean).join(', ');
    return query
        ? `https://maps.google.com/?q=${encodeURIComponent(query)}`
        : null;
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function resolveRelatedPdvs(produto, allPdvs) {
    const raw = produto?.pvds
             ?? produto?.pdvs
             ?? produto?.pontos_de_venda
             ?? produto?.pontosDeVenda
             ?? [];

    // SE O PRODUTO NÃO TIVER LISTA ESPECÍFICA: Mostra todos os PDVs cadastrados na API
    if (!Array.isArray(raw) || raw.length === 0) {
        return allPdvs; 
    }

    // Se o produto tiver uma lista de IDs (ex: [1, 3, 5]), filtra apenas aqueles
    if (typeof raw[0] === 'number' || typeof raw[0] === 'string') {
        const ids = new Set(raw.map(String));
        return allPdvs.filter((pdv) => ids.has(String(pdv.id)));
    }

    return raw;
}

// ─── Controle de estado da UI ─────────────────────────────────────────────────

function showLoading() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('product-shell').classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('product-shell').classList.add('hidden');

    const el = document.getElementById('error-state');
    el.classList.remove('hidden');
    el.querySelector('[data-error-message]').textContent = message;
}

function showContent() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('product-shell').classList.remove('hidden');
}

// ─── Render: imagem ───────────────────────────────────────────────────────────

function renderImage(produto) {
    const imageUrl = buildImageUrl(produto.imagem_path) ?? produto.imagem_url ?? null;
    const col = document.getElementById('product-image-col');

    col.innerHTML = imageUrl
        ? `<img
               src="${escapeHtml(imageUrl)}"
               alt="${escapeHtml(produto.nome)}"
               class="w-full h-full object-cover"
               onerror="this.parentElement.innerHTML='<span class=\\'text-4xl\\'>🌶️</span>'"
           >`
        : `<span class="text-4xl">🌶️</span>`;
}

// ─── Render: cabeçalho (tipo, nome, descrição, status) ────────────────────────

function renderHeader(produto) {
    const tipo  = String(produto.tipo ?? 'produto').replaceAll('_', ' ');
    const ativo = produto.ativo;

    document.getElementById('product-type').textContent     = tipo;
    document.getElementById('product-title').textContent    = produto.nome ?? 'Produto';
    document.getElementById('product-subtitle').textContent = produto.descricao ?? '';

    const statusEl = document.getElementById('product-status');
    statusEl.textContent = ativo ? 'Ativo' : 'Inativo';
    statusEl.className = ativo
        ? 'inline-flex rounded-full px-3 py-1 text-xs font-semibold border bg-green-500/15 text-green-600 border-green-500'
        : 'inline-flex rounded-full px-3 py-1 text-xs font-semibold border bg-red-500/15 text-red-500 border-red-500';
}

// ─── Render: Insumos (Matéria-Prima) em Tabela ───────────────────────────────

function renderInsumos(produto) {
    const container = document.getElementById('product-insumos-container');
    if (!container) return;

    // 1. Tenta encontrar a lista de insumos usando várias chaves comuns
    const listaInsumos = produto.insumos || produto.ingredientes || produto.receita || produto.materias_primas || [];
    
    // DEBUG: Isto vai imprimir os dados do produto na consola para podermos ver a estrutura exata!
    console.log("🔍 Dados do Produto a serem analisados para insumos:", produto);

    if (!Array.isArray(listaInsumos) || listaInsumos.length === 0) {
        container.innerHTML = '';
        return;
    }

    // 2. Removemos o filtro restrito! Vamos mostrar todos os itens que vierem na lista.
    const materiasPrimas = listaInsumos;

    if (materiasPrimas.length > 0) {
        // Monta as linhas da tabela dinamicamente aceitando vários formatos
        const linhasTabela = materiasPrimas.map(i => {
            let nome = 'Insumo não identificado';
            let quantidade = '-';

            // Se a API enviar um Objeto (ex: { nome: 'Mel', quantidade: 200 })
            if (typeof i === 'object' && i !== null) {
                nome = escapeHtml(i.nome || i.descricao || i.insumo || i.materia_prima || 'Sem nome');
                quantidade = i.quantidade ? `${escapeHtml(i.quantidade)} ${escapeHtml(i.unidade_medida || i.unidade || '')}`.trim() : '-';
            } 
            // Se a API enviar apenas uma lista de palavras (ex: ['Mel', 'Pimenta', 'Vinagre'])
            else {
                nome = escapeHtml(String(i));
            }
            
            return `
                <tr class="border-b border-border-default last:border-0 hover:bg-bg-alt transition-colors">
                    <td class="py-sm px-md text-body-sm text-txt-primary font-medium capitalize">${nome}</td>
                    <td class="py-sm px-md text-body-sm text-txt-secondary text-right">${quantidade}</td>
                </tr>
            `;
        }).join('');
        
        // Desenha a tabela
        container.innerHTML = `
            <div class="mt-md bg-bg-primary border border-border-default rounded-sm overflow-hidden shadow-sm">
                <div class="bg-bg-surface px-md py-sm border-b border-border-default">
                    <h3 class="text-label text-brand uppercase tracking-widest font-bold">Matéria-Prima</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-bg-alt text-txt-secondary text-label uppercase tracking-wider border-b border-border-default">
                                <th class="py-sm px-md font-semibold">Ingrediente</th>
                                <th class="py-sm px-md font-semibold text-right">Qtd</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasTabela}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

// ─── Render: atributos técnicos ───────────────────────────────────────────────

// ─── Render: atributos técnicos ───────────────────────────────────────────────

function renderAttributes(produto) {
    // 1. Cria um destaque visual em HTML para a Carolina Reaper
    let destaqueCarolina = '';
    if (produto.tem_carolina_reaper) {
        destaqueCarolina = `<span class="text-red-600 font-bold uppercase tracking-wider bg-red-500/15 px-2 py-0.5 rounded-xs">Sim</span>`;
    } else {
        // Cores com melhor contraste para visualização (Azul suave)
        destaqueCarolina = `<span class="text-blue-700 bg-blue-50 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs text-[11px] border border-blue-100">Não</span>`;
    }

    // 2. Monta a lista da Ficha Técnica
    const attrs = [
        { label: 'Carolina Reaper',    value: destaqueCarolina, isHtml: true },
        { label: 'Alergênicos',        value: produto.alergenicos || 'Nenhum informado' },
        { label: 'Peso',               value: produto.peso_gramas ? `${produto.peso_gramas} g` : null },
        { label: 'Unidades por caixa', value: produto.unidades_por_caixa },
        { label: 'Validade',           value: produto.validade_meses ? `${produto.validade_meses} meses` : null },
    ].filter(({ value }) => value !== null && value !== undefined && value !== '');

    // 3. Desenha na tela
    document.getElementById('product-attrs').innerHTML = attrs.map(({ label, value, isHtml }) => `
        <div class="flex items-start gap-sm">
            <dt class="text-body-sm font-semibold text-txt-primary shrink-0 w-40">${escapeHtml(label)}</dt>
            <dd class="text-body-sm text-txt-secondary">${isHtml ? value : escapeHtml(value)}</dd>
        </div>`
    ).join('');
}

// ─── Render: picância ─────────────────────────────────────────────────────────

function renderSpice(produto) {
    const nivel = Number(produto.nivel_picancia ?? 0);
    if (nivel === 0) return;

    const dots = Array.from({ length: 10 }, (_, i) =>
        `<span class="h-3 w-3 rounded-full ${i < nivel ? 'bg-brand' : 'bg-border-default'}"></span>`
    ).join('');

    document.getElementById('product-spice').innerHTML = `
        <p class="text-label text-txt-secondary uppercase tracking-widest">Picância</p>
        <div class="flex flex-wrap gap-2">${dots}</div>
        <p class="text-body-sm text-txt-secondary">Nível ${escapeHtml(nivel)} de 10</p>`;
}

// ─── Render: preços ───────────────────────────────────────────────────────────

function renderPrices(produto) {
    document.getElementById('price-varejo').textContent  = formatCurrency(produto.preco_varejo);
    document.getElementById('price-atacado').textContent = formatCurrency(produto.preco_atacado);
}

// ─── Render: card de PDV ──────────────────────────────────────────────────────

function renderPdvCard(pdv, productName) {
    const whatsappLink  = buildWhatsappLink(pdv.telefone, productName);
    const instagramLink = buildInstagramLink(pdv.instagram);
    const mapsLink      = buildMapsLink(pdv);

    const socialBtn = (href, iconClass, label, colorClass) => `
        <a href="${escapeHtml(href)}"
            target="_blank"
            rel="noreferrer"
            title="${label}"
            class="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border-default bg-bg-primary text-txt-secondary transition-all hover:scale-110 ${colorClass}">
            <i class="${iconClass} text-lg"></i>
        </a>`;

    const hasLinks = whatsappLink || instagramLink || mapsLink;

    return `
        <article class="bg-bg-surface border border-border-default rounded-sm p-lg flex flex-col gap-md shadow-sm justify-between">

            <div class="flex items-start justify-between gap-sm">
                <div>
                    <p class="text-label text-txt-secondary uppercase tracking-widest">Ponto de Venda</p>
                    <h3 class="text-h3 text-txt-primary mt-xs font-bold">${escapeHtml(pdv.nome || pdv.name)}</h3>
                </div>
                ${pdv.tipo_zona
                    ? `<span class="shrink-0 inline-flex rounded-full border border-border-default px-3 py-1 text-xs font-semibold text-txt-secondary">
                           ${escapeHtml(pdv.tipo_zona)}
                       </span>`
                    : ''}
            </div>

            <div class="text-body-sm text-txt-secondary flex flex-col gap-xs flex-1 justify-center py-sm">
                ${pdv.endereco ? `
                    <div class="flex gap-2 items-start">
                        <i class="fa-solid fa-location-dot mt-1 text-txt-secondary"></i>
                        <p><span class="font-semibold text-txt-primary">Endereço:</span> ${escapeHtml(pdv.endereco)}</p>
                    </div>` : `
                    <p class="text-txt-placeholder italic">Endereço não informado</p>
                `}
            </div>

            ${hasLinks ? `
                <div class="flex items-center gap-md mt-auto pt-sm border-t border-border-default">
                    <span class="text-label text-txt-secondary uppercase tracking-widest mr-auto">Contato:</span>
                    
                    ${instagramLink ? socialBtn(instagramLink, 'fa-brands fa-instagram', 'Instagram', 'hover:text-[#E1306C] hover:border-[#E1306C]') : ''}
                    ${whatsappLink ? socialBtn(whatsappLink, 'fa-brands fa-whatsapp', 'WhatsApp', 'hover:text-[#25D366] hover:border-[#25D366]') : ''}
                    ${mapsLink ? socialBtn(mapsLink, 'fa-solid fa-map-location-dot', 'Google Maps', 'hover:text-[#4285F4] hover:border-[#4285F4]') : ''}
                </div>` : ''}

        </article>`;
}

// ─── Render: seção de PDVs ────────────────────────────────────────────────────

function renderPdvSection(produto, allPdvs) {
    const pdvs = resolveRelatedPdvs(produto, allPdvs);

    document.getElementById('pdv-section-title').textContent = pdvs.length > 0
        ? `Onde encontrar ${produto.nome}`
        : 'Pontos de venda';

    document.getElementById('pdv-count').textContent =
        `${pdvs.length} PDV${pdvs.length !== 1 ? 's' : ''}`;

    const grid  = document.getElementById('pdv-grid');
    const empty = document.getElementById('pdv-empty');

    if (pdvs.length > 0) {
        // CORRIGIDO AQUI: Passamos produto.nome em vez de productName
        grid.innerHTML = pdvs.map((pdv) => renderPdvCard(pdv, produto.nome)).join('');
        empty.classList.add('hidden');
    } else {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
    }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

function renderProductPage(produto, allPdvs) {
    showContent();
    renderImage(produto);
    renderHeader(produto);
    renderInsumos(produto); 
    renderAttributes(produto);
    renderSpice(produto);
    renderPrices(produto);
    renderPdvSection(produto, allPdvs);
}

document.addEventListener('DOMContentLoaded', async () => {
    showLoading();

    try {
        const params = new URLSearchParams(window.location.search);
        const produtoId = params.get('id');

        if (!produtoId) {
            showError('Informe um produto na URL usando o parâmetro ?id=...');
            return;
        }

        const [respostaProdutos, respostaPdvs] = await Promise.all([
            apiFetch('/produtos/pesquisa'), 
            apiFetch('/pvd').catch(() => []) 
        ]);

        const listaBruta = Array.isArray(respostaProdutos) ? respostaProdutos : (respostaProdutos.products || []);
        const produto = listaBruta.find(p => String(p.id) === String(produtoId));

        if (!produto) {
            showError('Produto não encontrado no catálogo.');
            return;
        }

        const todosPdvs = respostaPdvs.pvds || respostaPdvs.items || respostaPdvs.data || (Array.isArray(respostaPdvs) ? respostaPdvs : []);
        console.log("🛒 PDVs encontrados na API:", todosPdvs);

        renderProductPage(produto, todosPdvs);

    } catch (error) {
        console.error('[produto.js]', error);
        showError('Não foi possível carregar os detalhes do produto.');
    }
});