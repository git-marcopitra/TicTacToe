let quadroOriginal;
const humano = 'X';
const computador = 'O';
const celulas = document.querySelectorAll('.celula');
const vitoria = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2],
];


const minimaxAB = (novoQuadro, jogador, profundidade, alpha, beta) => {
    let melhorMovimento = 0;
    let melhorPontuancao = jogador === computador ? -Infinity : Infinity;
    const avaliarPontos = esvaziarQuadrados();
    if (profundidade >= 6) return { pontos: 0 };
    if (verificarVitoria(novoQuadro, humano)) return { pontos: -10 };
    else if (verificarVitoria(novoQuadro, computador)) return { pontos: 10 };
    else if (avaliarPontos.length === 0) return { pontos: 0 };

    for (let i = 0; i < avaliarPontos.length; i++) {
        const avaliarPonto = avaliarPontos[i];

        const jogadaAnterior = novoQuadro[avaliarPonto];
        novoQuadro[avaliarPonto] = jogador;

		if (jogador === computador)
		{
            const { pontos } = minimaxAB(
                novoQuadro,
                humano,
                profundidade +1,
                alpha,
                beta
            );
            novoQuadro[avaliarPonto] = jogadaAnterior;
            if (melhorPontuancao < pontos) {
                melhorMovimento = avaliarPonto;
                melhorPontuancao = pontos - profundidade * 10;
                alpha = alpha > melhorMovimento ? alpha : melhorMovimento;
                
                if (beta <= alpha) break;
            }
        } else {
            const { pontos } = minimaxAB(
                novoQuadro,
                computador,
                profundidade +1,
                alpha,
                beta
            );
            novoQuadro[avaliarPonto] = jogadaAnterior;
            if (melhorPontuancao > pontos) {
                melhorMovimento = avaliarPonto;
                melhorPontuancao = pontos + profundidade * 10;
                beta = beta < melhorMovimento ? beta : melhorMovimento;

                if (beta <= alpha) break;
            }
        }
    }
    return { index: melhorMovimento, pontos: melhorPontuancao };
}

const miniFn = (movimentos) => {
    let melhorMovimento = 0;
    let melhorPontuancao = -Infinity;
    movimentos.forEach((movimento, index) => {
        if (movimento.pontos > melhorPontuancao) {
            melhorPontuancao = movimento.pontos;
            melhorMovimento = index;
        }
    });
    return melhorMovimento;
}

const maxFn = (movimentos) => {
    let melhorMovimento = 0;
    let melhorPontuancao = Infinity;
    movimentos.forEach((movimento, index) => {
        if (movimento.pontos < melhorPontuancao) {
            melhorPontuancao = movimento.pontos;
            melhorMovimento = index;
        }
    });
    return melhorMovimento;
}

const minimax = (novoQuadro, jogador, profundidade) => {
    let melhorMovimento = 0;
    const movimentos = [];
    const avaliarPontos = esvaziarQuadrados();

    if(profundidade >= 6) return { pontos: 0 };
    if (verificarVitoria(novoQuadro, humano)) return { pontos: -10 };
    else if (verificarVitoria(novoQuadro, computador)) return { pontos: 10 };
    else if (avaliarPontos.length === 0) return { pontos: 0 };

    avaliarPontos.forEach((avaliarPonto) => {
        const index = novoQuadro[avaliarPonto];
        novoQuadro[avaliarPonto] = jogador;
        const { pontos } = minimax(
            novoQuadro,
            (jogador == computador) ? humano : computador,
            profundidade+1
        );
        const movimento = {
            index,
            pontos,
        };
        
        novoQuadro[avaliarPonto] = movimento.index;
        movimentos.push(movimento);
    });
        
    melhorMovimento = jogador === computador ? miniFn(movimentos) : maxFn(movimentos);

    return movimentos[melhorMovimento];
}

const verificarEmpate = () => {
    if (!esvaziarQuadrados().length) {
        celulas.forEach(celula => {
            celula.removeEventListener('click', turnoClique, false);
        });
        declaraVitoria("Jogo empatado!");
        return true;
    }
    return false;
}

const esvaziarQuadrados = () => quadroOriginal.filter(s => typeof s == 'number');

const melhorPosicao = () => minimaxAB(quadroOriginal, computador, 0, -Infinity, Infinity).index;

const terminarJogo = jogoVencido => {
    for (let index of vitoria[jogoVencido.index]) {
        document.getElementById(index).style.backgroundColor =
            jogoVencido.jogador == humano ? "green" : "red";
    }
    celulas.forEach(celula => {
        celula.removeEventListener('click', turnoClique, false);
    });
    declaraVitoria(jogoVencido.jogador == humano ? "Ganhaste!" : "Perdeste.");
}

const declaraVitoria = (quem) => {
    document.querySelector(".fimdejogo").style.display = "block";
    document.querySelector(".texto").innerText = quem;
}

const verificarVitoria = (quadro, jogador) => {
    const jogos = quadro.reduce((a, e, i) => (e === jogador) ? a.concat(i) : a, []);
    let jogoVencido = null;
    vitoria.forEach((eachVitoria, index) => {
        if (eachVitoria.every(elem => jogos.indexOf(elem) > -1)) {
            jogoVencido = { index: index, jogador: jogador };
            return;
        }
    });
    return jogoVencido;
}

const turno = (quadradoId, jogador, color) => {
    quadroOriginal[quadradoId] = jogador;
    document.getElementById(quadradoId).style.color = color;
    document.getElementById(quadradoId).innerText = jogador;
    const jogoVencido = verificarVitoria(quadroOriginal, jogador);

    if (jogoVencido) terminarJogo(jogoVencido);
}

const turnoClique = quadrado => {
    if (typeof quadroOriginal[quadrado.target.id] == 'number') {
        turno(quadrado.target.id, humano, 'blue');
        if (!verificarVitoria(quadroOriginal, humano) && !verificarEmpate()) {
            const time = Date.now();
            turno(melhorPosicao(), computador, 'yellow');
            console.log("Duração: ", Date.now() - time, "ms");
        }
    }
}

const comecarJogo = () => {
    document.querySelector(".fimdejogo").style.display = "none";
    quadroOriginal = Array.from(Array(9).keys());
    celulas.forEach(celula => {
        celula.innerText = '';
        celula.style.removeProperty('background-color');
        celula.addEventListener('click', turnoClique, false);
    });
}

comecarJogo();
