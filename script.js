document.addEventListener('DOMContentLoaded', function() {
    // 获取当前日期并设置
    setCurrentDate();
    
    // 添加时间单元格的点击事件
    setupTimeSlots();
    
    // 添加任务输入功能
    setupTaskInputs();
    
    // 添加预算时间分配功能
    setupAllocationGroups();
    
    // 设置日期功能
    setupDateFeatures();
    
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
    
    // 默认选中8-12点和14-18点
    timeSlots.forEach((slot, index) => {
        // 索引从0开始，第0个是6点，第2个是8点，以此类推
        // 8-12点对应索引为2-6，14-18点对应索引为8-12
        if ((index >= 2 && index <= 6) || (index >= 8 && index <= 12)) {
            slot.classList.add('selected');
            slot.style.backgroundColor = '#e8a87c';
            slot.style.color = 'white';
        }
        
        slot.addEventListener('click', function() {
            this.classList.toggle('selected');
            if (this.classList.contains('selected')) {
                this.style.backgroundColor = '#e8a87c';
                this.style.color = 'white';
            } else {
                this.style.backgroundColor = '';
                this.style.color = '';
            }
            updateTotalBudget();
            saveToLocalStorage();
        });
    });
    
    // 初始化时更新总预算
    updateTotalBudget();
}

// 更新时间总预算
function updateTotalBudget() {
    const selectedTimeSlots = document.querySelectorAll('.time-cell.selected');
    let totalHours = selectedTimeSlots.length;
    
    // 如果没有选中的时间单元格，默认显示10小时
    if (totalHours === 0) {
        totalHours = 10;
    }
    
    const summaryHours = document.querySelector('.summary-hours');
    summaryHours.textContent = totalHours + ' 小时';
}

// 设置预算时间分配功能
function setupAllocationGroups() {
    const allocationGroups = document.querySelectorAll('.allocation-group');
    const totalBudgetHours = parseInt(document.querySelector('.summary-hours').textContent) || 0;
    
    // 默认分配时间
    if (totalBudgetHours > 0) {
        const personalHours = Math.round(totalBudgetHours * 0.3); // 个人时间占30%
        const workHours = Math.round(totalBudgetHours * 0.5);    // 工作时间占50%
        const familyHours = totalBudgetHours - personalHours - workHours; // 剩余时间给家人/朋友
        
        updateAllocationHours('personal', personalHours);
        updateAllocationHours('work', workHours);
        updateAllocationHours('family', familyHours);
    }
    
    // 添加点击事件
    allocationGroups.forEach(group => {
        group.addEventListener('click', function() {
            this.classList.toggle('selected');
            saveToLocalStorage();
        });
    });
}

// 更新分配时间显示
function updateAllocationHours(type, hours) {
    const group = document.querySelector(`.allocation-group[data-type="${type}"]`);
    if (group) {
        const hoursInput = group.querySelector('.hours-input');
        if (hoursInput) {
            hoursInput.textContent = hours + ' 小时';
        }
    }
}

// 设置日期功能
function setupDateFeatures() {
    // 获取当前日期并格式化
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // 设置日期选择器的默认值
    const dateSelector = document.getElementById('dateSelector');
    const dateLabel = document.querySelector('.date-label');
    
    if (dateSelector) {
        dateSelector.value = formattedDate;
        
        // 设置日期显示文本
        const dateDisplay = document.querySelector('.date-display');
        if (dateDisplay) {
            const displayDate = formatDateForDisplay(formattedDate);
            dateDisplay.textContent = displayDate;
        }
        
        // 添加日期选择器的变化事件
        dateSelector.addEventListener('change', function() {
            const selectedDate = this.value;
            
            // 更新日期显示文本
            const dateDisplay = document.querySelector('.date-display');
            if (dateDisplay) {
                const displayDate = formatDateForDisplay(selectedDate);
                dateDisplay.textContent = displayDate;
            }
            
            // 当日期变化时加载对应的数据
            loadDataForDate(selectedDate);
        });
    }
}

// 格式化日期为显示格式
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 使用更简洁的日期格式
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

// 加载指定日期的数据
function loadDataForDate(date) {
    console.log('加载日期数据:', date);
    
    // 添加过渡动画效果
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('date-changing');
        
        // 延迟移除动画类
        setTimeout(() => {
            container.classList.remove('date-changing');
        }, 500);
    }
    
    // 如果是切换到新日期，先保存当前日期的数据
    if (currentDate && currentDate !== date) {
        console.log('保存当前日期数据并切换到新日期:', currentDate, '->', date);
        // 保存当前日期数据
        saveToLocalStorage(currentDate);
        
        // 强制清除当前数据（包括全局缓存）
        clearCurrentData();
        currentDateData = null;
        
        // 更新日期选择器并添加视觉反馈
        const dateSelector = document.getElementById('dateSelector');
        if (dateSelector) {
            dateSelector.value = date;
            
            // 添加高亮效果
            const dateWrapper = document.querySelector('.date-wrapper');
            if (dateWrapper) {
                dateWrapper.classList.add('date-changed');
                
                // 短暂后移除高亮效果
                setTimeout(() => {
                    dateWrapper.classList.remove('date-changed');
                }, 800);
            }
        }
        
        // 更新全局当前日期
        currentDate = date;
    } else if (!currentDate) {
        // 首次加载，设置当前日期
        currentDate = date;
    }
    
    // 不使用缓存，每次都从本地存储重新加载数据
    // 强制清除当前数据
    clearCurrentData();
    
    // 已经清除过了，不需要重复清除
    
    // 尝试从本地存储加载指定日期的数据
    try {
        const savedData = localStorage.getItem('todayTodoData_' + date);
        console.log('从本地存储加载数据:', savedData ? '有数据' : '无数据');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            // 更新全局缓存
            currentDateData = data;
            // 加载数据到页面
            loadDataFromObject(data);
        } else {
            // 如果没有数据，初始化默认值
            setupTimeSlots();
            setupAllocationGroups();
            // 创建并缓存默认数据
            currentDateData = collectPageData();
        }
    } catch (e) {
        console.error('加载数据错误:', e);
        // 如果加载出错，初始化默认值
        setupTimeSlots();
        setupAllocationGroups();
        // 创建并缓存默认数据
        currentDateData = collectPageData();
    }
}

// 清除当前的数据
function clearCurrentData() {
    console.log('开始彻底清除当前数据');
    
    // 清除时间选择
    const timeSlots = document.querySelectorAll('.time-cell');
    timeSlots.forEach(slot => {
        slot.classList.remove('selected');
        slot.style.backgroundColor = '';
        slot.style.color = '';
    });
    
    // 彻底清除所有任务列表
    const taskCategories = ['important', 'medium', 'small', 'other'];
    
    taskCategories.forEach(category => {
        const taskList = document.getElementById(category + '-tasks');
        if (taskList) {
            // 完全清空列表
            while (taskList.firstChild) {
                taskList.removeChild(taskList.firstChild);
            }
            
            // 添加空提示
            const emptyHint = document.createElement('div');
            emptyHint.className = 'empty-task-hint';
            emptyHint.textContent = '点击右上角的添加按钮添加任务';
            taskList.appendChild(emptyHint);
            
            console.log('清除任务列表:', category);
        }
    });
    
    // 重置时间分配
    const allocationGroups = document.querySelectorAll('.allocation-group');
    allocationGroups.forEach(group => {
        group.classList.remove('selected');
        const hoursInput = group.querySelector('.hours-input');
        if (hoursInput) {
            hoursInput.textContent = '0小时';
        }
    });
    
    // 重置总时间
    const summaryHours = document.querySelector('.summary-hours');
    if (summaryHours) {
        summaryHours.textContent = '0小时';
    }
    
    console.log('数据清除完成');
}
// 从数据对象加载数据
function loadDataFromObject(data) {
    console.log('开始从数据对象加载数据');
    
    // 恢复选中的时间单元格
    if (data.timeSlots && data.timeSlots.length > 0) {
        const timeSlots = document.querySelectorAll('.time-cell');
        data.timeSlots.forEach(index => {
            if (index < timeSlots.length) {
                timeSlots[index].classList.add('selected');
                timeSlots[index].style.backgroundColor = '#e8a87c';
                timeSlots[index].style.color = 'white';
            }
        });
        // 更新时间总预算
        updateTotalBudget();
    }
    
    // 恢复预算时间
    if (data.budgets && data.budgets.total) {
        const summaryHours = document.querySelector('.summary-hours');
        if (summaryHours) {
            summaryHours.textContent = data.budgets.total;
        }
    }
    
    // 恢复时间分配
    if (data.budgets && data.budgets.allocations) {
        data.budgets.allocations.forEach((allocation) => {
            const group = document.querySelector(`.allocation-group[data-type="${allocation.type}"]`);
            if (group) {
                const hoursInput = group.querySelector('.hours-input');
                if (hoursInput) {
                    hoursInput.textContent = allocation.hours;
                }
                
                if (allocation.selected) {
                    group.classList.add('selected');
                }
            }
        });
    }
    
    // 恢复任务内容
    if (data.tasks && data.tasks.length > 0) {
        console.log('开始恢复任务内容，总数:', data.tasks.length);
        
        // 先清除所有任务列表
        const taskLists = {
            'important': document.getElementById('important-tasks'),
            'medium': document.getElementById('medium-tasks'),
            'small': document.getElementById('small-tasks'),
            'other': document.getElementById('other-tasks')
        };
        
        // 清除所有任务列表
        Object.values(taskLists).forEach(list => {
            if (list) list.innerHTML = '';
        });
        
        // 创建任务分类对象
        const tasksBySection = {
            'important': [],
            'medium': [],
            'small': [],
            'other': []
        };
        
        // 先将任务分类
        data.tasks.forEach((task, index) => {
            // 简单分配任务到不同类别
            const taskCount = data.tasks.length;
            let section;
            
            if (task.section) {
                // 如果任务有指定的类别，使用指定的类别
                section = task.section;
            } else if (index < taskCount * 0.25) {
                section = 'important';
            } else if (index < taskCount * 0.5) {
                section = 'medium';
            } else if (index < taskCount * 0.75) {
                section = 'small';
            } else {
                section = 'other';
            }
            
            // 确保类别有效
            if (!tasksBySection[section]) section = 'other';
            
            // 将任务添加到对应类别
            tasksBySection[section].push({
                ...task,
                section: section,  // 保存类别信息以便于下次加载
                index: index       // 保存原始索引
            });
        });
        
        // 遍历每个类别并创建任务元素
        Object.entries(tasksBySection).forEach(([section, tasks]) => {
            const taskList = taskLists[section];
            if (!taskList) return;
            
            console.log(`恢复 ${section} 类别的任务，数量:`, tasks.length);
            
            // 如果该类别没有任务，显示提示
            if (tasks.length === 0) {
                taskList.innerHTML = '<div class="empty-task-hint">点击右上角的添加按钮添加任务</div>';
                return;
            }
            
            // 创建每个任务元素
            tasks.forEach(task => {
                const newTaskItem = document.createElement('div');
                newTaskItem.className = 'task-item';
                newTaskItem.dataset.section = section;
                newTaskItem.dataset.index = task.index;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
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
                taskDescription.textContent = task.description || '在此输入任务';
                taskDescription.contentEditable = true;
                taskDescription.addEventListener('blur', saveToLocalStorage);
                taskDescription.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur();
                    }
                });
                
                const taskTime = document.createElement('div');
                taskTime.className = 'task-time';
                taskTime.textContent = task.time || '时间';
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
                taskDuration.textContent = task.duration || '预计用时';
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
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.className = 'delete-task';
                deleteBtn.style.marginLeft = '10px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.color = '#e8a87c';
                deleteBtn.style.width = '18px';
                deleteBtn.addEventListener('click', function() {
                    newTaskItem.remove();
                    saveToLocalStorage();
                });
                
                newTaskItem.appendChild(deleteBtn);
                
                // 如果任务已完成，设置相应的样式
                if (task.completed) {
                    newTaskItem.style.opacity = '0.6';
                    taskDescription.style.textDecoration = 'line-through';
                }
                
                // 将任务添加到对应类型的列表中
                taskList.appendChild(newTaskItem);
            });
        });
    } else {
        console.log('没有任务数据需要恢复');
        // 没有任务数据，显示提示
        const taskLists = [
            document.getElementById('important-tasks'),
            document.getElementById('medium-tasks'),
            document.getElementById('small-tasks'),
            document.getElementById('other-tasks')
        ];
        
        taskLists.forEach(list => {
            if (list) list.innerHTML = '<div class="empty-task-hint">点击右上角的添加按钮添加任务</div>';
        });
    }
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
    
    // 为预算时间分配标题添加可编辑功能
    const budgetTitle = document.querySelector('.summary-row:nth-child(2) .summary-text');
    if (budgetTitle) {
        budgetTitle.contentEditable = true;
        budgetTitle.addEventListener('blur', saveToLocalStorage);
        budgetTitle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    }
    
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

// 全局变量存储当前日期的数据
let currentDateData = null;
let currentDate = null;

// 保存到本地存储
function saveToLocalStorage(specificDate) {
    // 收集当前页面数据
    const data = collectPageData();
    console.log('收集到的页面数据:', data);
    
    // 确定要保存的日期
    let saveDate;
    if (specificDate) {
        // 如果指定了日期，使用指定的日期
        saveDate = specificDate;
    } else {
        // 否则使用当前选择器的日期
        const dateSelector = document.getElementById('dateSelector');
        saveDate = dateSelector ? dateSelector.value : new Date().toISOString().split('T')[0];
    }
    
    // 如果是当前日期，更新全局数据
    if (saveDate === currentDate) {
        currentDateData = data;
    }
    
    // 按日期保存数据
    try {
        localStorage.setItem('todayTodoData_' + saveDate, JSON.stringify(data));
        console.log('数据已保存到日期:', saveDate);
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

// 收集页面数据
function collectPageData() {
    const data = {
        timeSlots: [],
        tasks: [],
        budgets: {},
        sectionTitles: {}
    };
    
    // 收集选中的时间单元格
    const timeSlots = document.querySelectorAll('.time-cell');
    const selectedTimeSlots = document.querySelectorAll('.time-cell.selected');
    selectedTimeSlots.forEach(slot => {
        const index = Array.from(timeSlots).indexOf(slot);
        data.timeSlots.push(index);
    });
    
    // 按类别收集任务
    const taskCategories = ['important', 'medium', 'small', 'other'];
    
    taskCategories.forEach(category => {
        const taskList = document.getElementById(category + '-tasks');
        if (!taskList) return;
        
        // 跳过空提示
        if (taskList.querySelector('.empty-task-hint') && taskList.children.length === 1) {
            return;
        }
        
        // 收集当前类别的所有任务
        const taskItems = taskList.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            try {
                const description = item.querySelector('.task-description');
                const time = item.querySelector('.task-time');
                const duration = item.querySelector('.task-duration');
                const checkbox = item.querySelector('input[type="checkbox"]');
                
                if (description && time && duration && checkbox) {
                    data.tasks.push({
                        description: description.textContent,
                        time: time.textContent,
                        duration: duration.textContent,
                        completed: checkbox.checked,
                        section: category
                    });
                }
            } catch (e) {
                console.error('收集任务数据错误:', e);
            }
        });
    });
    
    // 收集预算时间
    const summaryHours = document.querySelector('.summary-hours');
    if (summaryHours) {
        data.budgets.total = summaryHours.textContent;
    }
    
    // 收集时间分配
    const allocationGroups = document.querySelectorAll('.allocation-group');
    data.budgets.allocations = [];
    allocationGroups.forEach(group => {
        const hoursInput = group.querySelector('.hours-input');
        if (group.getAttribute('data-type') && hoursInput) {
            data.budgets.allocations.push({
                type: group.getAttribute('data-type'),
                hours: hoursInput.textContent,
                selected: group.classList.contains('selected')
            });
        }
    });
    
    // 收集预算时间分配标题
    const budgetTitle = document.querySelector('.summary-row:nth-child(2) .summary-text');
    if (budgetTitle) {
        data.budgets.title = budgetTitle.textContent;
    }
    
    // 收集任务部分的标题
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, index) => {
        data.sectionTitles[index] = title.textContent;
    });
    
    return data;
}

// 从本地存储加载
function loadFromLocalStorage() {
    // 获取当前选中的日期
    const dateSelector = document.getElementById('dateSelector');
    const selectedDate = dateSelector ? dateSelector.value : new Date().toISOString().split('T')[0];
    
    // 更新全局当前日期
    currentDate = selectedDate;
    
    // 直接调用加载指定日期的数据函数
    loadDataForDate(selectedDate);
}


// 添加任务功能
document.addEventListener('DOMContentLoaded', function() {
    // 为所有添加按钮添加点击事件
    const addButtons = document.querySelectorAll('.add-task-btn');
    
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionType = this.getAttribute('data-section');
            console.log('添加任务到类型:', sectionType);
            
            let taskList;
            
            // 根据不同的任务类型选择相应的任务列表
            switch(sectionType) {
                case 'important':
                    taskList = document.getElementById('important-tasks');
                    break;
                case 'medium':
                    taskList = document.getElementById('medium-tasks');
                    break;
                case 'small':
                    taskList = document.getElementById('small-tasks');
                    break;
                case 'other':
                    taskList = document.getElementById('other-tasks');
                    break;
                default:
                    return;
            }
            
            // 创建新任务
            createNewTask(taskList);
        });
    });
});

// 创建新任务的函数
function createNewTask(taskList) {
    // 检查是否有提示文本，如果有则移除
    const emptyHint = taskList.querySelector('.empty-task-hint');
    if (emptyHint) {
        emptyHint.remove();
    }
    
    // 获取任务列表的类型
    const sectionType = taskList.id.replace('-tasks', '');
    console.log('创建新任务，类型:', sectionType);
    
    const newTaskItem = document.createElement('div');
    newTaskItem.className = 'task-item';
    newTaskItem.dataset.section = sectionType; // 设置任务类型
    
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
    taskDescription.textContent = '在此输入第一个任务';
    taskDescription.contentEditable = true;
    taskDescription.addEventListener('blur', saveToLocalStorage);
    taskDescription.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
    taskDescription.addEventListener('focus', function() {
        if (this.textContent === '在此输入第一个任务') {
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
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.className = 'delete-task';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = '#e8a87c';
    deleteBtn.style.width = '18px';
    deleteBtn.style.height = '18px';
    deleteBtn.style.display = 'inline-flex';
    deleteBtn.style.justifyContent = 'center';
    deleteBtn.style.alignItems = 'center';
    
    deleteBtn.addEventListener('click', function() {
        newTaskItem.remove();
        saveToLocalStorage();
    });
    
    newTaskItem.appendChild(deleteBtn);
    
    // 将新任务添加到任务列表中
    taskList.appendChild(newTaskItem);
    
    // 让新添加的任务描述获得焦点
    taskDescription.focus();
}
