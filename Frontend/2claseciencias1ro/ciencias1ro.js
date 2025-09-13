// ===============================
// Ciencias Naturales 1er Año - LearnBook
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ejemplo-ciencias1ro");
    if (btn) {
        btn.addEventListener("click", () => {
            const resultado = document.getElementById("resultado-ciencias1ro");
            resultado.textContent = "Ejemplo: Las plantas necesitan agua, luz y aire para vivir.";
        });
    }
});

// Función para revisar respuestas de ejercicios
function checkAnswersCiencias1ro(topic) {
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
        feedbackText = "🌟 ¡Excelente! Todas tus respuestas son correctas.";
    } else {
        feedbackText = `✅ Correctas: ${correctAnswers} de ${totalQuestions}.<br>❌ Revisa lo siguiente:`;
        if (incorrectAnswers.length > 0) {
            feedbackText += "<ul class='incorrect-list'>";
            incorrectAnswers.forEach(item => {
                feedbackText += `<li>Tu respuesta: <span class='incorrect-input'>${item.userAnswer || "En blanco"}</span> → Correcta: <span class='correct-solution'>${item.correctSolution}</span></li>`;
            });
            feedbackText += "</ul>";
        }
    }

    displayFeedbackCiencias1ro(topic, isCorrect, feedbackText);
}

function displayFeedbackCiencias1ro(topic, isCorrect, message) {
    const feedbackDiv = document.getElementById(`feedback-${topic}`);
    feedbackDiv.innerHTML = message;
    feedbackDiv.className = "feedback";
    feedbackDiv.classList.add(isCorrect ? "correct" : "incorrect");
}
