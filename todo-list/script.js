
let tasks = [];
let pendingTasks = [];
let completedTasks = [];
const pendingTasksList = document.getElementById('pending-tasks');
const completedTasksList = document.getElementById('completed-tasks');

document.addEventListener('DOMContentLoaded', fetchTasks);

// Initialize drag-and-drop functionality for task lists
[pendingTasksList, completedTasksList].forEach(list => {
    list.addEventListener('dragover', (event) => {
        event.preventDefault();
        list.classList.add('dragover');
    })

    list.addEventListener('dragleave', () => {
        list.classList.remove('dragover')
    })

    list.addEventListener('drop', handleDrop)

})

function handleDrop(event) {
    event.preventDefault();
    const list = event.currentTarget
    list.classList.remove('dragover')

    const taskId = event.dataTransfer.getData('text/plain');
    const draggedTask = document.getElementById(taskId);
    const isCompleted = list.id === 'completed-tasks';

    const task = [...pendingTasks, ...completedTasks].find(t => t.createdAt == taskId)
    if (task) {
        updateTaskStatus(task, isCompleted)
        updateCheckboxState(draggedTask, isCompleted)
        updateTasksCount()
        list.appendChild(draggedTask);
    }
}

// Update the task's completion status
function updateTaskStatus(task, isCompleted) {
    task.isCompleted = isCompleted;
    if (task.isCompleted) {
        removeTaskFromPendingTasksList(task);
        addToCompletedTasks(task)
    } else {
        removeTaskFromCompletedTasksList(task)
        addToPendingTasks(task)
    }
}

// Update the checkbox state based on the new status
function updateCheckboxState(draggedTask, isCompleted) {
    const checkbox = draggedTask.querySelector('input[type="checkbox"]');
    if (checkbox) {
        checkbox.checked = isCompleted;
    }
}


function addTask(event) {
    event.preventDefault();

    const taskValue = getTaskInputValue()
    if (!isValidTask(taskValue)) {
        displayError('Please enter a task.', 'empty-task-input-error');
        return;
    }

    const newTask = createTaskObject(taskValue);
    addToPendingTasks(newTask)

    const newTaskElement = createTaskElement(newTask)
    pendingTasksList.appendChild(newTaskElement);

    clearTaskInput();
    removeError();
    updateTasksCount()
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
        updateTaskStatus(task, !task.isCompleted)
        changeStatus(task);
        taskElement.remove();
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
    const allTasks = [...pendingTasks, ...completedTasks]
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

function fetchTasks() {
    tasks = JSON.parse(localStorage.getItem('tasks'))
    if (tasks?.length > 0) {
        tasks?.forEach(task => {
            if (task.isCompleted) {
                // completedTasks.unshift(task)
                addToCompletedTasks(task)
            } else {
                // pendingTasks.unshift(task)
                addToPendingTasks(task)
            }
            changeStatus(task);
        })
    } else {
        updateTasksCount();
    }
}

function removeTask(task) {
    if (task.isCompleted) {
        removeTaskFromCompletedTasksList(task)
    } else {
        removeTaskFromPendingTasksList(task)
    }
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
    updateTaskCountDisplay('pending', pendingTasks?.length || 0);
    updateTaskCountDisplay('completed', completedTasks?.length || 0)

    toggleNoTasksMessage('pending', pendingTasks?.length || 0);
    toggleNoTasksMessage('completed', completedTasks?.length || 0)

}

function updateTaskCountDisplay(type, count) {
    const titleElement = document.getElementById(`${type}-title`);
    titleElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`;
    const sortElement = createSortElement(type)
    titleElement.appendChild(sortElement)
}

function toggleNoTasksMessage(type, count) {
    const noTasksDiv = document.getElementById(`no-${type}-tasks`)
    noTasksDiv.style.display = count === 0 ? 'block' : 'none';
}

// Create sort element for sorting tasks by creation date 
let sortOrderPendingAscend = true; // Track sorting order for pending tasks
let sortOrderCompletedAscend = true; // Track sorting order for completed tasks

function createSortElement(type) {
    const sortElement = document.createElement('span')
    sortElement.classList.add('material-symbols-outlined');
    sortElement.textContent = 'swap_vert';
    sortElement.style.cursor = 'pointer';

    sortElement.addEventListener("click", () => {
        if (type === 'pending') {
            pendingTasks.sort((a, b) => sortOrderPendingAscend ? a.createdAt - b.createdAt : b.createdAt - a.createdAt)
            sortOrderPendingAscend = !sortOrderPendingAscend
            updateDisplay(pendingTasksList, pendingTasks)

        }
        if (type === 'completed') {
            completedTasks.sort((a, b) => sortOrderCompletedAscend ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
            sortOrderCompletedAscend = !sortOrderCompletedAscend; // Flip order for next click
            updateDisplay(completedTasksList, completedTasks)
        }
    })

    return sortElement
}

function updateDisplay(list, tasksArray) {
    list.innerHTML = '';

    tasksArray.forEach(task => {
        const newTaskElement = createTaskElement(task);
        list.appendChild(newTaskElement);
    });
}

function addToPendingTasks(task) {
    pendingTasks.push(task);

    pendingTasks.sort((a, b) => b.createdAt - a.createdAt)
    saveTasks()

}

function removeTaskFromPendingTasksList(task) {
    pendingTasks = pendingTasks.filter(t => t.createdAt !== task.createdAt)
    saveTasks()
}

function addToCompletedTasks(task) {

    completedTasks.push(task);

    completedTasks.sort((a, b) => b.createdAt - a.createdAt)
    saveTasks()

}

function removeTaskFromCompletedTasksList(task) {
    completedTasks = completedTasks.filter(t => t.createdAt !== task.createdAt)
    saveTasks()
}