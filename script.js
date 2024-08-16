document.addEventListener('DOMContentLoaded', () => {
    // 日期
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = formattedDate;

    // 預設任務
    const defaultTasks = {
        morning: ['⏰ Get up early', '🧘‍♀️ Stretch', '🛏️ Arrange the bed', '💧 Hydrate', '🗃️ Organize the desk', '🥪 Breakfast', '🍵 Morning drinks', '🦷 Brush teeth', '👖 Change clothes', '🎒 Pack things', '🛴 Leave!'],
        night: ['🚿 Shower', '🦷 Brush teeth', '🧴 Skin care', '💻 Schoolworks', '📕 Read', '💧 Hydrate','👀 Ortho-K', '📱 Chill', '😴 Sleeeeeep'],
        else: []
    };

    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    
    let tabs = {
        morning: [],
        night: [],
        else: []
    };
    let completedTabs = {
        morning: [],
        night: [],
        else: []
    };
    
    let currentTab;
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    // 定义时间段
    const morningStart = 2 * 60; // 02:00 AM
    const morningEnd = 9 * 60 + 30; // 09:30 AM
    const nightStart = 21 * 60; // 09:00 PM
    const nightEnd = 2 * 60; // 02:00 AM

    // 当前时间转换为分钟数
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    // 判断当前时间所在的时间段
    if (currentTimeInMinutes >= morningStart && currentTimeInMinutes <= morningEnd) {
        currentTab = 'morning';
    } else if (currentTimeInMinutes >= nightStart || currentTimeInMinutes <= nightEnd) {
        currentTab = 'night';
    } else {
        currentTab = 'else';
    }
    document.getElementById(`${currentTab}-tab`).classList.add('active');


    // 切換時間段的按鈕
    document.getElementById('morning-tab').addEventListener('click', () => switchTab('morning'));
    document.getElementById('night-tab').addEventListener('click', () => switchTab('night'));
    document.getElementById('else-tab').addEventListener('click', () => switchTab('else'));

    // 清除按鈕
    document.getElementById('clear-tasks').addEventListener('click', clearAllTasks);

    // 新增任務
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText, currentTab);
            saveTasks();
            taskInput.value = '';
        }
    });

    // 加載任務
    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks'));

        if (savedTasks) {
            tabs.morning = savedTasks.morning || defaultTasks.morning.slice();
            tabs.night = savedTasks.night || defaultTasks.night.slice();
            tabs.else = savedTasks.else || defaultTasks.else.slice();
            completedTabs = savedTasks.completed || { morning: [], night: [], else: [] };
        } else {
            tabs.morning = defaultTasks.morning.slice();
            tabs.night = defaultTasks.night.slice();
            tabs.else = defaultTasks.else.slice();
        }

        displayTasks();
        displayCompletedTasks();
    }

    // 顯示當前tab的任務
    function displayTasks() {
        taskList.innerHTML = '';
        
        if (!Array.isArray(tabs[currentTab])) {
            console.error(`Error: tabs[${currentTab}] is not an array`, tabs[currentTab]);
            return;
        }
        
        tabs[currentTab].forEach((task, index) => {
            const taskItem = createTaskItem(task, index);
            taskList.appendChild(taskItem);
        });
        addDragAndDrop();
    }

    // 顯示當前完成的tab任務
    function displayCompletedTasks() {
        completedTaskList.innerHTML = '';
        
        if (!Array.isArray(completedTabs[currentTab])) {
            console.error(`Error: completedTabs[${currentTab}] is not an array`, completedTabs[currentTab]);
            return;
        }
        
        completedTabs[currentTab].forEach(task => {
            const completedTaskItem = createCompletedTaskItem(task);
            completedTaskList.appendChild(completedTaskItem);
        });
    }

    // 創建任務項目
    function createTaskItem(task, index) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="drag-handle">☰</span>
            <span>${task}</span>
            <button class="complete-task"></button>
        `;
        li.querySelector('.complete-task').addEventListener('click', () => completeTask(index));
        return li;
    }

    // 完成任務
    function completeTask(index) {
        const completedTask = tabs[currentTab].splice(index, 1)[0];
        completedTabs[currentTab].push(completedTask);
        saveTasks();
        displayTasks();
        displayCompletedTasks();
    }

    // 創建完成的任務項目
    function createCompletedTaskItem(task) {
        const li = document.createElement('li');
        li.textContent = task;
        return li;
    }

    // 切換時間段
    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('nav button').forEach(button => button.classList.remove('active'));
        document.getElementById(`${currentTab}-tab`).classList.add('active');
        displayTasks();
        displayCompletedTasks(); // 確保完成任務也會顯示
    }

    // 保存任務
    function saveTasks() {
        const tasks = {
            morning: tabs.morning,
            night: tabs.night,
            else: tabs.else,
            completed: completedTabs
        };
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // 添加任務
    function addTask(taskText, tab) {
        tabs[tab].push(taskText);
        displayTasks();
    }

    // 拖動功能
    function addDragAndDrop() {
        new Sortable(taskList, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: (event) => {
                const [movedTask] = tabs[currentTab].splice(event.oldIndex, 1);
                tabs[currentTab].splice(event.newIndex, 0, movedTask);
                saveTasks();
            }
        });
    }

    // 清除所有非預設任務
    function clearAllTasks() {
        completedTabs[currentTab] = []; // 清除完成的任務
        tabs[currentTab] = defaultTasks[currentTab].slice(); // 重置為預設任務
        saveTasks();
        displayTasks();
        displayCompletedTasks();
    }

    // 初次加載任務
    loadTasks(); // 加載任務
});
