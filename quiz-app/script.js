

const quizSubjectsList = document.getElementById('quiz-subjects-list');
const quizContainer = document.getElementById('quiz-container');

const availableSubjects = [
    'HTML', 'CSS', 'Java Script'
]

loadAvailableSubjects()

function loadAvailableSubjects() {
    availableSubjects.forEach(subject => {
        const subjectOption = createSubjectElement(subject)
        quizSubjectsList.appendChild(subjectOption)

    })

}

function createSubjectElement(subject) {
    const subjectOption = document.createElement('div');
    subjectOption.textContent = subject;
    subjectOption.classList.add('quiz-subject-list-item')

    subjectOption.addEventListener("click" ,() => {
        quizSubjectsList.style.display = "none"
        quizContainer.style.display = 'flex'
        startQuiz(subject)
    })


    return subjectOption;
}


