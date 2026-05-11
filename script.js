let currentSubject = localStorage.getItem('selectedSubject');
let currentLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakes = [];
let timerInterval;
let timeLeft = 0;

const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const progressBar = document.getElementById('progress-bar');
const subjectTitleElement = document.getElementById('subject-title');
const questionArea = document.getElementById('question-area');
const resultArea = document.getElementById('result-area');
const resultScore = document.getElementById('result-score');
const resultText = document.getElementById('result-text');
const mistakesReview = document.getElementById('mistakes-review');
const mistakesList = document.getElementById('mistakes-list');
const timerBox = document.getElementById('timer-box');
const timerText = document.getElementById('timer-text');

async function init() {
    if (!currentSubject) {
        location.href = 'index.html';
        return;
    }
    
    subjectTitleElement.innerText = `${currentSubject} - ${currentLevel}-daraja`;
    
    try {
        const fileName = localStorage.getItem('selectedFile') || 'psix.json';
        const response = await fetch(fileName);
        const allData = await response.json();
        
        let subjectQuestions = [];
        
        if (currentSubject === "Yakuniy Test") {
            // For Yakuniy Test, we take all questions from the file
            subjectQuestions = allData;
        } else {
            subjectQuestions = allData.filter(q => {
                if (!q.Fan_nomi) return false;
                let normalizedDataFan = q.Fan_nomi.trim().toLowerCase();
                let normalizedCurrentSubject = currentSubject.trim().toLowerCase();
                
                // Handle the specific typo "Milliy ttarbiya asoslari" in data
                if (normalizedCurrentSubject === "milliy tarbiya asoslari") {
                    return normalizedDataFan === "milliy tarbiya asoslari" || normalizedDataFan === "milliy ttarbiya asoslari";
                }
                
                return normalizedDataFan === normalizedCurrentSubject;
            });
        }
        
        if (subjectQuestions.length === 0) {
            alert('Bu fan bo\'yicha savollar topilmadi!');
            location.href = 'index.html';
            return;
        }

        // Try to filter by "Daraja" field first (e.g., "Daraja-1")
        const levelTag = `Daraja-${currentLevel}`;
        let filteredQuestions = subjectQuestions.filter(q => q.Daraja && q.Daraja === levelTag);

        // Fallback to index-based slicing if "Daraja" field is not used or empty for this level
        if (filteredQuestions.length === 0) {
            const itemsPerLevel = currentSubject === "Yakuniy Test" ? 180 : 30;
            const startIndex = (currentLevel - 1) * itemsPerLevel;
            const endIndex = startIndex + itemsPerLevel;
            filteredQuestions = subjectQuestions.slice(startIndex, endIndex);
        }
        
        questions = filteredQuestions;

        if (questions.length === 0) {
            alert('Ushbu daraja uchun savollar hali qo\'shilmagan.');
            location.href = 'index.html';
            return;
        }

        shuffleArray(questions);
        
        // Start Timer (30 seconds per question)
        startTimer(questions.length * 45); // 45 seconds per question total
        
        showQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Savollarni yuklashda xatolik yuz berdi.');
    }
}

function startTimer(seconds) {
    timeLeft = seconds;
    timerBox.style.display = 'flex';
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showResults();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerText.innerText = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (timeLeft < 60) {
        timerText.classList.add('timer-warn');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestion() {
    if (questions.length === 0) return;
    
    const questionData = questions[currentQuestionIndex];
    const text = questionData["Savol "] || questionData["Savol"];
    questionText.innerText = `${currentQuestionIndex + 1}. ${text}`;
    
    const options = [
        { text: questionData["Togri_javob"], isCorrect: true }
    ];

    // Collect all incorrect answers (handling both .1, .2 and 1, 2, 3 formats)
    Object.keys(questionData).forEach(key => {
        if (key.startsWith("Notogri_javob") && questionData[key]) {
            options.push({ text: questionData[key], isCorrect: false });
        }
    });

    shuffleArray(options);

    optionsList.innerHTML = '';
    options.forEach((option) => {
        const button = document.createElement('button');
        button.innerText = option.text;
        button.classList.add('option-btn');
        if (option.isCorrect) button.dataset.correct = "true";
        button.addEventListener('click', () => selectOption(button, option.text));
        optionsList.appendChild(button);
    });

    const progress = (currentQuestionIndex / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function selectOption(selectedButton, selectedText) {
    const buttons = optionsList.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
    });

    const isCorrect = selectedButton.dataset.correct === "true";
    const questionData = questions[currentQuestionIndex];

    if (isCorrect) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('wrong');
        // Record mistake
        mistakes.push({
            question: questionData["Savol "] || questionData["Savol"],
            yours: selectedText,
            correct: questionData["Togri_javob"]
        });
        
        buttons.forEach(btn => {
            if (btn.dataset.correct === "true") {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1200);
}

function showResults() {
    clearInterval(timerInterval);
    timerBox.style.display = 'none';
    questionArea.style.display = 'none';
    resultArea.style.display = 'block';
    progressBar.style.width = '100%';
    
    resultScore.innerText = `${score} / ${questions.length}`;
    
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
        resultText.innerText = "Ajoyib! Mukammal natija! 🎉";
    } else if (percentage >= 70) {
        resultText.innerText = "Yaxshi natija! Ballingiz yomon emas. 👍";
    } else {
        resultText.innerText = "Yana bir bor urinib ko'rishingizni tavsiya qilamiz. 💪";
    }

    // High Scores Logic
    saveHighScore(score, questions.length);

    // Mistakes Review Logic
    if (mistakes.length > 0) {
        mistakesReview.style.display = 'block';
        mistakesList.innerHTML = mistakes.map(m => `
            <div class="mistake-item">
                <div class="mistake-q">${m.question}</div>
                <div class="mistake-info">
                    <span class="yours">Sizning javobingiz: ${m.yours}</span>
                    <span class="correct-ans">To'g'ri javob: ${m.correct}</span>
                </div>
            </div>
        `).join('');
    }
}

function saveHighScore(currentScore, total) {
    const scores = JSON.parse(localStorage.getItem('psix_high_scores') || '[]');
    
    // We only save if it's better for this specific subject/level combo OR keep history
    // Let's keep the best 10 overall across all attempts
    scores.push({
        subject: currentSubject,
        level: currentLevel,
        score: currentScore,
        total: total,
        date: new Date().toLocaleDateString()
    });
    
    // Sort and keep top 20
    const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 20);
    localStorage.setItem('psix_high_scores', JSON.stringify(topScores));
}

init();
