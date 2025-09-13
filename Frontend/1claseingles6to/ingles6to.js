document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ejemplo");
    if (btn) {
        btn.addEventListener("click", () => {
            const resultado = document.getElementById("resultado");
            resultado.textContent = "Example: The cat is on the table.";
        });
    }
});

function checkAnswers(topic) {
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
                input: input,
                userAnswer: answer,
                correctSolution: solution
            });
        }
    });

    if (isCorrect) {
        feedbackText = "¡Excelente! ¡Todas las respuestas son correctas!";
    } else {
        feedbackText = `Tienes ${correctAnswers} respuestas correctas de ${totalQuestions}.  Revisa lo siguiente:`;
        if (incorrectAnswers.length > 0) {
            feedbackText += "<ul class='incorrect-list'>";
            incorrectAnswers.forEach(item => {
                feedbackText += `<li>Tu respuesta: <span class='incorrect-input'>${item.userAnswer || "En blanco"}</span> - Solución correcta: <span class='correct-solution'>${item.correctSolution}</span></li>`;
            });
            feedbackText += "</ul>";
        }
    }

    displayFeedback(topic, isCorrect, feedbackText);
}

function displayFeedback(topic, isCorrect, message) {
    const feedbackDiv = document.getElementById(`feedback-${topic}`);
    feedbackDiv.innerHTML = message; // Use innerHTML to render the list
    feedbackDiv.className = "feedback"; // Reset classes
    feedbackDiv.classList.add(isCorrect ? "correct" : "incorrect");
}