// Инициализация счетчика
let score = 0;

// Получаем элементы
const scoreValue = document.querySelector('.score-value');
const cat = document.querySelector('.cat');
const gameArea = document.querySelector('.game-area');
const modal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultEmoji = document.getElementById('resultEmoji');
const restartButton = document.getElementById('restartButton');

// Устанавливаем координаты позиций для кота
const positions = [
    { top: 20, left: 20 },     // 1 - верхний левый
    { top: 20, left: 270 },    // 2 - верхний центр
    { top: 20, left: 520 },    // 3 - верхний правый
    { top: 170, left: 20 },    // 4 - средний левый
    { top: 170, left: 270 },   // 5 - центр
    { top: 170, left: 520 },   // 6 - средний правый
    { top: 320, left: 20 },    // 7 - нижний левый
    { top: 320, left: 270 },   // 8 - нижний центр
    { top: 320, left: 520 }    // 9 - нижний правый
];

// Текущая позиция кота (начинаем с центра - позиция 5)
let currentPos = 4; // Индекс для массива (соответствует позиции 5)

// Последние позиции, чтобы избегать повторений
let lastPositions = [4]; // Начинаем с центральной позиции

// Переместить кота в новую случайную позицию
function moveCatToRandomPosition() {
    // Получаем случайную позицию, избегая последних 3 позиций
    let newPosIndex;
    do {
        newPosIndex = Math.floor(Math.random() * 9);
    } while (lastPositions.includes(newPosIndex));
    
    // Обновляем историю позиций
    lastPositions.push(newPosIndex);
    if (lastPositions.length > 3) { // Храним только последние 3 позиции
        lastPositions.shift();
    }
    
    // Обновляем текущую позицию
    currentPos = newPosIndex;
    
    // Устанавливаем новое положение кота
    cat.style.top = positions[newPosIndex].top + 'px';
    cat.style.left = positions[newPosIndex].left + 'px';
}

// Проверка условий победы/поражения
function checkGameStatus() {
    if (score >= 30) {
        showResult(true, `Поздравляем! Вы набрали ${score} очков!`);
        return true;
    } else if (score < 0) {
        showResult(false, `Вы проиграли с ${score} очками. Кот оказался слишком быстрым!`);
        return true;
    }
    return false;
}

// Показать результат игры
function showResult(isWin, message) {
    resultTitle.textContent = isWin ? "Победа!" : "Поражение!";
    resultTitle.className = isWin ? "win-message" : "lose-message";
    resultMessage.textContent = message;
    
    // Добавляем соответствующий эмодзи в зависимости от результата
    resultEmoji.textContent = isWin ? "🏆" : "💩";
    
    modal.style.display = "flex";
}

// Обработчик клика по коту
cat.addEventListener('click', (event) => {
    // Предотвращаем всплытие события до game-area
    event.stopPropagation();
    
    // Увеличиваем счет
    score++;
    
    // Обновляем отображение счета
    scoreValue.textContent = score;
    
    // Проверяем статус игры
    if (!checkGameStatus()) {
        // Если игра продолжается, перемещаем кота
        moveCatToRandomPosition();
    }
});

// Обработчик клика по игровому полю (промах)
gameArea.addEventListener('click', (event) => {
    // Если клик был не по коту (а по игровому полю)
    if (event.target === gameArea) {
        // Уменьшаем счет за промах
        score -= 5;
        
        // Обновляем отображение счета
        scoreValue.textContent = score;
        
        // Проверяем статус игры
        if (!checkGameStatus()) {
            // Если игра продолжается, перемещаем кота
            moveCatToRandomPosition();
        }
    }
});

// Обработчик кнопки рестарта
restartButton.addEventListener('click', () => {
    // Сбрасываем счет
    score = 0;
    scoreValue.textContent = score;
    
    // Сбрасываем историю позиций и помещаем кота в центр
    lastPositions = [4];
    currentPos = 4;
    cat.style.top = positions[4].top + 'px';
    cat.style.left = positions[4].left + 'px';
    
    // Скрываем модальное окно
    modal.style.display = "none";
});

// Устанавливаем начальную позицию кота (центр)
cat.style.top = positions[4].top + 'px';
cat.style.left = positions[4].left + 'px';