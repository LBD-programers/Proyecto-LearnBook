// ===============================
// Matemáticas 2do Año - LearnBook
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ejemplo-mate2do");
    if (btn) {
        btn.addEventListener("click", () => {
            const resultado = document.getElementById("resultado-mate2do");
            resultado.textContent = "Ejemplo: Ecuación simple → 2x + 3 = 7 → x = 2.";
        });
    }
});

// Función para revisar respuestas de ejercicios
function checkAnswers2do(topic) {
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
        feedbackText = "🎉 ¡Excelente! Resolviste todo correctamente.";
    } else {
        feedbackText = `✅ Respuestas correctas: ${correctAnswers} de ${totalQuestions}.<br>❌ Revisa lo siguiente:`;
        if (incorrectAnswers.length > 0) {
            feedbackText += "<ul class='incorrect-list'>";
            incorrectAnswers.forEach(item => {
                feedbackText += `<li>Tu respuesta: <span class='incorrect-input'>${item.userAnswer || "En blanco"}</span> → Solución: <span class='correct-solution'>${item.correctSolution}</span></li>`;
            });
            feedbackText += "</ul>";
        }
    }

    displayFeedback2do(topic, isCorrect, feedbackText);
}

function displayFeedback2do(topic, isCorrect, message) {
    const feedbackDiv = document.getElementById(`feedback-${topic}`);
    feedbackDiv.innerHTML = message;
    feedbackDiv.className = "feedback";
    feedbackDiv.classList.add(isCorrect ? "correct" : "incorrect");
}
