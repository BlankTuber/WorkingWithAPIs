window.onload = async () => {
    // Create token if none exists
    if (!sessionStorage.getItem("token")) {
        await sessionToken.get();
    }
    await populateCategories()

    document
    .getElementById("amountSelector")
    .addEventListener("input", event => {
        document.getElementById("amountDisplay").textContent =
            event.target.value;
    });

    document
    .getElementById("startQuizBtn")
    .addEventListener("click", async event => {

        const button = event.target;

        button.disabled = true;
        button.textContent = "Loading...";

        try {
            await getQuiz();
        }
        catch (error) {
            console.error(error);

            button.disabled = false;
            button.textContent = "🚀 Start Quiz";
        }
    });
};

async function populateCategories() {
    const categorySelector =
        document.querySelector("#categorySelector");

    const data = await getCategories();

    data.trivia_categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category.id;
        option.textContent = category.name;

        categorySelector.append(option);
    });
}

async function getQuiz() {
    const amount =
        document.getElementById("amountSelector").value;

    const category =
        document.getElementById("categorySelector").value;

    const difficulty =
        document.getElementById("difficultySelector").value;

    const questionType =
        document.getElementById("questionTypeSelector").value;

    const quiz = await getQuestions({
        amount,
        category: category === "any" ? null : category,
        difficultyLevel:
            difficulty === "any" ? null : difficulty,
        questionType:
            questionType === "any" ? null : questionType,
        token: sessionStorage.getItem("token")
    });

    if (quiz.response_code !== 0) {
        alert("Could not generate quiz.");
        console.error(quiz);
        return;
    }

    sessionStorage.setItem(
        "quiz",
        JSON.stringify(quiz.results)
    );

    window.location.href = "playQuiz.html";
}