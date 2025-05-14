// 设置页面功能

// 设置项默认值
const DEFAULT_SETTINGS = {
    showTimeBudget: true,     // 是否显示时间总预算
    showTimeAllocation: true  // 是否显示预算时间分配
};

// 设置管理器
const SettingsManager = {
    // 获取所有设置
    getSettings: function() {
        return new Promise((resolve) => {
            chrome.storage.local.get('userSettings', (result) => {
                if (result.userSettings) {
                    resolve(result.userSettings);
                } else {
                    // 如果没有保存的设置，使用默认值
                    resolve(DEFAULT_SETTINGS);
                }
            });
        });
    },
    
    // 获取单个设置项
    getSetting: async function(key) {
        const settings = await this.getSettings();
        return settings[key] !== undefined ? settings[key] : DEFAULT_SETTINGS[key];
    },
    
    // 保存设置
    saveSettings: function(settings) {
        return new Promise((resolve) => {
            chrome.storage.local.set({userSettings: settings}, () => {
                resolve({success: true});
            });
        });
    },
    
    // 更新单个设置项
    updateSetting: async function(key, value) {
        const settings = await this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }
};

// 初始化设置界面
function initSettingsUI() {
    // 创建设置按钮
    const header = document.querySelector('header');
    if (header) {
        // 创建左侧容器
        let headerLeft = document.querySelector('.header-left');
        if (!headerLeft) {
            headerLeft = document.createElement('div');
            headerLeft.className = 'header-left';
            headerLeft.style.display = 'flex';
            headerLeft.style.alignItems = 'center';
            headerLeft.style.position = 'absolute';
            headerLeft.style.left = '20px';
            headerLeft.style.top = '50%';
            headerLeft.style.transform = 'translateY(-50%)';
            headerLeft.style.transition = 'all 0.3s ease';
            headerLeft.style.paddingTop = '10px';
            
            // 将左侧容器添加到header
            header.insertBefore(headerLeft, header.firstChild);
        }
        
        // 创建设置按钮
        const settingsButton = document.createElement('button');
        settingsButton.id = 'settingsButton';
        settingsButton.className = 'settings-button';
        settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
        settingsButton.style.background = 'none';
        settingsButton.style.border = 'none';
        settingsButton.style.fontSize = '20px';
        settingsButton.style.color = '#5a4a42';
        settingsButton.style.cursor = 'pointer';
        settingsButton.style.padding = '5px';
        
        settingsButton.addEventListener('click', showSettingsModal);
        
        // 将设置按钮添加到左侧容器
        headerLeft.appendChild(settingsButton);
    }
    
    // 创建设置模态框
    createSettingsModal();
    
    // 应用当前设置
    applyCurrentSettings();
}

// 创建设置模态框
function createSettingsModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'settingsModalContainer';
    modalContainer.className = 'modal-container';
    modalContainer.style.display = 'none';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalContainer.style.zIndex = '1000';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '12px';
    modalContent.style.padding = '24px';
    modalContent.style.width = '420px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
    modalContent.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', sans-serif";
    modalContent.style.animation = 'modalFadeIn 0.3s ease';
    
    // 添加动画和交互样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalFadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        
        #closeSettingsModal:hover {
            background-color: rgba(0,0,0,0.05);
        }
        
        #settingsActivationCode:focus {
            border-color: #e8a87c;
            box-shadow: 0 0 0 2px rgba(232, 168, 124, 0.2);
        }
        
        #settingsActivateButton:hover {
            background: linear-gradient(45deg, #eacda3, #e6b980);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        #settingsActivateButton:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        #saveSettingsButton:hover {
            background-color: #7d5f4b;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        #saveSettingsButton:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .custom-checkbox input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #e0d5c9;
            border-radius: 4px;
            outline: none;
            transition: all 0.2s ease;
            position: relative;
            cursor: pointer;
            background-color: white;
        }
        
        .custom-checkbox input[type="checkbox"]:checked {
            background-color: #e8a87c;
            border-color: #e8a87c;
        }
        
        .custom-checkbox input[type="checkbox"]:checked::after {
            content: '\u2714';
            font-size: 14px;
            color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .custom-checkbox input[type="checkbox"]:hover {
            border-color: #e8a87c;
        }
    `;
    document.head.appendChild(styleElement);
    
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #5a4a42; font-size: 22px; font-weight: 600;">设置</h2>
            <button id="closeSettingsModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #8c6e58; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s ease; hover: background-color: rgba(0,0,0,0.05);">×</button>
        </div>
        
        <div style="margin-bottom: 28px; background-color: #f9f6f2; padding: 16px; border-radius: 8px;">
            <h3 style="color: #5a4a42; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">显示选项</h3>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div class="custom-checkbox" style="position: relative; margin-right: 12px;">
                    <input type="checkbox" id="showTimeBudget" style="width: 18px; height: 18px; cursor: pointer; position: relative; z-index: 1;">
                </div>
                <label for="showTimeBudget" style="color: #5a4a42; font-size: 15px; cursor: pointer;">显示时间总预算</label>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="custom-checkbox" style="position: relative; margin-right: 12px;">
                    <input type="checkbox" id="showTimeAllocation" style="width: 18px; height: 18px; cursor: pointer; position: relative; z-index: 1;">
                </div>
                <label for="showTimeAllocation" style="color: #5a4a42; font-size: 15px; cursor: pointer;">显示预算时间分配</label>
            </div>
        </div>
        
        <div style="margin-bottom: 28px; background-color: #f9f6f2; padding: 16px; border-radius: 8px;">
            <h3 style="color: #5a4a42; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">VIP激活</h3>
            <div style="display: flex;">
                <input type="text" id="settingsActivationCode" placeholder="请输入激活码" style="flex: 1; padding: 10px 12px; border: 1px solid #e0d5c9; border-radius: 6px; margin-right: 12px; font-size: 14px; transition: all 0.3s ease; outline: none;">
                <button id="settingsActivateButton" style="background: linear-gradient(45deg, #e6b980, #eacda3); color: #8B4513; border: none; border-radius: 6px; padding: 0 18px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.3s ease;">激活</button>
            </div>
            <p id="settingsActivationMessage" style="margin-top: 12px; font-size: 14px; color: #e8a87c; min-height: 20px;"></p>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 24px; border-top: 1px solid #e0d5c9; padding-top: 20px;">
            <button id="saveSettingsButton" style="background-color: #8c6e58; color: white; border: none; border-radius: 6px; padding: 10px 20px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">保存设置</button>
        </div>
    `;

    // 创建设置模态框完成后，添加到文档中
    document.body.appendChild(modalContainer);
    modalContainer.appendChild(modalContent);

    // 添加点击背景关闭模态框的功能
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    });

    // 添加关闭按钮事件
    document.getElementById('closeSettingsModal').addEventListener('click', function() {
        modalContainer.style.display = 'none';
        // 添加淡出动画
        modalContent.style.animation = 'modalFadeOut 0.2s ease forwards';
        setTimeout(() => {
            modalContainer.style.display = 'none';
        }, 200);
    });

    // 添加保存设置按钮事件
    document.getElementById('saveSettingsButton').addEventListener('click', async function() {
        const showTimeBudget = document.getElementById('showTimeBudget').checked;
        const showTimeAllocation = document.getElementById('showTimeAllocation').checked;

        // 添加保存中的视觉反馈
        const saveButton = document.getElementById('saveSettingsButton');
        const originalText = saveButton.textContent;
        saveButton.textContent = '保存中...';
        saveButton.style.opacity = '0.8';
        saveButton.disabled = true;

        await SettingsManager.saveSettings({
            showTimeBudget: showTimeBudget,
            showTimeAllocation: showTimeAllocation
        });

        // 应用新设置
        applyCurrentSettings();

        // 显示保存成功的视觉反馈
        saveButton.textContent = '已保存';
        saveButton.style.backgroundColor = '#4CAF50';

        setTimeout(() => {
            // 恢复按钮状态
            saveButton.textContent = originalText;
            saveButton.style.backgroundColor = '#8c6e58';
            saveButton.style.opacity = '1';
            saveButton.disabled = false;

            // 关闭模态框
            modalContent.style.animation = 'modalFadeOut 0.2s ease forwards';
            setTimeout(() => {
                modalContainer.style.display = 'none';
            }, 200);
        }, 1000);
    });

    // 添加激活按钮事件
    document.getElementById('settingsActivateButton').addEventListener('click', async function() {
        const activationCode = document.getElementById('settingsActivationCode').value.trim();
        const activateButton = document.getElementById('settingsActivateButton');
        const activationMessage = document.getElementById('settingsActivationMessage');

        if (!activationCode) {
            activationMessage.textContent = '请输入激活码';
            activationMessage.style.color = '#e74c3c';
            return;
        }

        // 添加激活中的视觉反馈
        const originalText = activateButton.textContent;
        activateButton.textContent = '激活中...';
        activateButton.style.opacity = '0.8';
        activateButton.disabled = true;

        if (window.VIPManager) {
            const result = await window.VIPManager.activateVIP(activationCode);

            if (result.success) {
                activationMessage.textContent = result.message;
                activationMessage.style.color = '#4CAF50';
                activateButton.textContent = '激活成功';
                activateButton.style.backgroundColor = '#4CAF50';

                // 如果激活成功，更新VIP状态显示
                if (window.updateVIPButtonStatus) {
                    window.updateVIPButtonStatus();
                }

                // 清空输入框
                document.getElementById('settingsActivationCode').value = '';
            } else {
                activationMessage.textContent = result.message;
                activationMessage.style.color = '#e74c3c';
                activateButton.textContent = originalText;
                activateButton.style.opacity = '1';
                activateButton.disabled = false;
            }
        } else {
            activationMessage.textContent = 'VIP功能不可用';
            activationMessage.style.color = '#e74c3c';
            activateButton.textContent = originalText;
            activateButton.style.opacity = '1';
            activateButton.disabled = false;
        }
    });
}

// 显示设置模态框
async function showSettingsModal() {
    const modalContainer = document.getElementById('settingsModalContainer');
    if (modalContainer) {
        // 获取当前设置并更新界面
        const settings = await SettingsManager.getSettings();
        
        document.getElementById('showTimeBudget').checked = settings.showTimeBudget;
        document.getElementById('showTimeAllocation').checked = settings.showTimeAllocation;
        
        // 显示模态框
        modalContainer.style.display = 'flex';
    }
}

// 应用当前设置
async function applyCurrentSettings() {
    // 获取当前设置
    const showTimeBudget = await SettingsManager.getSetting('showTimeBudget');
    const showTimeAllocation = await SettingsManager.getSetting('showTimeAllocation');
    
    // 获取相关元素
    const timeSummarySection = document.querySelector('.time-summary');
    const timeBudgetRow = document.querySelector('.time-summary .summary-row:nth-child(1)');
    const timeAllocationRow = document.querySelector('.time-summary .summary-row:nth-child(2)');
    
    // 应用设置
    if (timeBudgetRow) {
        timeBudgetRow.style.display = showTimeBudget ? 'flex' : 'none';
    }
    
    if (timeAllocationRow) {
        timeAllocationRow.style.display = showTimeAllocation ? 'flex' : 'none';
    }
    
    // 如果两个都不显示，则隐藏整个容器
    if (timeSummarySection) {
        if (!showTimeBudget && !showTimeAllocation) {
            timeSummarySection.style.display = 'none';
        } else {
            timeSummarySection.style.display = 'block';
        }
    }
}

// 在页面加载完成后初始化设置界面
document.addEventListener('DOMContentLoaded', function() {
    initSettingsUI();
});

// 导出设置管理器
window.SettingsManager = SettingsManager;
window.showSettingsModal = showSettingsModal;
