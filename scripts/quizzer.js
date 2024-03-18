let correctChoices = 0; // Variable to store points
let quizObj; //Declares the global quiz object


/*
Function to get a "sessionkey", provided by the api. This makes sure that the user doesnt get the same questions multiple times,
even if they start a new quiz. (There are not unlimited questions, so after a while the sessionkey might need to be reset.)
*/
async function getSessionKey() {
    try {
        let result = await fetch("https://opentdb.com/api_token.php?command=request");
        let json = await result.json();
        sessionKey = json.token;
        sessionStorage.setItem("sessionKey", sessionKey); //Save the sessionkey to sessionstorage so that it can be reused
    } catch (error) {
        console.error('Error fetching session key:', error);
    }
}

/* Gets the quiz based on parameters provided by default or by user. Also doublechecks everythign to make sure the request will work */
async function getQuiz() {
    try {
        let url = "https://opentdb.com/api.php?amount=" + amount;
        if (category !== 0) { // If category is "0", it does not need to be in url
            url += "&category=" + category;
        }
        if (difficulty !== "any") { // If difficulty is "any", it does not need to be in url
            url += "&difficulty=" + difficulty;
        }
        if (type !== "both") { // If type is "both", it does not need to be in url
            url += "&type=" + type;
        }
        url += "&token=" + sessionKey; // Adds the session key to the url

        let response = await fetch(url);
        let quizJson = await response.json();
        let responseCode = quizJson.response_code; //Gets the response code, which is between 0 and 5. (0 means it works)

        switch (responseCode) {
            case 1: //Code to say that the request didnt give any results
                alert("No results...");
                window.location.href = "./special.html";
                break;

            case 2: //Code to say that the arguments are incorrect. This should not be possible with all the checks :|
                alert("Invalid arguments! Please don't mess with me :<");
                window.location.href = "./special.html";
                break;

            case 3: //Code to say that the token used is not in the API database. This will remove the current sessionkey, and get a new one
                alert("Token not found, please click 'okay' and way about 4 seconds"); //Usually happens at the start of a new session.
                sessionStorage.removeItem("sessionKey");
                sessionKey = "none";
                await getSessionKey();
                setTimeout( () => {
                    window.location.reload();
                }, 2500)
                break;

            case 4: //Code that says that sessionkey is currently used up for the given arguments. Then resets the sessionkey
                alert("Quiz has been taken too many times. Resetting token...");
                await resetToken(sessionKey);
                break;

            case 5: //Code to say that there has been to many request within a short amount of time
                alert("Rate limit! Too many requests...");
                window.location.href = "./special.html";
                break;

            default: //Default will start the quiz itself, by setting a global variable to the json gotten from the API
                quizObj = await quizJson.results;
        }
    } catch (error) {
        console.error('Error fetching quiz:', error);
    }
}

/* Function to reset sessionkey, provided by the API */
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

const params = new URLSearchParams(window.location.search); //Gets the arguments from the user.
let sessionKey = sessionStorage.getItem("sessionKey") || "none"; //Gets the sessionkey if it exists
let amount = Number(params.get('amount')) || 10; //Sets amount to the amount parameter, and if it doesnt exist, sets amount to default
let category = Number(params.get('category')) || 0; // Same as with amount
let difficulty = params.get('difficulty') || "any"; // -||-
let type = params.get('type') || "both"; // -||-

if (sessionKey === "none") {
    getSessionKey(); //Sets sessionkey if it doesnt exist
}

if (amount < 5) { //Sets amount to 5 if it is less than 5
    amount = 5;
} else if (amount > 50) { // Sets amount to 50, the limit, if it is greater than 50
    amount = 50;
}

if (category < 9 && category !== 0) { //Sets category to 0 (any category) if it is under the category-limit  
    category = 0;
} else if (category > 32 && category !== 0) { //Sets category to 0 (any category) if it is over the category-limit
    category = 0;
}

if (difficulty !== "any" && difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
    difficulty = "any"; // Sets difficulty to "any" if it is not one of the difficulty options
}

if (type !== "both" && type !== "multiple" && type !== "boolean") { //Sets type to "both" if it is not one of the type options
    type = "both";
}

getQuiz(); //Gets the quiz


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


let quizNumber = 0; //Variable for current question

/* Function to run the quiz. */
function runQuiz() {
    if (quizNumber < amount) { //Do all this as long as the quiz is still on-going
        const q = decodeHtmlStupidity(quizObj[quizNumber].question); //Decodes any potential html encoding (ex: "&aring;" to "å"), and sets the question
        const type = quizObj[quizNumber].type; //Figures out the type
        const correctAnswer = decodeHtmlStupidity(quizObj[quizNumber].correct_answer); //Gets the correct answer after decoding
        let answers = []; //Sets an array for the other answers
        quizObj[quizNumber].incorrect_answers.forEach(element => {
            answers.push(decodeHtmlStupidity(element)); //Decodes the other answers, then adds them to the previously mentioned array
        });

        updateQuiz(type, q, correctAnswer, answers); //Runs a function to display everything

    } else { //Runs when the quiz is over
        let totallyNotUsedForErrorHandling = document.getElementById("quizErrorHandler"); // Gets a p element that is originally used for something else
        totallyNotUsedForErrorHandling.style.display = "block";
        multipleDiv.classList.add("hidden"); //Hides the two Q&A sections
        truFalDiv.classList.add("hidden");

        totallyNotUsedForErrorHandling.classList.add("finished"); //Adds some extra styling
        totallyNotUsedForErrorHandling.innerHTML = `The quiz has finished, your score was: <br> <b>${correctChoices}</b> of ${amount} possible points`
        /* ^ Displays the score the user got after finishing the quiz. Currently does not get saved anywhere afterwards. ^ */
    }
}

/* Function to decode the html formatted text */
function decodeHtmlStupidity(text) {
    let doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent;
}

/* Function to display all the info */
function updateQuiz(type, question, trueAnswer, answers) {
    if (type === "boolean") { //Checks which type of quiz it is, and displays the correct one accordingly
        multipleDiv.classList.add("hidden");
        truFalDiv.classList.remove("hidden");

        boolq.innerText = question;
        if (trueAnswer.toLowerCase() === "true") { //Gives a "value" to each button which will indicate which one is the correct one
            trueBtn.value = "true";
            falseBtn.value = "false";
        } else if (trueAnswer.toLowerCase() === "false") {
            falseBtn.value = "true";
            trueBtn.value = "false";
        }

    } else if (type === "multiple") { //This part is basically the same as the other one, but displays a bit more.
        multipleDiv.classList.remove("hidden");
        truFalDiv.classList.add("hidden");

        multiq.innerText = question;
        
        let buttonusAnswrs = answers;
        buttonusAnswrs.push(trueAnswer);

        buttonusArray = shuffleArray(buttonusAnswrs); // Runs a function to shuffle the answers

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
                alert("Something went wrong!") //Should never happen I believe, but good to have it anyway.
                break;
        }
        

    }

}

/* Function to shuffle the answers for the multiple-choice question */
function shuffleArray(array) { //This shuffle is called "Fisher–Yates shuffle"
    for (let i = array.length - 1; i > 0; i--) { //Shuffles the answers so that the "true" answer is not always at a fixed position.
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    /*
    Goes from the end to the start, selecting a random index from the available indexes,
    (everything that has not already been selected), 
    and exchaning the postions between the current index and the randomly selected index.
    */
    return array;
}

/* Tells the user that the quiz will load in about 2 seconds to make sure everythign else before this loads and works properly. */
document.getElementById("quizErrorHandler").innerText = "Quiz loading... Starting in about 2 seconds...";
setTimeout(() => {
    runQuiz();
    document.getElementById("quizErrorHandler").style.display = "none";
}, 2000);

/* Function to check if the answer the user chose was correct or not */
async function checkAnswr(htmlElem) {
    const val = htmlElem.value;
    if (val == "true") {
        correctChoices++;
        htmlElem.classList.add("thisWasTru"); //If true, shows that it was true to the user.
    }

    let buttons = Array.from(document.getElementsByTagName("button"))

    buttons.forEach((elementz)=>{
        elementz.disabled = true; // Disables all the buttons, which also gives them a red background.
    });



    // After about a second, the next question will be displayed.
    setTimeout(() => {
        buttons.forEach((elementz)=>{
            elementz.disabled = false;
        });
        htmlElem.classList.remove("thisWasTru");
        quizNumber++;
        runQuiz();
    }, 1000);
}