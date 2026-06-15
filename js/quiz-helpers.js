// ========================================
// Open Trivia DB Configuration
// ========================================

const apiUrl = "https://opentdb.com/";

// ========================================
// Endpoints
// ========================================

const endpoints = {
    questions: "api.php",
    categories: "api_category.php",
    token: "api_token.php"
};

// ========================================
// Session Token Handling
// ========================================

const sessionToken = {
    commands: {
        request: "request",
        reset: "reset"
    },

    async get() {
        const url =
            `${apiUrl}${endpoints.token}?command=${this.commands.request}`;

        const response = await fetch(url);
        const data = await response.json();

        sessionStorage.setItem("token", data.token);

        return data;
    },

    async reset(token) {
        const url =
            `${apiUrl}${endpoints.token}?command=${this.commands.reset}&token=${token}`;

        const response = await fetch(url);
        return await response.json();
    }
};

// ========================================
// Categories
// ========================================

const categories = {
    generalKnowledge: 9,
    books: 10,
    film: 11,
    music: 12,
    musicalsTheatre: 13,
    television: 14,
    videoGames: 15,
    boardGames: 16,
    scienceNature: 17,
    computers: 18,
    mathematics: 19,
    mythology: 20,
    sports: 21,
    geography: 22,
    history: 23,
    politics: 24,
    art: 25,
    celebrities: 26,
    animals: 27,
    vehicles: 28,
    comics: 29,
    gadgets: 30,
    animeManga: 31,
    cartoons: 32
};

// ========================================
// Difficulty Options
// ========================================

const difficulty = {
    easy: "easy",
    medium: "medium",
    hard: "hard"
};

// ========================================
// Question Types
// ========================================

const questionTypes = {
    multipleChoice: "multiple",
    trueFalse: "boolean"
};

// ========================================
// API Response Codes
// ========================================

const responseCodes = {
    success: 0,
    noResults: 1,
    invalidParameter: 2,
    tokenNotFound: 3,
    tokenEmpty: 4
};

// ========================================
// URL Builder
// ========================================

function buildQuizUrl({
    amount = 10,
    category = null,
    difficultyLevel = null,
    questionType = null,
    token = null
} = {}) {
    const params = new URLSearchParams();

    params.append("amount", amount);

    if (category)
        params.append("category", category);

    if (difficultyLevel)
        params.append("difficulty", difficultyLevel);

    if (questionType)
        params.append("type", questionType);

    if (token)
        params.append("token", token);

    return `${apiUrl}${endpoints.questions}?${params}`;
}

// ========================================
// Fetch Questions
// ========================================

async function getQuestions(options = {}) {
    const url = buildQuizUrl(options);

    const response = await fetch(url);
    const data = await response.json();

    return data;
}

// ========================================
// Fetch Categories
// ========================================

async function getCategories() {
    const url = `${apiUrl}${endpoints.categories}`;

    const response = await fetch(url);
    return await response.json();
}