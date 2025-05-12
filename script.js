document.addEventListener('DOMContentLoaded', function() {
    // 获取当前日期并设置
    setCurrentDate();
    
    // 添加时间单元格的点击事件
    setupTimeSlots();
    
    // 添加任务输入功能
    setupTaskInputs();
    
    // 添加本地存储功能
    loadFromLocalStorage();
    
    // 添加任务完成状态切换
    setupCheckboxes();
});

// 设置当前日期
function setCurrentDate() {
    const now = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const today = weekdays[now.getDay()];
    
    // 高亮当前星期
    const weekdayElements = document.querySelectorAll('.weekdays span');
    weekdayElements.forEach(element => {
        if (element.textContent === today) {
            element.style.fontWeight = 'bold';
            element.style.color = '#e8a87c';
        }
    });
}

// 设置时间单元格的点击事件
function setupTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-cell');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            this.classList.toggle('selected');
            if (this.classList.contains('selected')) {
                this.style.backgroundColor = '#e8a87c';
                this.style.color = 'white';
            } else {
                this.style.backgroundColor = '';
                this.style.color = '';
            }
            saveToLocalStorage();
        });
    });
}

// 设置任务输入功能
function setupTaskInputs() {
    // 为每个任务描述添加可编辑功能
    const taskDescriptions = document.querySelectorAll('.task-description');
    taskDescriptions.forEach(desc => {
        desc.contentEditable = true;
        desc.addEventListener('blur', saveToLocalStorage);
        desc.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    // 为每个时间和预计用时添加可编辑功能
    const taskTimes = document.querySelectorAll('.task-time, .task-duration');
    taskTimes.forEach(time => {
        time.contentEditable = true;
        time.addEventListener('blur', saveToLocalStorage);
        time.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    // 为总预算和分配时间添加可编辑功能
    const hoursInputs = document.querySelectorAll('.summary-hours, .hours-input');
    hoursInputs.forEach(input => {
        input.contentEditable = true;
        input.addEventListener('blur', saveToLocalStorage);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    // 为任务部分的标题添加可编辑功能
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.contentEditable = true;
        title.addEventListener('blur', saveToLocalStorage);
        title.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

// 设置复选框事件
function setupCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (this.checked) {
                taskItem.style.opacity = '0.6';
                taskItem.querySelector('.task-description').style.textDecoration = 'line-through';
            } else {
                taskItem.style.opacity = '1';
                taskItem.querySelector('.task-description').style.textDecoration = 'none';
            }
            saveToLocalStorage();
        });
    });
}

// 保存到本地存储
function saveToLocalStorage() {
    const data = {
        timeSlots: [],
        tasks: [],
        budgets: {},
        sectionTitles: {}
    };
    
    // 保存选中的时间单元格
    const selectedTimeSlots = document.querySelectorAll('.time-cell.selected');
    selectedTimeSlots.forEach(slot => {
        const index = Array.from(document.querySelectorAll('.time-cell')).indexOf(slot);
        data.timeSlots.push(index);
    });
    
    // 保存任务内容
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        data.tasks.push({
            description: item.querySelector('.task-description').textContent,
            time: item.querySelector('.task-time').textContent,
            duration: item.querySelector('.task-duration').textContent,
            completed: item.querySelector('input[type="checkbox"]').checked
        });
    });
    
    // 保存预算时间
    data.budgets.total = document.querySelector('.summary-hours').textContent;
    const allocationItems = document.querySelectorAll('.allocation-item');
    data.budgets.allocations = [];
    allocationItems.forEach(item => {
        data.budgets.allocations.push({
            type: item.querySelector('span:nth-child(2)').textContent,
            hours: item.querySelector('.hours-input').textContent
        });
    });
    
    // 保存任务部分的标题
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, index) => {
        data.sectionTitles[index] = title.textContent;
    });
    
    localStorage.setItem('todayTodoData', JSON.stringify(data));
}

// 从本地存储加载
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('todayTodoData');
    if (!savedData) return;
    
    const data = JSON.parse(savedData);
    
    // 恢复选中的时间单元格
    const timeSlots = document.querySelectorAll('.time-cell');
    data.timeSlots.forEach(index => {
        if (index < timeSlots.length) {
            timeSlots[index].classList.add('selected');
            timeSlots[index].style.backgroundColor = '#e8a87c';
            timeSlots[index].style.color = 'white';
        }
    });
    
    // 恢复任务内容
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach((item, index) => {
        if (data.tasks[index]) {
            item.querySelector('.task-description').textContent = data.tasks[index].description;
            item.querySelector('.task-time').textContent = data.tasks[index].time;
            item.querySelector('.task-duration').textContent = data.tasks[index].duration;
            
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = data.tasks[index].completed;
            
            if (checkbox.checked) {
                item.style.opacity = '0.6';
                item.querySelector('.task-description').style.textDecoration = 'line-through';
            }
        }
    });
    
    // 恢复预算时间
    if (data.budgets.total) {
        document.querySelector('.summary-hours').textContent = data.budgets.total;
    }
    
    if (data.budgets.allocations) {
        const allocationItems = document.querySelectorAll('.allocation-item');
        data.budgets.allocations.forEach((allocation, index) => {
            if (index < allocationItems.length) {
                allocationItems[index].querySelector('.hours-input').textContent = allocation.hours;
            }
        });
    }
    
    // 恢复任务部分的标题
    if (data.sectionTitles) {
        const sectionTitles = document.querySelectorAll('.section-title');
        Object.keys(data.sectionTitles).forEach(index => {
            if (index < sectionTitles.length) {
                sectionTitles[index].textContent = data.sectionTitles[index];
            }
        });
    }
}

// 添加其他任务功能
document.addEventListener('DOMContentLoaded', function() {
    const otherTasksSection = document.querySelector('.other-tasks');
    
    // 创建添加按钮
    const addButton = document.createElement('button');
    addButton.textContent = '+ 添加任务';
    addButton.className = 'add-task-btn';
    addButton.style.padding = '5px 10px';
    addButton.style.backgroundColor = '#f9f3e9';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '5px';
    addButton.style.color = '#8c6e58';
    addButton.style.cursor = 'pointer';
    addButton.style.marginTop = '10px';
    
    otherTasksSection.appendChild(addButton);
    
    // 添加新任务的功能
    addButton.addEventListener('click', function() {
        const newTaskItem = document.createElement('div');
        newTaskItem.className = 'task-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                newTaskItem.style.opacity = '0.6';
                taskDescription.style.textDecoration = 'line-through';
            } else {
                newTaskItem.style.opacity = '1';
                taskDescription.style.textDecoration = 'none';
            }
            saveToLocalStorage();
        });
        
        const taskDetail = document.createElement('div');
        taskDetail.className = 'task-detail';
        
        const taskDescription = document.createElement('div');
        taskDescription.className = 'task-description';
        taskDescription.textContent = '新任务';
        taskDescription.contentEditable = true;
        taskDescription.addEventListener('blur', saveToLocalStorage);
        taskDescription.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
        taskDescription.addEventListener('focus', function() {
            if (this.textContent === '新任务') {
                this.textContent = '';
            }
        });
        
        const taskTime = document.createElement('div');
        taskTime.className = 'task-time';
        taskTime.textContent = '时间';
        taskTime.contentEditable = true;
        taskTime.addEventListener('blur', saveToLocalStorage);
        taskTime.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
        
        const taskDuration = document.createElement('div');
        taskDuration.className = 'task-duration';
        taskDuration.textContent = '预计用时';
        taskDuration.contentEditable = true;
        taskDuration.addEventListener('blur', saveToLocalStorage);
        taskDuration.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
        
        taskDetail.appendChild(taskDescription);
        taskDetail.appendChild(taskTime);
        taskDetail.appendChild(taskDuration);
        
        newTaskItem.appendChild(checkbox);
        newTaskItem.appendChild(taskDetail);
        
        // 添加删除按钮
        const deleteBtn = document.createElement('span');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.className = 'delete-task';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.color = '#e8a87c';
        deleteBtn.style.fontWeight = 'bold';
        deleteBtn.style.fontSize = '18px';
        
        deleteBtn.addEventListener('click', function() {
            newTaskItem.remove();
            saveToLocalStorage();
        });
        
        newTaskItem.appendChild(deleteBtn);
        
        otherTasksSection.insertBefore(newTaskItem, addButton);
        
        // 让新添加的任务描述获得焦点
        taskDescription.focus();
    });
});
