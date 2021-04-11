const urlBase = 'https://opentdb.com/';
const proxy = 'https://cors-anywhere.herokuapp.com/';

const elementos = {
    categorias: document.getElementById('opt-categorias'),
    botoes: {
        botaoFacil: document.querySelector('.botao-facil'),
        botaoMedio: document.querySelector('.botao-medio'),
        botaoDificil: document.querySelector('.botao-dificil'),
        botaoStart: document.querySelector('.botao-start'),
    },
    telaQuizz: document.querySelector('.quizz'),
    telaInicial: document.querySelector('.inicial'),
    divPergunta: document.querySelector('.pergunta'),
    opcoes: {
        opcaoUm: document.getElementById('opcao-um'),
        opcaoDois: document.getElementById('opcao-dois'),
        opcaoTres: document.getElementById('opcao-tres'),
        opcaoQuatro: document.getElementById('opcao-quatro'),
    },
    btConfirma: document.querySelector('.confirma'),
    pontuacao: document.querySelector('.pontos'),
    estatisticas: new bootstrap.Modal(document.querySelector('#meu-modal')),
    estatisticasTexto: document.querySelector('.modal-body'),
};

let quizz = {
    pergunta: undefined,
    respostas: [],
    respostaCerta: undefined,
};

let categorias = [];
let questaoAtual = 0;
let dificuldadeAtual = '';
let pontuacao = 0;
let gameOver = 3;
let questoesRespondidas = 0;
let dificuldade = '';
let nomeDificuldade = '';
let categoria = '';
let nomeCategoria = '';

const resetVariaveis = () => {
    categorias = [];
    questaoAtual = 0;
    dificuldadeAtual = '';
    pontuacao = 0;
    gameOver = 3;
    questoesRespondidas = 0;
    dificuldade = '';
    let nomeDificuldade = '';
    categoria = '';
    let nomeCategoria = '';
};

const iniciarMenu = () => {
    resetVariaveis();
    buttonReset(elementos.botoes.botaoFacil);
    buttonReset(elementos.botoes.botaoMedio);
    buttonReset(elementos.botoes.botaoDificil);
    elementos.telaInicial.style.display = 'flex';
    elementos.telaQuizz.style.display = 'none';
    axios.get(`${urlBase}/api_category.php`)
    .then(response => {
        categorias = response.data.trivia_categories;
        elementos.categorias.innerHTML = `<option value="" disabled selected>Selecione uma Categoria</option>`;
        for (const categoria of categorias) {
            elementos.categorias.innerHTML += `<option>${categoria.name}</option>`;
        }
    })
    .catch(function(erro){
        console.log(`Erro: ${erro.message}`);
    });
};

const iniciarJogo = () => {
    if(elementos.botoes.botaoFacil.classList.contains('isSelected') || elementos.botoes.botaoMedio.classList.contains('isSelected') || elementos.botoes.botaoDificil.classList.contains('isSelected')){
        elementos.telaInicial.style.display = 'none';
        elementos.telaQuizz.style.display = 'flex';
        carregarDados();
    }
};

const proximaQuestao = () => {
    carregarDados();
    questaoAtual++;    
};

const prepararQuestao = () => {
    if(gameOver > 0){   
        quizz = embaralharRespostas(quizz);
        elementos.divPergunta.textContent = quizz.pergunta;
        elementos.opcoes.opcaoUm.textContent = quizz.respostas[0];
        elementos.opcoes.opcaoDois.textContent = quizz.respostas[1];
        elementos.opcoes.opcaoTres.textContent = quizz.respostas[2];
        elementos.opcoes.opcaoQuatro.textContent = quizz.respostas[3];
    } else{
        console.log(`Pontos: ${pontuacao}`);
        if(categoria == ''){
            categoria = 'Aleatória';
        }
        elementos.estatisticasTexto.innerHTML = `<div class="mx-auto letra-bonita">Pontuação final: ${pontuacao}</div>
                                                <div class="mx-auto letra-bonita">Questões respondidas: ${questoesRespondidas}</div>
                                                <div class="mx-auto letra-bonita">Dificuldade: ${dificuldade}</div>
                                                <div class="mx-auto letra-bonita">Categoria: ${categoria}</div>`;
        elementos.estatisticas.show();     
        iniciarMenu();
    }
}

const embaralharRespostas = (questao) => {
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * questao.respostas.length);
        const y = Math.floor(Math.random() * questao.respostas.length);
        const armazena = questao.respostas[x];
        questao.respostas[x] = questao.respostas[y];
        questao.respostas[y] = armazena;
    }

    return questao;
}

const carregarDados = () => {
    console.log("bom dia");
    if(elementos.botoes.botaoFacil.classList.contains('isSelected')){
        dificuldade = 'easy';
        nomeDificuldade = '&difficulty=easy';
        dificuldadeAtual = 'easy'
    } else if(elementos.botoes.botaoMedio.classList.contains('isSelected')){
        dificuldade = 'medium';
        nomeDificuldade = '&difficulty=medium';
        dificuldadeAtual = 'medium';
    } else if(elementos.botoes.botaoDificil.classList.contains('isSelected')){
        dificuldade = 'hard';
        nomeDificuldade = '&difficulty=hard';
        dificuldadeAtual = 'hard';
    }
    
    if(elementos.categorias.textContent != ''){
        elementCatch = document.querySelector('select');
        for (let i = 0; i < categorias.length; i++) {
            if(categorias[i].name == elementCatch.value){
                categoria = categorias[i].name;
                nomeCategoria = `&category=${categorias[i].id}`;
            }
        }
    }
    
    axios.get(`${urlBase}api.php?amount=1${nomeCategoria}${nomeDificuldade}`)
    .then(response => {
        const questao = response.data.results[0];
        console.log(questao);
        quizz.pergunta = questao.question;
        quizz.respostas = [];
        for (const opcao of questao.incorrect_answers) {
            quizz.respostas.push(opcao);
        }
        quizz.respostas.push(questao.correct_answer);
        quizz.respostaCerta = questao.correct_answer;

        prepararQuestao(questaoAtual);
    });
}

const mostrarFeedBack = (questao) => {
    for (let i = 0; i < questao.respostas.length; i++) {
        if(questao.respostas[i] == questao.respostaCerta){
            if(i == 0){
                elementos.opcoes.opcaoUm.classList.add('certo');
            }else if(i == 1){
                elementos.opcoes.opcaoDois.classList.add('certo');
            }else if(i == 2){
                elementos.opcoes.opcaoTres.classList.add('certo');    
            }else if(i == 3){
                elementos.opcoes.opcaoQuatro.classList.add('certo');
            }
        }else {
            if(i == 0){
                elementos.opcoes.opcaoUm.classList.add('errado');
            }else if(i == 1){
                elementos.opcoes.opcaoDois.classList.add('errado');
            }else if(i == 2){
                elementos.opcoes.opcaoTres.classList.add('errado');    
            }else if(i == 3){
                elementos.opcoes.opcaoQuatro.classList.add('errado');
            }
        }
    }
};

elementos.botoes.botaoStart.addEventListener('click', () => {
    iniciarJogo();
});

const buttonReset = (botao) => {
    botao.classList.remove('isSelected');
    botao.classList.remove('isSelected');
}

elementos.botoes.botaoFacil.addEventListener('click', () => {
    buttonReset(elementos.botoes.botaoFacil);
    buttonReset(elementos.botoes.botaoMedio);
    buttonReset(elementos.botoes.botaoDificil);
    elementos.botoes.botaoFacil.classList.add('isSelected');
    elementos.botoes.botaoMedio.classList.add('notSelected');
    elementos.botoes.botaoDificil.classList.add('notSelected');
})

elementos.botoes.botaoMedio.addEventListener('click', () => {
    buttonReset(elementos.botoes.botaoFacil);
    buttonReset(elementos.botoes.botaoMedio);
    buttonReset(elementos.botoes.botaoDificil);
    elementos.botoes.botaoFacil.classList.add('notSelected');
    elementos.botoes.botaoMedio.classList.add('isSelected');
    elementos.botoes.botaoDificil.classList.add('notSelected');
})

elementos.botoes.botaoDificil.addEventListener('click', () => {
    buttonReset(elementos.botoes.botaoFacil);
    buttonReset(elementos.botoes.botaoMedio);
    buttonReset(elementos.botoes.botaoDificil);
    elementos.botoes.botaoFacil.classList.add('notSelected');
    elementos.botoes.botaoMedio.classList.add('notSelected');
    elementos.botoes.botaoDificil.classList.add('isSelected');
})

const verificarAcerto = () => {
    if(elementos.opcoes.opcaoUm.classList.contains('isSelected') && elementos.opcoes.opcaoUm.textContent == quizz.respostaCerta){
        if(dificuldadeAtual == 'easy'){
            pontuacao = +(elementos.pontuacao.textContent) + 5;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'medium'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 8;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'hard'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 10;
            elementos.pontuacao.textContent = pontuacao;
        }
    } else if(elementos.opcoes.opcaoDois.classList.contains('isSelected') && elementos.opcoes.opcaoDois.textContent == quizz.respostaCerta){
        if(dificuldadeAtual == 'easy'){
            pontuacao = +(elementos.pontuacao.textContent) + 5;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'medium'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 8;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'hard'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 10;
            elementos.pontuacao.textContent = pontuacao;
        }
    } else if(elementos.opcoes.opcaoTres.classList.contains('isSelected') && elementos.opcoes.opcaoTres.textContent == quizz.respostaCerta){
        if(dificuldadeAtual == 'easy'){
            pontuacao = +(elementos.pontuacao.textContent) + 5;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'medium'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 8;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'hard'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 10;
            elementos.pontuacao.textContent = pontuacao;
        }
    } else if(elementos.opcoes.opcaoQuatro.classList.contains('isSelected') && elementos.opcoes.opcaoQuatro.textContent == quizz.respostaCerta){
        if(dificuldadeAtual == 'easy'){
            pontuacao = +(elementos.pontuacao.textContent) + 5;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'medium'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 8;
            elementos.pontuacao.textContent = pontuacao;
        } else if(dificuldadeAtual == 'hard'){
            pontuacao = parseInt(elementos.pontuacao.textContent) + 10;
            elementos.pontuacao.textContent = pontuacao;
        }
    } else{
        gameOver--;
        if(dificuldadeAtual == 'easy'){
            pontuacao = parseInt(elementos.pontuacao.textContent) - 5; 
            elementos.pontuacao.textContent = pontuacao;
        }else if(dificuldadeAtual == 'medium'){
            pontuacao = parseInt(elementos.pontuacao.textContent) - 8; 
            elementos.pontuacao.textContent = pontuacao;
        }else if(dificuldadeAtual == 'hard'){
            pontuacao = parseInt(elementos.pontuacao.textContent) - 10; 
            elementos.pontuacao.textContent = pontuacao;
        }
    }
};

elementos.btConfirma.addEventListener('click', () => {
    if(elementos.btConfirma.textContent != '' && (elementos.opcoes.opcaoUm.classList.contains('isSelected') || (elementos.opcoes.opcaoDois.classList.contains('isSelected')) || elementos.opcoes.opcaoTres.classList.contains('isSelected') || elementos.opcoes.opcaoQuatro.classList.contains('isSelected'))){
        elementos.opcoes.opcaoUm.disabled = true;
        elementos.opcoes.opcaoDois.disabled = true;
        elementos.opcoes.opcaoTres.disabled = true;
        elementos.opcoes.opcaoQuatro.disabled = true;
        elementos.btConfirma.textContent = '';
        elementos.btConfirma.classList.add('seta');
        questoesRespondidas++;
        mostrarFeedBack(quizz);
        verificarAcerto();
    }else if(elementos.btConfirma.textContent == '') {
        buttonReset(elementos.opcoes.opcaoUm);
        buttonReset(elementos.opcoes.opcaoDois);
        buttonReset(elementos.opcoes.opcaoTres);
        buttonReset(elementos.opcoes.opcaoQuatro);
        elementos.opcoes.opcaoUm.disabled = false;
        elementos.opcoes.opcaoDois.disabled = false;
        elementos.opcoes.opcaoTres.disabled = false;
        elementos.opcoes.opcaoQuatro.disabled = false;
        elementos.btConfirma.classList.remove('seta');
        elementos.btConfirma.textContent = 'Responder';
        questaoAtual++;
        elementos.opcoes.opcaoUm.classList.remove('certo');
        elementos.opcoes.opcaoUm.classList.remove('errado');
        elementos.opcoes.opcaoDois.classList.remove('certo');
        elementos.opcoes.opcaoDois.classList.remove('errado');
        elementos.opcoes.opcaoTres.classList.remove('certo');
        elementos.opcoes.opcaoTres.classList.remove('errado');
        elementos.opcoes.opcaoQuatro.classList.remove('certo');
        elementos.opcoes.opcaoQuatro.classList.remove('errado');
        proximaQuestao();
    }
});

elementos.opcoes.opcaoUm.addEventListener('click', () => {
    buttonReset(elementos.opcoes.opcaoUm);
    buttonReset(elementos.opcoes.opcaoDois);
    buttonReset(elementos.opcoes.opcaoTres);
    buttonReset(elementos.opcoes.opcaoQuatro);
    
    elementos.opcoes.opcaoUm.classList.add('isSelected');
});

elementos.opcoes.opcaoDois.addEventListener('click', () => {
    buttonReset(elementos.opcoes.opcaoUm);
    buttonReset(elementos.opcoes.opcaoDois);
    buttonReset(elementos.opcoes.opcaoTres);
    buttonReset(elementos.opcoes.opcaoQuatro);

    elementos.opcoes.opcaoDois.classList.add('isSelected');
});

elementos.opcoes.opcaoTres.addEventListener('click', () => {
    buttonReset(elementos.opcoes.opcaoUm);
    buttonReset(elementos.opcoes.opcaoDois);
    buttonReset(elementos.opcoes.opcaoTres);
    buttonReset(elementos.opcoes.opcaoQuatro);

    elementos.opcoes.opcaoTres.classList.add('isSelected');
});

elementos.opcoes.opcaoQuatro.addEventListener('click', () => {
    buttonReset(elementos.opcoes.opcaoUm);
    buttonReset(elementos.opcoes.opcaoDois);
    buttonReset(elementos.opcoes.opcaoTres);
    buttonReset(elementos.opcoes.opcaoQuatro);

    elementos.opcoes.opcaoQuatro.classList.add('isSelected');
});

iniciarMenu();
