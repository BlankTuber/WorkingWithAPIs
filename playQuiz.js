let quiz;
let currentRound = 1;
let maxRounds;
let score = 0;

window.onload = () => {
    quiz = JSON.parse(sessionStorage.getItem("quiz"));

    if (!quiz) {
        console.error("No quiz found in sessionStorage");
        return;
    }

    maxRounds = quiz.length;

    nextRound();
};

function nextRound() {
    const index = currentRound - 1;

    if (index >= maxRounds) {
        endQuiz();
        return;
    }

    const currentQuestion = quiz[index];

    renderQuestion(currentQuestion);
}

function renderQuestion(question) {
    const questionEl = document.getElementById("quizQuestion");
    const buttonsArea = document.getElementById("buttonsArea");

    buttonsArea.innerHTML = "";

    questionEl.innerHTML = decodeHTML(question.question);

    updateProgress();

    const answers = [...question.incorrect_answers];
    answers.push(question.correct_answer);

    shuffle(answers);

    answers.forEach(answer => {
        const btn = document.createElement("button");

        btn.classList.add("quizBtn");
        btn.innerHTML = decodeHTML(answer);

        btn.addEventListener("click", () => handleAnswer(btn, answer, question));

        buttonsArea.appendChild(btn);
    });
}

function handleAnswer(button, selected, question) {
    const buttons = document.querySelectorAll(".quizBtn");

    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = selected === question.correct_answer;

    if (isCorrect) {
        button.classList.add("correct");
        score++;
    } else {
        button.classList.add("wrong");

        buttons.forEach(btn => {
            if (btn.innerHTML === decodeHTML(question.correct_answer)) {
                btn.classList.add("correct");
            }
        });
    }

    setTimeout(() => {
        currentRound++;
        nextRound();
    }, 800);
}

function updateProgress() {
    const bar = document.getElementById("scoreBar");
    const text = document.getElementById("progressText");

    bar.max = maxRounds;
    bar.value = currentRound - 1;

    text.textContent = `Score: ${score} / ${maxRounds}`;
}

function endQuiz() {
    const main = document.querySelector("main");

    main.innerHTML = `
        <section class="quizCard">
            <h2>Quiz Finished 🎉</h2>
            <p>Your score:</p>
            <h1>${score} / ${maxRounds}</h1>
        </section>
    `;

    setTimeout(() => {
        location.href = "./quiz.html"
    }, 3000);
}


// Helpers
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}