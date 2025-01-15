
// let tasks = [];f
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
    console.log('list: ', list);
    list.classList.remove('dragover')
    console.log('list: ', list);

    const taskId = event.dataTransfer.getData('text/plain');
    const draggedTask = document.getElementById(taskId);
    const isCompleted = list.id === 'completed-tasks';

    const task = [...pendingTasks, ...completedTasks].find(t => t.createdAt == taskId);
    console.log('task: ', task);

    if (task) {
        // updateTaskStatus(task, isCompleted)
        if(task.isCompleted) {
            pendingTasks.push({...task, isCompleted: false})
            completedTasks = completedTasks.filter(t => t.createdAt !== task.createdAt)
            saveTasks()
            console.log('completedTasks: ', completedTasks);
        } else {
            completedTasks.push({...task, isCompleted: true});
            pendingTasks = pendingTasks.filter(t => t.createdAt !== task.createdAt)
            saveTasks()
        }
        task.isCompleted = !task.isCompleted

        
        updateCheckboxState(draggedTask, task.isCompleted)
        updateTasksCount()
        // list.appendChild(draggedTask);
        task.isCompleted ? completedTasksList.append(draggedTask) : pendingTasksList.append(draggedTask)
        updateTasksCount()
        console.table('Pending List', pendingTasks);
        console.table('Completed List', completedTasks);

        

    }
}

// Update the task's completion status
function updateTaskStatus(task, isCompleted) {
    console.log('task: ', task);
    // task.isCompleted = isCompleted;
    if (task.isCompleted) {
        task.isCompleted = !task.isCompleted
        console.log('task: ', task);
        addToPendingTasks(task)
        removeTaskFromCompletedTasksList(task);
        
    } else {
        console.log('task: ', task);
        task.isCompleted = !task.isCompleted
        addToCompletedTasks(task)
        removeTaskFromPendingTasksList(task)
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
    updateTasksCount()
}

function fetchTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks'))
    console.log('tasks: ', tasks);
    if (tasks?.length > 0) {
        tasks?.forEach(task => {
            if (task.isCompleted) {
                addToCompletedTasks(task)
            } else {
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
    updateTaskCountDisplay('pending', pendingTasks.length);
    updateTaskCountDisplay('completed', completedTasks.length)

    toggleNoTasksMessage('pending', pendingTasks.length);
    toggleNoTasksMessage('completed', completedTasks.length)

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
            pendingTasks = pendingTasks.sort((a, b) => sortOrderPendingAscend ? a.createdAt - b.createdAt : b.createdAt - a.createdAt)
            sortOrderPendingAscend = !sortOrderPendingAscend
            // saveTasks()
            // fetchTasks()

            updateDisplay(type, pendingTasksList, pendingTasks)


        }
        if (type === 'completed') {
            completedTasks = completedTasks.sort((a, b) => sortOrderCompletedAscend ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
            sortOrderCompletedAscend = !sortOrderCompletedAscend; // Flip order for next click
            // saveTasks()
            // fetchTasks()
            updateDisplay(type, completedTasksList, completedTasks)
        }
    })



    return sortElement
}

function createNoPendingTasksDiv(type) {
    const element = document.createElement('div')
    element.classList.add('task', 'no-tasks-text'); // Add each class separately
    element.id = `no-${type}-tasks`;
    element.textContent = type === 'pending' ? 'No tasks to do.' : 'Great! You have completed all tasks.'

    return element
    
}

function updateDisplay(type,list, tasksArray) {
    list.innerHTML = '';
    console.log('list: ', list);

    const noTasksElement = createNoPendingTasksDiv(type);
    
    list.appendChild(noTasksElement)
    tasksArray.forEach(task => {
        const newTaskElement = createTaskElement(task);
        list.appendChild(newTaskElement);
    });

    updateTasksCount()


    // fetchTasks()
    
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
}

function addToPendingTasks(task) {
    let alreadyExists = false;
    pendingTasks.forEach(t => {
        if (t.value === task.value) {
            alreadyExists = true
        }
    })

    if (!alreadyExists) {
        pendingTasks.push(task);
        console.log('pendingTasks Length: ', pendingTasks.length);
        updateTaskCountDisplay('pending', pendingTasks.length);
        // completedTasks.sort((a, b) => b.createdAt - a.createdAt)
        saveTasks()
    }

}

function removeTaskFromPendingTasksList(task) {
    pendingTasks = pendingTasks.filter(t => t.createdAt !== task.createdAt)
    saveTasks()
}

function addToCompletedTasks(task) {

    let alreadyExists = false;
    completedTasks.forEach(t => {
        if (t.createdAt === task.createdAt) {
            alreadyExists = true
        }
    })

    if (!alreadyExists) {


        completedTasks.push(task);
        console.log('completedTasks: ', completedTasks);

        // completedTasks.sort((a, b) => b.createdAt - a.createdAt)
        saveTasks()
    }

}

function removeTaskFromCompletedTasksList(task) {
    completedTasks = completedTasks.filter(t => t.createdAt !== task.createdAt)
    console.log('completedTasks: ', completedTasks);
    saveTasks()
}