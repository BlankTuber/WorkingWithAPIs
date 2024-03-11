let correctChoices = 0;

async function getSessionKey() {
    try {
        let result = await fetch("https://opentdb.com/api_token.php?command=request");
        let json = await result.json();
        sessionKey = json.token;
        sessionStorage.setItem("sessionKey", sessionKey);
    } catch (error) {
        console.error('Error fetching session key:', error);
    }
}

async function getQuiz() {
    try {
        let url = "https://opentdb.com/api.php?amount=" + amount;
        if (category !== 0) {
            url += "&category=" + category;
        }
        if (difficulty !== "any") {
            url += "&difficulty=" + difficulty;
        }
        if (type !== "both") {
            url += "&type=" + type;
        }
        url += "&token=" + sessionKey;

        let response = await fetch(url);
        let quizJson = await response.json();
        let responseCode = quizJson.response_code;

        switch (responseCode) {
            case 1:
                alert("No results...");
                window.location.href = "./special.html";
                break;

            case 2:
                alert("Invalid arguments! Please don't mess with me :<");
                window.location.href = "./special.html";
                break;

            case 3:
                alert("Token not found, will try to fix...");
                sessionStorage.removeItem("sessionKey");
                sessionKey = "none";
                await getSessionKey();
                break;

            case 4:
                alert("Quiz has been taken too many times. Resetting token...");
                await resetToken(sessionKey);
                break;

            case 5:
                alert("Rate limit! Too many requests...");
                window.location.href = "./special.html";
                break;

            default:
                quizObj = await quizJson.results;
                console.log(quizObj);
        }
    } catch (error) {
        console.error('Error fetching quiz:', error);
    }
}

async function resetToken(sessionKey) {
    try {
        let resp = await fetch("https://opentdb.com/api_token.php?command=reset&token=" + sessionKey);
        let respJson = await resp.json();
        sessionKey = respJson.token;
        sessionStorage.setItem("sessionKey", sessionKey);
    } catch (error) {
        console.error('Error resetting token:', error);
    }
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Main script

const params = new URLSearchParams(window.location.search);
let sessionKey = sessionStorage.getItem("sessionKey") || "none";
let amount = Number(params.get('amount')) || 10;
let category = Number(params.get('category')) || 0;
let difficulty = params.get('difficulty') || "any";
let type = params.get('type') || "both";

if (sessionKey === "none") {
    getSessionKey();
}

if (amount < 5) {
    amount = 5;
} else if (amount > 50) {
    amount = 50;
}

if (category < 9 && category !== 0) {
    category = 0;
} else if (category > 32 && category !== 0) {
    category = 0;
}

if (difficulty !== "any" && difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
    difficulty = "any";
}

if (type !== "both" && type !== "multiple" && type !== "boolean") {
    type = "both";
}

let quizObj;
getQuiz();


/* Multiple-questions div */
let multipleDiv = document.getElementById("multiple-quiz");
let multiq = document.getElementById("multiq");
let multiBtn1 = document.getElementById("multipleAnswr1");
let multiBtn2 = document.getElementById("multipleAnswr2");
let multiBtn3 = document.getElementById("multipleAnswr3");
let multiBtn4 = document.getElementById("multipleAnswr4");

/* True/False div */
let truFalDiv = document.getElementById("bool-quiz");
let boolq = document.getElementById("boolq");
let trueBtn = document.getElementById("answrTrue");
let falseBtn = document.getElementById("answrFalse");


let quizNumber = 0;
function runQuiz() {
    if (quizNumber <= amount) {
        console.log(quizObj[quizNumber]);
        const q = decodeHtmlStupidity(quizObj[quizNumber].question);
        const type = quizObj[quizNumber].type;
        const correctAnswer = decodeHtmlStupidity(quizObj[quizNumber].correct_answer);
        let answers = [];
        quizObj[quizNumber].incorrect_answers.forEach(element => {
            answers.push(decodeHtmlStupidity(element));
        });

        updateQuiz(type, q, correctAnswer, answers);
    }
}

function decodeHtmlStupidity(text) {
    let doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent;
}

function updateQuiz(type, question, trueAnswer, answers) {
    if (type === "boolean") {
        multipleDiv.classList.add("hidden");
        truFalDiv.classList.remove("hidden");

        boolq.innerText = question;
        if (trueAnswer === "true") {
            trueBtn.value = "true";
            falseBtn.value = "false";
        } else if (trueAnswer === "false") {
            falseBtn.value = "true";
            trueBtn.value = "false";
        }

    } else if (type === "multiple") {
        multipleDiv.classList.remove("hidden");
        truFalDiv.classList.add("hidden");

        multiq.innerText = question;
        
        let buttonusAnswrs = answers;
        buttonusAnswrs.push(trueAnswer);

        buttonusArray = shuffleArray(buttonusAnswrs);

        let truAnswrIndex = buttonusAnswrs.indexOf(trueAnswer);
        multiBtn1.innerText = buttonusAnswrs[0];
        multiBtn2.innerText = buttonusAnswrs[1];
        multiBtn3.innerText = buttonusAnswrs[2];
        multiBtn4.innerText = buttonusAnswrs[3];
        
        switch (truAnswrIndex) {
            case 0:
                multiBtn1.value = "true";
                multiBtn2.value = "false";
                multiBtn3.value = "false";
                multiBtn4.value = "false";
                break;
            case 1:
                multiBtn1.value = "false";
                multiBtn2.value = "true";
                multiBtn3.value = "false";
                multiBtn4.value = "false";
                break;
            case 2:
                multiBtn1.value = "false";
                multiBtn2.value = "false";
                multiBtn3.value = "true";
                multiBtn4.value = "false";
                break;
            case 3:
                multiBtn1.value = "false";
                multiBtn2.value = "false";
                multiBtn3.value = "false";
                multiBtn4.value = "true";
                break;
            default:
                alert("Something went wrong!")
                break;
        }
        

    } else {
        console.log(type);
    }

}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

document.getElementById("quizErrorHandler").innerText = "Quiz loading... Starting in about 2 seconds...";
setTimeout(() => {
    runQuiz();
    document.getElementById("quizErrorHandler").style.display = "none";
}, 2000);


async function checkAnswr(htmlElem) {
    const val = htmlElem.value;
    if (val == "true") {
        correctChoices++;
        htmlElem.classList.add("thisWasTru");
    }

    let buttons = Array.from(document.getElementsByTagName("button"))

    buttons.forEach((elementz)=>{
        elementz.disabled = true;
    });



    setTimeout(() => {
        buttons.forEach((elementz)=>{
            elementz.disabled = false;
        });
        quizNumber++;
        console.log(correctChoices);
        runQuiz();
    }, 1500);
}