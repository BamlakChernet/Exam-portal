const getQuizSettings = () => {
    const settings = JSON.parse(localStorage.getItem("teacherSettings")) || 
                    JSON.parse(localStorage.getItem("quizSettings")) || 
                    {defaultTime: 10};
    return settings;
};

const settings = getQuizSettings();
let timer = settings.defaultTime * 60;

const timeBox = document.getElementById("timer");
if (timeBox) {
    const timerInterval = setInterval(() => {
        if (timer <= 0) {
            clearInterval(timerInterval);
            if (typeof gradeQuiz === "function") gradeQuiz();
            return;
        }

        timer--;
        const min = Math.floor(timer / 60);
        const sec = timer % 60;
        timeBox.textContent = `Time: ${min}:${sec.toString().padStart(2, "0")}`;
    }, 1000);
}
