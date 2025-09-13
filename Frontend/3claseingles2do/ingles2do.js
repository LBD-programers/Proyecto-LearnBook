// ===============================
// Inglés 2do Año - LearnBook
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ejemplo-ingles2do");
    if (btn) {
        btn.addEventListener("click", () => {
            const resultado = document.getElementById("resultado-ingles2do");
            resultado.textContent = "Ejemplo: 'She is reading a book.' (Ella está leyendo un libro.)";
        });
    }
});

// Función para revisar respuestas de ejercicios
function checkAnswersIngles2do(topic) {
    let isCorrect = true;
    let feedbackText = "";
    let correctAnswers = 0;
    let totalQuestions = 0;
    let incorrectAnswers = [];

    const topicSection = document.getElementById(`topic-${topic}`);
    const inputs = topicSection.querySelectorAll('input[type="text"]');

    inputs.forEach(input => {
        totalQuestions++;
        const solution = input.dataset.solution.trim().toLowerCase();
        const answer = input.value.trim().toLowerCase();

        if (answer === solution) {
            input.classList.add('correct');
            input.classList.remove('incorrect');
            correctAnswers++;
        } else {
            isCorrect = false;
            input.classList.add('incorrect');
            input.classList.remove('correct');
            incorrectAnswers.push({
                userAnswer: answer,
                correctSolution: solution
            });
        }
    });

    if (isCorrect) {
        feedbackText = "🎉 Excellent! Todas tus respuestas son correctas.";
    } else {
        feedbackText = `✅ Respuestas correctas: ${correctAnswers} de ${totalQuestions}.<br>❌ Revisa lo siguiente:`;
        if (incorrectAnswers.length > 0) {
            feedbackText += "<ul class='incorrect-list'>";
            incorrectAnswers.forEach(item => {
                feedbackText += `<li>Your answer: <span class='incorrect-input'>${item.userAnswer || "Blank"}</span> → Correct: <span class='correct-solution'>${item.correctSolution}</span></li>`;
            });
            feedbackText += "</ul>";
        }
    }

    displayFeedbackIngles2do(topic, isCorrect, feedbackText);
}

function displayFeedbackIngles2do(topic, isCorrect, message) {
    const feedbackDiv = document.getElementById(`feedback-${topic}`);
    feedbackDiv.innerHTML = message;
    feedbackDiv.className = "feedback";
    feedbackDiv.classList.add(isCorrect ? "correct" : "incorrect");
}
