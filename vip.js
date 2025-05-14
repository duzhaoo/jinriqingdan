// VIP功能管理模块

// 预置的激活码列表（10个）
const ACTIVATION_CODES = [
    'VIP-A7X9-K3M2-F5D8',
    'VIP-B2R6-T9E4-H1J7',
    'VIP-C8P3-Z5Y1-Q6N2',
    'VIP-D4S7-X2V9-L3G5',
    'VIP-E1W8-U6T3-I9K4',
    'VIP-F5M2-J7H4-O3P9',
    'VIP-G9N6-R2Q8-S5T1',
    'VIP-H3L7-V4B2-X8Z6',
    'VIP-I6K1-Y9D5-A3C7',
    'VIP-J2P8-E5F3-G7H4'
];

// VIP状态管理
const VIPManager = {
    // 检查是否是VIP会员
    isVIP: function() {
        return new Promise((resolve) => {
            chrome.storage.local.get('vipStatus', (result) => {
                if (result.vipStatus && result.vipStatus.active) {
                    // 检查VIP是否过期
                    const now = new Date().getTime();
                    if (result.vipStatus.expireTime && result.vipStatus.expireTime > now) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    },

    // 获取VIP状态详情
    getVIPStatus: function() {
        return new Promise((resolve) => {
            chrome.storage.local.get('vipStatus', (result) => {
                if (result.vipStatus) {
                    resolve(result.vipStatus);
                } else {
                    resolve({
                        active: false,
                        activationDate: null,
                        expireTime: null,
                        activationCode: null
                    });
                }
            });
        });
    },

    // 激活VIP
    activateVIP: function(code) {
        return new Promise((resolve, reject) => {
            // 检查激活码是否有效
            if (ACTIVATION_CODES.includes(code)) {
                // 设置VIP状态
                const now = new Date();
                const expireDate = new Date();
                expireDate.setFullYear(expireDate.getFullYear() + 100); // 设置为永久VIP（100年）
                
                const vipStatus = {
                    active: true,
                    activationDate: now.getTime(),
                    expireTime: expireDate.getTime(),
                    activationCode: code
                };
                
                chrome.storage.local.set({vipStatus: vipStatus}, () => {
                    resolve({
                        success: true,
                        message: '恭喜！永久VIP激活成功！',
                        expireDate: expireDate.toLocaleDateString('zh-CN')
                    });
                });
            } else {
                reject({
                    success: false,
                    message: '激活码无效或已被使用，请重试。'
                });
            }
        });
    },

    // 检查非会员是否超出使用限制（只能创建3天的数据）
    checkDateLimit: function(date) {
        return new Promise(async (resolve) => {
            const isVip = await this.isVIP();
            if (isVip) {
                // VIP会员无限制
                resolve({
                    allowed: true
                });
                return;
            }
            
            // 非会员检查已创建的日期数量
            chrome.storage.local.get(null, (result) => {
                const dateKeys = Object.keys(result).filter(key => key.startsWith('todayTodoData_'));
                
                // 如果当前日期已经有数据，不计入限制
                const currentDateKey = 'todayTodoData_' + date;
                const existingDates = dateKeys.filter(key => key !== currentDateKey);
                
                if (existingDates.length < 3) {
                    // 未超出限制
                    resolve({
                        allowed: true
                    });
                } else {
                    // 超出限制
                    resolve({
                        allowed: false,
                        message: '免费版仅支持创建3天的数据'
                    });
                }
            });
        });
    }
};

// 初始化标题旁的VIP标识
function initTitleVIPBadge() {
    // 先清除可能存在的旧VIP标识
    const oldVipBadge = document.getElementById('vipBadge');
    if (oldVipBadge) {
        oldVipBadge.parentNode.removeChild(oldVipBadge);
    }
    
    // 获取标题元素
    const headerTitle = document.querySelector('.header-title');
    if (!headerTitle) return;
    
    // 获取h1元素
    const h1 = headerTitle.querySelector('h1');
    if (!h1) return;
    
    // 先检查标题文本是否已经包含“VIP”文本
    if (h1.textContent.includes('VIP')) {
        // 如果已经包含，则先清理
        h1.textContent = '今日清单';
    }
    
    // 保存原标题文本
    const titleText = h1.textContent;
    
    // 创建VIP标识
    const vipBadge = document.createElement('span');
    vipBadge.id = 'vipBadge';
    vipBadge.className = 'vip-badge';
    vipBadge.innerHTML = 'VIP';
    vipBadge.style.marginLeft = '8px';
    vipBadge.style.background = 'linear-gradient(45deg, #e6b980, #eacda3)';
    vipBadge.style.border = '1px solid rgba(255, 215, 0, 0.3)';
    vipBadge.style.borderRadius = '4px';
    vipBadge.style.padding = '1px 6px';
    vipBadge.style.color = '#8B4513';
    vipBadge.style.fontSize = '14px';
    vipBadge.style.fontWeight = 'bold';
    vipBadge.style.cursor = 'pointer';
    vipBadge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)';
    vipBadge.style.display = 'none'; // 默认隐藏
    vipBadge.style.verticalAlign = 'middle';
    vipBadge.style.textShadow = '0 1px 0 rgba(255,255,255,0.3)';
    vipBadge.style.letterSpacing = '0.5px';
    vipBadge.style.transition = 'all 0.3s ease';
    
    // 添加悬停效果
    vipBadge.addEventListener('mouseover', function() {
        this.style.background = 'linear-gradient(45deg, #eacda3, #e6b980)';
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)';
    });
    
    vipBadge.addEventListener('mouseout', function() {
        this.style.background = 'linear-gradient(45deg, #e6b980, #eacda3)';
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)';
    });
    
    vipBadge.addEventListener('click', showVIPModal);
    
    // 清空标题并重新设置
    h1.innerHTML = titleText;
    h1.appendChild(vipBadge);
}

// 初始化VIP界面
function initVIPUI() {
    // 初始化标题区域的VIP标识
    initTitleVIPBadge();
    
    // 移除可能存在的右侧VIP按钮
    const vipButton = document.getElementById('vipButton');
    if (vipButton) {
        vipButton.parentNode.removeChild(vipButton);
    }
    
    // 创建VIP模态框
    createVIPModal();
    
        // 更新VIP状态
    updateVIPButtonStatus();
}

// 更新VIP标识状态
async function updateVIPButtonStatus() {
    const vipBadge = document.getElementById('vipBadge');
    
    const isVip = await VIPManager.isVIP();
    console.log('VIP状态:', isVip); // 调试信息
    
    // 更新标题旁的VIP标识
    if (vipBadge) {
        console.log('找到VIP标识元素'); // 调试信息
        
        // 默认隐藏标识
        vipBadge.style.display = 'none';
        
        // 只有在用户是VIP时才显示标识
        if (isVip === true) {
            console.log('用户是VIP，显示VIP标识'); // 调试信息
            vipBadge.style.display = 'inline-block';
        } else {
            console.log('用户不是VIP，隐藏VIP标识'); // 调试信息
        }
    } else {
        console.log('未找到VIP标识元素'); // 调试信息
    }
}

// 创建VIP模态框
async function createVIPModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'vipModalContainer';
    if (!document.getElementById('vipModalStyles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'vipModalStyles';
        styleElement.textContent = `
            // ...
            @keyframes vipModalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes vipModalFadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
            @keyframes vipPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .vip-badge {
                background: linear-gradient(45deg, #e6b980, #eacda3);
                color: #8B4513;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                animation: vipPulse 2s infinite;
            }
            .vip-button {
                background: linear-gradient(45deg, #e6b980, #eacda3);
                color: #8B4513;
                border: none;
                border-radius: 6px;
                padding: 10px 20px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .vip-button:hover {
                background: linear-gradient(45deg, #eacda3, #e6b980);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            .vip-input {
                padding: 10px 12px;
                border: 1px solid #e0d5c9;
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.3s ease;
                outline: none;
            }
            .vip-input:focus {
                border-color: #e8a87c;
                box-shadow: 0 0 0 2px rgba(232, 168, 124, 0.2);
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // 检查VIP状态，决定是否显示激活输入框
    const isVip = await VIPManager.isVIP();
    
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #5a4a42; font-size: 22px; font-weight: 600;">VIP会员中心</h2>
            <button id="closeVIPModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #8c6e58; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s ease;">×</button>
        </div>
        
        <div id="vipStatusContainer" style="margin-bottom: 24px; padding: 20px; background-color: #f9f6f2; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: center; align-items: center; height: 40px;">
                <div style="width: 24px; height: 24px; border: 3px solid #e0d5c9; border-top-color: #e8a87c; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
        </div>
        
        ${!isVip ? `
        <div id="activationContainer" style="margin-bottom: 24px; padding: 20px; background-color: #f9f6f2; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="color: #5a4a42; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">激活VIP</h3>
            <div style="display: flex;">
                <input type="text" id="activationCodeInput" class="vip-input" placeholder="请输入激活码" style="flex: 1; margin-right: 12px;">
                <button id="activateButton" class="vip-button">激活</button>
            </div>
            <p id="activationMessage" style="margin-top: 12px; font-size: 14px; color: #e8a87c; min-height: 20px;"></p>
        </div>
        ` : ''}
        
        <div style="padding: 20px; background-color: #f9f6f2; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="color: #5a4a42; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">VIP特权</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="display: flex; align-items: center; padding: 10px; background-color: white; border-radius: 8px;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(45deg, #e6b980, #eacda3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        <span style="color: #8B4513; font-weight: bold;">∞</span>
                    </div>
                    <span style="color: #5a4a42;">无限创建日程</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px; background-color: white; border-radius: 8px;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(45deg, #e6b980, #eacda3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        <span style="color: #8B4513; font-weight: bold;">★</span>
                    </div>
                    <span style="color: #5a4a42;">解锁高级功能</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px; background-color: white; border-radius: 8px;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(45deg, #e6b980, #eacda3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        <span style="color: #8B4513; font-weight: bold;">↑</span>
                    </div>
                    <span style="color: #5a4a42;">优先获取新功能</span>
                </div>
                <div style="display: flex; align-items: center; padding: 10px; background-color: white; border-radius: 8px;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(45deg, #e6b980, #eacda3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        <span style="color: #8B4513; font-weight: bold;">♥</span>
                    </div>
                    <span style="color: #5a4a42;">专属客户支持</span>
                </div>
            </div>
        </div>
    `;
    
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // 添加关闭模态框的事件
    document.getElementById('closeVIPModal').addEventListener('click', () => {
        modalContent.style.animation = 'vipModalFadeOut 0.3s ease forwards';
        setTimeout(() => {
            modalContainer.style.display = 'none';
        }, 300);
    });
    
    // 点击背景关闭模态框
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            modalContent.style.animation = 'vipModalFadeOut 0.3s ease forwards';
            setTimeout(() => {
                modalContainer.style.display = 'none';
            }, 300);
        }
    });
    
    // 只有在非VIP用户时才添加激活按钮事件
    if (!isVip) {
        const activateButton = document.getElementById('activateButton');
        if (activateButton) {
            activateButton.addEventListener('click', async () => {
                const codeInput = document.getElementById('activationCodeInput');
                const messageElement = document.getElementById('activationMessage');
                
                if (!codeInput.value.trim()) {
                    messageElement.textContent = '请输入激活码';
                    messageElement.style.color = '#e74c3c';
                    codeInput.focus();
                    codeInput.style.borderColor = '#e74c3c';
                    codeInput.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
                    setTimeout(() => {
                        codeInput.style.borderColor = '#e0d5c9';
                        codeInput.style.boxShadow = 'none';
                    }, 2000);
                    return;
                }
                
                try {
                    // 显示加载状态
                    const originalText = activateButton.textContent;
                    activateButton.textContent = '激活中...';
                    activateButton.disabled = true;
                    activateButton.style.opacity = '0.7';
                    
                    const result = await VIPManager.activateVIP(codeInput.value.trim());
                    
                    if (result.success) {
                        messageElement.textContent = result.message;
                        messageElement.style.color = '#4CAF50';
                        activateButton.textContent = '激活成功';
                        activateButton.style.backgroundColor = '#4CAF50';
                        
                        // 成功动画
                        const successIcon = document.createElement('div');
                        successIcon.innerHTML = `<div style="display: flex; justify-content: center; margin-top: 10px;"><div class="vip-badge" style="font-size: 16px; padding: 8px 16px;">VIP已激活</div></div>`;
                        messageElement.parentNode.insertBefore(successIcon, messageElement.nextSibling);
                        
                        // 更新VIP状态显示
                        updateVIPStatusDisplay();
                        // 更新VIP按钮状态
                        updateVIPButtonStatus();
                        
                        // 清空输入框
                        codeInput.value = '';
                        
                        // 重新加载模态框，移除激活输入框
                        setTimeout(() => {
                            // 关闭当前模态框
                            modalContent.style.animation = 'vipModalFadeOut 0.3s ease forwards';
                            setTimeout(() => {
                                // 重新打开模态框，此时已是VIP状态
                                showVIPModal();
                            }, 500);
                        }, 2000);
                    } else {
                        messageElement.textContent = result.message;
                        messageElement.style.color = '#e74c3c';
                        
                        // 错误动画
                        codeInput.style.borderColor = '#e74c3c';
                        codeInput.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
                        setTimeout(() => {
                            codeInput.style.borderColor = '#e0d5c9';
                            codeInput.style.boxShadow = 'none';
                        }, 2000);
                        
                        // 恢复按钮状态
                        activateButton.textContent = originalText;
                        activateButton.disabled = false;
                        activateButton.style.opacity = '1';
                    }
                } catch (error) {
                    messageElement.textContent = error.message || '激活失败，请稍后重试';
                    messageElement.style.color = '#e74c3c';
                    
                    // 恢复按钮状态
                    activateButton.textContent = '激活';
                    activateButton.disabled = false;
                    activateButton.style.opacity = '1';
                }
            });
        }
    }
}

// 显示VIP模态框
async function showVIPModal() {
    const modalContainer = document.getElementById('vipModalContainer');
    if (modalContainer) {
        // 重置动画
        const modalContent = modalContainer.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'none';
            modalContent.offsetHeight; // 触发重排
            modalContent.style.animation = 'vipModalFadeIn 0.3s ease';
        }
        
        modalContainer.style.display = 'flex';
        
        // 更新VIP状态显示
        await updateVIPStatusDisplay();
        
        // 聚焦到激活码输入框
        setTimeout(() => {
            const codeInput = document.getElementById('activationCodeInput');
            if (codeInput) codeInput.focus();
        }, 300);
    }
}

// 更新VIP状态显示
async function updateVIPStatusDisplay() {
    const statusContainer = document.getElementById('vipStatusContainer');
    if (!statusContainer) return;
    
    const vipStatus = await VIPManager.getVIPStatus();
    
    if (vipStatus.active) {
        const expireDate = new Date(vipStatus.expireTime);
        const daysLeft = Math.ceil((vipStatus.expireTime - Date.now()) / (1000 * 60 * 60 * 24));
        
        statusContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 16px;">
                <div class="vip-badge" style="font-size: 16px; padding: 8px 16px; margin: 0 auto; display: inline-block;">
                    VIP会员
                </div>
            </div>
            <div style="background-color: white; border-radius: 8px; padding: 15px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #5a4a42;">会员状态</span>
                    <span style="color: #4CAF50; font-weight: 600;">已激活</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #5a4a42;">到期时间</span>
                    <span style="color: #8c6e58;">${expireDate.toLocaleDateString('zh-CN')} (剩余${daysLeft}天)</span>
                </div>
            </div>
        `;
    } else {
        statusContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 16px;">
                <div style="background-color: #e0d5c9; color: #8c6e58; padding: 8px 16px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    免费版
                </div>
            </div>
            <div style="background-color: white; border-radius: 8px; padding: 15px; margin-top: 10px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="width: 24px; height: 24px; background-color: #e0d5c9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        <span style="color: #8c6e58; font-weight: bold;">!</span>
                    </div>
                    <span style="color: #8c6e58;">仅可创建3天的日程数据</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 24px; height: 24px; background-color: #e0d5c9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                        <span style="color: #8c6e58; font-weight: bold;">↑</span>
                    </div>
                    <span style="color: #8c6e58;">升级VIP会员，享受无限创建特权</span>
                </div>
            </div>
        `;
    }
}

// 在页面加载完成后初始化VIP界面
document.addEventListener('DOMContentLoaded', function() {
    initVIPUI();
});

// 导出VIP管理器
window.VIPManager = VIPManager;
