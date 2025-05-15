// Инициализация переменных
let score = 0;
let timeLeft = 35; // Фиксированное время - 35 секунд
let initialTime = 35; // Значение для отображения в результатах
let gameInterval = null;
let timeInterval = null;
let isGameRunning = false;
let currentRank = "Нет ранга";
let currentRankIcon = "👶";
let moveIntervalTime = 1000; // Фиксированная скорость перемещения (легкий режим)

// Система рангов
const ranks = [
    { name: "Бронза", minScore: 0, maxScore: 4, icon: "🥉", color: "#cd7f32", emoji: "😐", bgColor: "#cd7f32", textColor: "white" },
    { name: "Серебро", minScore: 5, maxScore: 9, icon: "🥈", color: "#c0c0c0", emoji: "🙂", bgColor: "#c0c0c0", textColor: "#333" },
    { name: "Золото", minScore: 10, maxScore: 14, icon: "🥇", color: "#ffd700", emoji: "😊", bgColor: "#ffd700", textColor: "#333" },
    { name: "Платина", minScore: 15, maxScore: 19, icon: "💍", color: "#e5e4e2", emoji: "😄", bgColor: "#e5e4e2", textColor: "#333" },
    { name: "Алмаз", minScore: 20, maxScore: 24, icon: "💎", color: "#b9f2ff", emoji: "🤩", bgColor: "#b9f2ff", textColor: "#333" },
    { name: "Мастер", minScore: 25, maxScore: 29, icon: "👑", color: "#9966cc", emoji: "😎", bgColor: "#9966cc", textColor: "white" },
    { name: "ПанкМастер", minScore: 30, maxScore: Infinity, icon: "🔥", color: "#ff4081", emoji: "🤘", bgColor: "#ff4081", textColor: "white" }
];

// Набор смайликов для смены цели
const emojis = ["😎", "😁", "😂", "🤣", "😉", "😊", "😍", "🤔", "😜", "😏", "😋", "😇", "🥳", "🤯", "👽", "👻", "🤡", "👾"];

// Получаем элементы DOM
const scoreValue = document.querySelector('.score-value');
const timeValue = document.querySelector('.time-value');
const rankValue = document.querySelector('.rank-value');
const rankDisplay = document.querySelector('.rank-display');
const rankIcon = document.querySelector('.rank-icon');
const emojiTarget = document.querySelector('.emoji-target');
const gameArea = document.querySelector('.game-area');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const difficultySelect = document.getElementById('difficulty');
const difficultyContainer = document.querySelector('.difficulty-container');
const modal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultEmoji = document.getElementById('resultEmoji');
const finalRankIcon = document.getElementById('finalRankIcon');
const finalRankName = document.getElementById('finalRankName');
const finalScore = document.getElementById('finalScore');
const finalDifficulty = document.getElementById('finalDifficulty');
const timeUsed = document.getElementById('timeUsed');
const restartButton = document.getElementById('restartButton');
const lowerDifficultyButton = document.getElementById('lowerDifficultyButton');
const increaseDifficultyButton = document.getElementById('increaseDifficultyButton');
const shareButton = document.getElementById('shareButton');
const telegramShareButton = document.getElementById('telegramShareButton');

// Скрываем элементы выбора сложности
if (difficultyContainer) {
    difficultyContainer.style.display = 'none';
}

// Скрываем кнопки изменения сложности
if (lowerDifficultyButton) {
    lowerDifficultyButton.style.display = 'none';
}
if (increaseDifficultyButton) {
    increaseDifficultyButton.style.display = 'none';
}

// Получаем размеры игровой области
let gameAreaWidth = gameArea.clientWidth;
let gameAreaHeight = gameArea.clientHeight;
let targetWidth = emojiTarget.clientWidth;
let targetHeight = emojiTarget.clientHeight;

// Максимальные координаты для позиционирования цели
let maxTop = gameAreaHeight - targetHeight;
let maxLeft = gameAreaWidth - targetWidth;

// Последние позиции, чтобы избегать повторений
const lastPositions = [];
const maxLastPositions = 5; // Храним больше последних позиций

// Устанавливаем начальный стиль ранга
rankDisplay.classList.add('rank-initial');

// Обновление ранга игрока
function updateRank() {
    let newRank = ranks[0]; // По умолчанию бронза
    
    // Определяем ранг на основе количества очков
    for (const rank of ranks) {
        if (score >= rank.minScore && score <= rank.maxScore) {
            newRank = rank;
        }
    }
    
    // Очищаем предыдущие классы ранга
    rankDisplay.className = 'rank-display';
    
    if (newRank.name === "Нет ранга") {
        rankDisplay.classList.add('rank-initial');
    } else {
        // Добавляем класс в зависимости от ранга
        rankDisplay.classList.add('rank-' + newRank.name.toLowerCase());
    }
    
    // Обновляем отображение ранга
    rankValue.textContent = newRank.name;
    rankIcon.textContent = newRank.icon;
    rankValue.style.color = newRank.textColor;
    
    // Сохраняем текущий ранг
    currentRank = newRank.name;
    currentRankIcon = newRank.icon;
    
    return newRank;
}

// Случайный смайлик для цели
function getRandomEmoji() {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
}

// Переместить смайлик в новую случайную позицию
function moveTargetToRandomPosition() {
    // Обновляем размеры на случай, если окно изменилось
    gameAreaWidth = gameArea.clientWidth;
    gameAreaHeight = gameArea.clientHeight;
    maxTop = gameAreaHeight - targetHeight;
    maxLeft = gameAreaWidth - targetWidth;
    
    // Генерируем случайные координаты
    let newTop, newLeft;
    let isTooClose;
    
    do {
        newTop = Math.floor(Math.random() * maxTop);
        newLeft = Math.floor(Math.random() * maxLeft);
        
        // Проверяем, не слишком ли близко к последним позициям
        isTooClose = lastPositions.some(pos => {
            const distance = Math.sqrt(Math.pow(pos.top - newTop, 2) + Math.pow(pos.left - newLeft, 2));
            return distance < 100; // Минимальное расстояние между позициями
        });
    } while (isTooClose && lastPositions.length > 0);
    
    // Добавляем новую позицию в историю
    lastPositions.push({ top: newTop, left: newLeft });
    if (lastPositions.length > maxLastPositions) {
        lastPositions.shift();
    }
    
    // Устанавливаем новое положение смайлика
    emojiTarget.style.top = newTop + 'px';
    emojiTarget.style.left = newLeft + 'px';
    
    // Меняем смайлик
    emojiTarget.textContent = getRandomEmoji();
}

// Проверка условий завершения игры
function checkGameStatus() {
    // Проверяем только окончание времени
    if (timeLeft <= 0) {
        // Получаем финальный ранг
        const finalRank = updateRank();
        let message = `Время вышло! Ваш финальный счет: ${score} очков.`;
        
        if (finalRank.name === "ПанкМастер") {
            endGame(true, `${message} Вы настоящий ${finalRank.name}! Поздравляем!`);
        } else if (score >= 20) {
            endGame(true, `${message} Ваш ранг: ${finalRank.name}. Отличный результат!`);
        } else {
            endGame(false, `${message} Ваш ранг: ${finalRank.name}. Попробуйте еще раз!`);
        }
        return true;
    }
    return false;
}

// Формирование сообщения для шаринга
function createShareMessage() {
    const rank = updateRank();
    
    return `🎮 Я набрал ${score} очков в игре "Поймай смайлик"!\n` +
           `🏆 Мой ранг: ${rank.name} ${rank.icon}\n` +
           `⏱️ Время: ${initialTime - timeLeft}/${initialTime} сек\n` +
           `\n🔥 Сможешь побить мой рекорд?`;
}

// Показать результат игры и завершить игру
function endGame(isSuccess, message) {
    // Останавливаем все таймеры
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    
    // Определяем финальный ранг
    const finalRank = updateRank();
    
    // Обновляем интерфейс результата
    resultTitle.textContent = finalRank.name === "ПанкМастер" ? "ПанкМастер!" : "Игра окончена";
    resultTitle.style.color = finalRank.color;
    resultMessage.textContent = message;
    resultEmoji.textContent = finalRank.emoji;
    
    // Устанавливаем финальный ранг
    finalRankIcon.textContent = finalRank.icon;
    finalRankName.textContent = finalRank.name;
    finalRankName.style.color = finalRank.color;
    
    // Заполняем статистику
    finalScore.textContent = score;
    timeUsed.textContent = `${initialTime - timeLeft}/${initialTime} сек`;
    
    // Скрываем информацию о сложности в статистике
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        const label = item.querySelector('.stat-label');
        if (label && label.textContent === "Сложность:") {
            item.style.display = 'none';
        }
    });
    
    // Показываем модальное окно
    modal.style.display = "flex";
    
    // Сбрасываем состояние игры
    isGameRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
}

// Запуск игры
function startGame() {
    // Сбрасываем время и счет
    timeLeft = initialTime;
    score = 0;
    scoreValue.textContent = score;
    timeValue.textContent = timeLeft;
    
    // Сбрасываем ранг
    rankValue.textContent = "Нет ранга";
    rankIcon.textContent = "👶";
    
    // Обновляем стиль ранга на начальный
    rankDisplay.className = 'rank-display rank-initial';
    rankValue.style.color = "black";
    
    // Очищаем историю позиций
    lastPositions.length = 0;
    
    // Начинаем перемещать смайлик с заданным интервалом
    gameInterval = setInterval(moveTargetToRandomPosition, moveIntervalTime);
    
    // Запускаем таймер обратного отсчета
    timeInterval = setInterval(() => {
        timeLeft--;
        timeValue.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            checkGameStatus();
        }
    }, 1000);
    
    // Обновляем состояние игры
    isGameRunning = true;
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.textContent = "Пауза";
    
    // Перемещаем смайлик в случайную позицию сразу при старте
    moveTargetToRandomPosition();
}

// Приостановка/возобновление игры
function togglePause() {
    if (isGameRunning) {
        // Приостанавливаем игру
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        isGameRunning = false;
        pauseButton.textContent = "Продолжить";
    } else {
        // Возобновляем игру
        gameInterval = setInterval(moveTargetToRandomPosition, moveIntervalTime);
        timeInterval = setInterval(() => {
            timeLeft--;
            timeValue.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                checkGameStatus();
            }
        }, 1000);
        
        isGameRunning = true;
        pauseButton.textContent = "Пауза";
    }
}

// Поделиться результатом через Web Share API
function shareResult() {
    const shareMessage = createShareMessage();
    
    // Проверяем поддержку Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Мой результат в игре "Поймай смайлик"',
            text: shareMessage,
            url: window.location.href
        })
        .catch(error => {
            console.log('Ошибка при попытке поделиться:', error);
            // Если Web Share API не сработал, копируем в буфер обмена
            copyToClipboard(shareMessage);
        });
    } else {
        // Если нет поддержки, копируем в буфер обмена
        copyToClipboard(shareMessage);
    }
}

// Поделиться в Telegram
function shareToTelegram() {
    const shareMessage = encodeURIComponent(createShareMessage());
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${shareMessage}`;
    
    // Открываем новое окно для шаринга в Telegram
    window.open(telegramUrl, '_blank');
}

// Копирование текста в буфер обмена
function copyToClipboard(text) {
    // Создаем временный элемент для копирования
    const tempElement = document.createElement('textarea');
    tempElement.value = text;
    document.body.appendChild(tempElement);
    tempElement.select();
    
    try {
        document.execCommand('copy');
        alert('Результат скопирован в буфер обмена!');
    } catch (err) {
        console.error('Не удалось скопировать текст: ', err);
        alert('Не удалось скопировать результат. Пожалуйста, сделайте это вручную.');
    }
    
    document.body.removeChild(tempElement);
}

// Проверка, находится ли клик внутри смайлика
function isClickInsideEmoji(x, y) {
    const emojiRect = emojiTarget.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    // Преобразуем координаты клика относительно игровой области
    const relativeX = x - gameAreaRect.left;
    const relativeY = y - gameAreaRect.top;
    
    // Получаем координаты смайлика относительно игровой области
    const emojiLeft = parseFloat(emojiTarget.style.left) || (emojiRect.left - gameAreaRect.left);
    const emojiTop = parseFloat(emojiTarget.style.top) || (emojiRect.top - gameAreaRect.top);
    
    // Проверяем, находится ли клик внутри смайлика
    return (
        relativeX >= emojiLeft && 
        relativeX <= emojiLeft + targetWidth && 
        relativeY >= emojiTop && 
        relativeY <= emojiTop + targetHeight
    );
}

// Обработка клика для смайлика и игровой области
function handleClick(event) {
    // Только если игра запущена
    if (!isGameRunning) return;
    
    // Получаем координаты клика
    const x = event.clientX;
    const y = event.clientY;
    
    // Проверяем, был ли клик по смайлику
    if (isClickInsideEmoji(x, y)) {
        // Увеличиваем счет
        score++;
        
        // Обновляем отображение счета
        scoreValue.textContent = score;
        
        // Обновляем ранг
        updateRank();
        
        // Останавливаем всплытие события
        event.stopPropagation();
        
        // Проверяем статус игры
        if (!checkGameStatus()) {
            // Если игра продолжается, перемещаем смайлик
            moveTargetToRandomPosition();
        }
    } else if (event.target === gameArea) {
        // Клик был по игровой области (промах)
        // Уменьшаем счет за промах, но не ниже нуля
        score = Math.max(0, score - 5);
        
        // Обновляем отображение счета
        scoreValue.textContent = score;
        
        // Обновляем ранг
        updateRank();
    }
}

// Удаляем старые обработчики событий
emojiTarget.removeEventListener('click', null);
gameArea.removeEventListener('click', null);

// Добавляем новый обработчик для игровой области
gameArea.addEventListener('click', handleClick);

// Обработчики кнопок
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => {
    modal.style.display = "none";
    startGame();
});
shareButton.addEventListener('click', shareResult);
telegramShareButton.addEventListener('click', shareToTelegram);

// Адаптация размеров при изменении размера окна
window.addEventListener('resize', () => {
    // Обновляем размеры
    gameAreaWidth = gameArea.clientWidth;
    gameAreaHeight = gameArea.clientHeight;
    maxTop = gameAreaHeight - targetHeight;
    maxLeft = gameAreaWidth - targetWidth;
    
    // Если игра не запущена, обновляем позицию смайлика в центре
    if (!isGameRunning) {
        emojiTarget.style.top = (gameAreaHeight / 2 - targetHeight / 2) + 'px';
        emojiTarget.style.left = (gameAreaWidth / 2 - targetWidth / 2) + 'px';
    }
});
