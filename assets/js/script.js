let currentIndex = 0;
const images = document.querySelectorAll('.carousel-image');
const totalImages = images.length;
const modeToggle = document.getElementById('mode-toggle');
const body = document.body;
const header = document.querySelector('header');

function showNextImage() {
    images[currentIndex].style.display = 'none'; // Esconde a imagem atual
    currentIndex = (currentIndex + 1) % totalImages; // Avança para a próxima imagem
    images[currentIndex].style.display = 'block'; // Mostra a nova imagem
}

// Inicializa o carrossel
images.forEach((img, index) => {
    img.style.display = index === 0 ? 'block' : 'none'; // Apenas a primeira imagem visível
});

// Troca de imagem a cada 3 segundos
setInterval(showNextImage, 8000);

// Alternar entre modo claro e escuro
modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    header.classList.toggle('dark-mode');
    document.querySelectorAll('.dropdown-content').forEach(item => {
        item.classList.toggle('dark-mode');
    });
    document.querySelectorAll('.course-card').forEach(card => {
        card.classList.toggle('dark-mode');
    });

    // Muda o texto do botão
    modeToggle.textContent = body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Escuro';
});
function initCardSlider() {
    const cards = document.querySelectorAll('.card');
    const nextButtons = document.querySelectorAll('.next');
    let currentIndex = 0;

    nextButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const currentCard = cards[currentIndex];

            currentCard.classList.add('slide-out');

            currentCard.addEventListener('transitionend', () => {
                currentCard.classList.remove('active', 'slide-out');
                currentIndex = (currentIndex + 1) % cards.length;
                cards[currentIndex].classList.add('active');
            }, { once: true });
        });
    });
}

initCardSlider();

