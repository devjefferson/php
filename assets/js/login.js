const frases = [
    "Não fique para trás! Amplie suas habilidades e abra novas portas.",
    "Aprenda algo novo e veja como sua vida pode mudar!",
    "Cada curso é uma nova chance de crescer. Não deixe passar!",
    "A educação é o melhor presente que você pode dar a si mesmo.",
    "Cada novo aprendizado é um passo mais perto dos seus sonhos!",
    "Invista em você mesmo hoje e colha os frutos amanhã!",
];

let index = 0;

function mudarFrase() {
    const fraseElement = document.getElementById('frase');

    fraseElement.classList.add('fade-out');

    setTimeout(() => {
        index = (index + 1) % frases.length;
        fraseElement.innerText = frases[index];
        fraseElement.classList.remove('fade-out');
        fraseElement.classList.add('fade-in');
    }, 500); // Tempo igual ao da transição CSS

    // Remover a classe fade-in após a transição
    setTimeout(() => {
        fraseElement.classList.remove('fade-in');
    }, 500);
}

mudarFrase();
setInterval(mudarFrase, 6000);

