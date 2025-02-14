// Função que adiciona o CSS dinamicamente
function addCSS() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(45deg, #1a1a1a, #540287);
            color: #fff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
        }

        .container {
            text-align: center;
            padding: 30px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 15px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        }

        p {
            font-size: 1.2em;
            margin-bottom: 30px;
            color: #e3e3e3;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
        }

        .button {
            background: linear-gradient(45deg, #9c27b0, #540287);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            font-size: 1.1em;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            border-radius: 25px; /* Botão arredondado */
            border: 2px solid #9c27b0;
        }

        .button:hover {
            background: linear-gradient(45deg, #540287, #9c27b0);
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
        }

        /* Estilo para os boxes de promoções e novidades */
        .promo-box, .news-box {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-top: 30px;
        }

        .promo-box h2, .news-box h2 {
            color: #343a40;
        }

        .promo-box ul, .news-box ul {
            list-style-type: none;
            padding-left: 0;
            text-align: left;
            margin-top: 10px;
        }

        .promo-box li, .news-box li {
            margin: 10px 0;
            font-size: 1em;
        }
    `;
    document.head.appendChild(style);
}

function createVIPPage() {
    addCSS();

    const container = document.createElement('div');
    container.classList.add('container');
    document.body.appendChild(container);

    const header = document.createElement('h1');
    header.textContent = 'Bem-vindo à Área VIP do Cinema!';
    container.appendChild(header);

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Exclusivo para clientes VIP - Aproveite as promoções e novidades!';
    container.appendChild(paragraph);

    const backButton = document.createElement('button');
    backButton.textContent = 'Voltar à Página Inicial';
    backButton.classList.add('button');
    
    backButton.addEventListener('click', function() {
        window.location.href = '/logado'; 
    });
    container.appendChild(backButton);

    const promoBox = createBox('Promoções Exclusivas', 'promocoes', 'showPromocoesBtn', 'hidePromocoesBtn');
    const newsBox = createBox('Novidades', 'novidades', 'showNovidadesBtn', 'hideNovidadesBtn');

    container.appendChild(promoBox);
    container.appendChild(newsBox);

    const promocoes = [
        { nome: "Desconto de 50% em ingressos para filmes 3D!", detalhes: "Válido apenas para sessões das 12h às 18h, de segunda a sexta-feira. Não acumulável com outras promoções." },
        { nome: "Compre 1 ingresso e ganhe 1 free para qualquer filme!", detalhes: "Promoção válida até o final do mês. O ingresso grátis é para a mesma sessão do primeiro ingresso comprado." },
        { nome: "Promoção de ingressos em combo, até 30% off!", detalhes: "Combos com pipoca e refrigerante. Desconto de 30% ao comprar o combo completo." }
    ];

    const novidades = [
        { nome: "Estreia do filme 'Vingadores: A Batalha Final' nesta sexta-feira!", detalhes: "O filme será exibido em todas as salas, com sessões 2D e 3D. Não perca!" },
        { nome: "Novo sistema de reservas online com descontos exclusivos para VIPs!", detalhes: "Reserve seu ingresso com 10% de desconto ao utilizar nosso novo sistema online!" },
        { nome: "Mais de 20 novos filmes em cartaz a partir da próxima semana!", detalhes: "Prepare-se para as estreias de grandes filmes. Mais detalhes em breve." }
    ];

    document.getElementById('showPromocoesBtn').addEventListener('click', function() {
        const listaPromocoes = document.getElementById('promocoes');
        listaPromocoes.innerHTML = '';
        promocoes.forEach(promocao => {
            const li = document.createElement('li');
            li.innerHTML = `${promocao.nome} <br><span style="font-size: 12px; color: gray;">${promocao.detalhes}</span>`;
            listaPromocoes.appendChild(li);
        });
        this.style.display = 'none'; 
        document.getElementById('hidePromocoesBtn').style.display = 'inline'; 
    });

    document.getElementById('hidePromocoesBtn').addEventListener('click', function() {
        document.getElementById('promocoes').innerHTML = ''; 
        this.style.display = 'none'; 
        document.getElementById('showPromocoesBtn').style.display = 'inline'; 
    });

    document.getElementById('showNovidadesBtn').addEventListener('click', function() {
        const listaNovidades = document.getElementById('novidades');
        listaNovidades.innerHTML = '';
        novidades.forEach(novidade => {
            const li = document.createElement('li');
            li.innerHTML = `${novidade.nome} <br><span style="font-size: 12px; color: gray;">${novidade.detalhes}</span>`;
            listaNovidades.appendChild(li);
        });
        this.style.display = 'none';
        document.getElementById('hideNovidadesBtn').style.display = 'inline'; 
    });

    document.getElementById('hideNovidadesBtn').addEventListener('click', function() {
        document.getElementById('novidades').innerHTML = ''; 
        this.style.display = 'none'; 
        document.getElementById('showNovidadesBtn').style.display = 'inline'; 
    });
}

function createBox(title, listId, showBtnId, hideBtnId) {
    const box = document.createElement('div');
    box.classList.add(listId === 'promocoes' ? 'promo-box' : 'news-box');

    const heading = document.createElement('h2');
    heading.textContent = title;
    box.appendChild(heading);

    const list = document.createElement('ul');
    list.id = listId;
    box.appendChild(list);

    const showButton = document.createElement('button');
    showButton.id = showBtnId;
    showButton.textContent = `Mostrar ${title}`;
    showButton.classList.add('button');
    box.appendChild(showButton);

    const hideButton = document.createElement('button');
    hideButton.id = hideBtnId;
    hideButton.textContent = `Ocultar ${title}`;
    hideButton.classList.add('button');
    hideButton.style.display = 'none';
    box.appendChild(hideButton);

    return box;
}

createVIPPage();
