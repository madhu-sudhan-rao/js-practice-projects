
let tasks = [];
const pendingTasksList = document.getElementById('pending-tasks');
const completedTasksList = document.getElementById('completed-tasks');

document.addEventListener('DOMContentLoaded', fetchTasks);

[pendingTasksList, completedTasksList].forEach(list => {
    list.addEventListener('dragover', (event) => {
        event.preventDefault();
        list.classList.add('dragover');
    })

    list.addEventListener('dragleave', () => {
        list.classList.remove('dragover')
    })

    list.addEventListener('drop', (event) => {
        event.preventDefault();
        list.classList.remove('dragover')

        const taskId = event.dataTransfer.getData('text/plain');
        const draggedTask = document.getElementById(taskId);

        // Determine if it's being dropped in completed or pending
        const isCompleted = list.id === 'completed-tasks';

        const task = tasks.find(t => t.createdAt == taskId)
        if(task) {
            // Update the task's completion status
            task.isCompleted = isCompleted;
            saveTasks()

            // Update the checkbox state based on the new status
            const checkbox = draggedTask.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = isCompleted
            }

            updateTasksCount()
        }

        list.appendChild(draggedTask);
    })
    
})


function addTask(event) {
    event.preventDefault();

    const taskValue = getTaskInputValue()
    if (!isValidTask(taskValue)) {
        displayError('Please enter a task.', 'empty-task-input-error');
        return;
    }

    const newTask = createTaskObject(taskValue);
    tasks.push(newTask);

    const newTaskElement = createTaskElement(newTask)
    pendingTasksList.appendChild(newTaskElement);
  
    updateTasksCount()
    clearTaskInput();
    removeError();
    saveTasks();
}

function isValidTask(taskValue) {
    return taskValue.trim().length > 0;
}

function createTaskObject(taskValue) {
    return {
        value: taskValue,
        createdAt: Date.now(),
        isCompleted: false
    }

}

function clearTaskInput() {
    document.getElementById('new-task-input').value = '';
}

function getTaskInputValue() {
    const taskInput = document.getElementById('new-task-input');
    return taskInput.value.trim() || '';
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.id = task?.createdAt // Set ID for drag-and-drop
    taskElement.draggable = true;

    const taskCardLeftDiv = document.createElement('div');
    taskCardLeftDiv.classList.add('task-card-left-box')

    const taskDetailsDiv = document.createElement('div');
    taskDetailsDiv.classList.add('task-details')

    const taskCheckboxDiv = document.createElement('div')
    taskCheckboxDiv.classList.add('task-checkbox-input')
    
    const taskCheckbox = document.createElement('input')
    taskCheckbox.type = 'checkbox';
    taskCheckbox.checked = task.isCompleted

    taskCheckbox.addEventListener("change", () => {
        task.isCompleted = !task?.isCompleted;
        saveTasks();
        changeStatus(task);
        taskElement.remove();
        updateTasksCount();
    });

    taskCheckboxDiv.appendChild(taskCheckbox)

    const taskValueDiv = document.createElement('div');
    taskValueDiv.classList.add('task-text')
    taskValueDiv.textContent = task.value;

    const createdAtDiv = document.createElement('div');
    createdAtDiv.classList.add('created-at')
    createdAtDiv.textContent = new Date(task.createdAt).toLocaleString();

    taskCardLeftDiv.appendChild(taskCheckboxDiv)
    taskDetailsDiv.appendChild(taskValueDiv);
    taskDetailsDiv.appendChild(createdAtDiv);
    taskCardLeftDiv.appendChild(taskDetailsDiv)

    const deleteButton = createDeleteButton(taskElement, task)

    taskElement.appendChild(taskCardLeftDiv);
    taskElement.appendChild(deleteButton);

    taskElement.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", event.target.id)
    });



    // deleteButton.addEventListener('click', () => {
    //     taskElement.remove();
    // });

    return taskElement
}

function createDeleteButton(taskElement, task) {
    const button = document.createElement('button')
    button.classList.add('delete-button')
    button.textContent = 'Delete'

    button.addEventListener('click', () => {
        taskElement.remove()
        removeTask(task)
    })

    return button
}

function displayError(message, className) {
    if (document.querySelector('.empty-task-input-error')) {
        return;
    }

    const errorMessage = document.createElement('div');
    errorMessage.classList.add(className || 'error');
    errorMessage.textContent = message;

    const tasksList = document.getElementById('tasks');
    tasksList.appendChild(errorMessage);
}

function removeError() {
    const errorElement = document.querySelector('.empty-task-input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

function fetchTasks() {
    tasks = JSON.parse(localStorage.getItem('tasks'))
    if (tasks?.length > 0) {
        tasks?.forEach(task => {
            changeStatus(task);
        })
    }
}

function removeTask(task) {
    tasks = tasks.filter(t => t.createdAt !== task.createdAt);
    saveTasks();
    updateTasksCount();
}

function changeStatus(task) {
    const newTaskElement = createTaskElement(task);
    if (task?.isCompleted) {
        completedTasksList.appendChild(newTaskElement)
    } else {
        pendingTasksList.appendChild(newTaskElement)
    }
    updateTasksCount();
}

function updateTasksCount() {
    let pendingTasksCount = 0;
    let completedTasksCount = 0;
    tasks.forEach(task => {
        task.isCompleted ? completedTasksCount++ : pendingTasksCount++;
    })

    updateTaskCountDisplay('pending', pendingTasksCount);
    updateTaskCountDisplay('completed', completedTasksCount)

    toggleNoTasksMessage('pending', pendingTasksCount);
    toggleNoTasksMessage('completed', completedTasksCount)

}

function updateTaskCountDisplay(type, count) {
    const titleElement = document.getElementById(`${type}-title`);
    titleElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`;
}

function toggleNoTasksMessage(type, count) {
    const noTasksDiv = document.getElementById(`no-${type}-tasks`)
    noTasksDiv.style.display = count === 0 ? 'block' : 'none';
}
