// 全屏页面的特定功能
document.addEventListener('DOMContentLoaded', function() {
    // 创建关闭按钮
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle && !document.getElementById('closeButton')) {
        // 创建关闭按钮容器
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'header-controls';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.marginLeft = 'auto';
        controlsContainer.style.marginRight = '10px';
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.id = 'closeButton';
        closeButton.className = 'close-button';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.color = '#5a4a42';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '5px 10px';
        closeButton.style.borderRadius = '4px';
        closeButton.style.transition = 'background-color 0.2s';
        
        closeButton.addEventListener('click', function() {
            // 如果是全屏状态，先退出全屏
            if (document.fullscreenElement) {
                document.exitFullscreen().then(() => {
                    window.close();
                }).catch(err => {
                    console.error('退出全屏失败:', err);
                    window.close();
                });
            } else {
                window.close();
            }
        });
        
        // 将关闭按钮添加到容器
        controlsContainer.appendChild(closeButton);
        
        // 找到标题所在的header元素
        const header = headerTitle.parentElement;
        if (header) {
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.appendChild(controlsContainer);
        }
    }
    
    // 检测是否在Chrome插件环境中运行
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('在Chrome插件环境中运行');
        
        // 可以添加插件特定的功能
        document.title = '今日清单 - Chrome插件';
        
        // 添加进入全屏模式的功能
        function enterFullscreen() {
            const docElement = document.documentElement;
            
            if (docElement.requestFullscreen) {
                docElement.requestFullscreen().catch(err => {
                    console.error('进入全屏模式失败:', err);
                });
            } else if (docElement.webkitRequestFullscreen) { // Safari
                docElement.webkitRequestFullscreen();
            } else if (docElement.msRequestFullscreen) { // IE11
                docElement.msRequestFullscreen();
            }
        }
        
        // 监听来自background.js的消息
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('收到消息:', message);
            if (message.action === 'enterFullscreen') {
                // 延迟一点时间再进入全屏，确保页面已完全加载
                setTimeout(enterFullscreen, 500);
            }
            // 返回true表示异步响应
            return true;
        });
        
        // 添加全屏切换按钮
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            // 获取或创建控制容器
            let controlsContainer = document.querySelector('.header-controls');
            if (!controlsContainer) {
                controlsContainer = document.createElement('div');
                controlsContainer.className = 'header-controls';
                controlsContainer.style.display = 'flex';
                controlsContainer.style.alignItems = 'center';
                controlsContainer.style.marginLeft = 'auto';
                controlsContainer.style.marginRight = '10px';
                
                // 找到标题所在的header元素
                const header = headerTitle.parentElement;
                if (header) {
                    header.style.display = 'flex';
                    header.style.justifyContent = 'space-between';
                    header.style.alignItems = 'center';
                    header.appendChild(controlsContainer);
                }
            }
            
            // 创建全屏按钮
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'fullscreen-button';
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.style.background = 'none';
            fullscreenBtn.style.border = 'none';
            fullscreenBtn.style.fontSize = '20px';
            fullscreenBtn.style.color = '#5a4a42';
            fullscreenBtn.style.cursor = 'pointer';
            fullscreenBtn.style.padding = '5px 10px';
            fullscreenBtn.style.borderRadius = '4px';
            fullscreenBtn.style.marginRight = '10px';
            fullscreenBtn.style.transition = 'background-color 0.2s';
            
            fullscreenBtn.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(0,0,0,0.05)';
            });
            
            fullscreenBtn.addEventListener('mouseout', function() {
                this.style.backgroundColor = '';
            });
            
            fullscreenBtn.addEventListener('click', function() {
                if (!document.fullscreenElement) {
                    enterFullscreen();
                    this.innerHTML = '<i class="fas fa-compress"></i>';
                } else {
                    document.exitFullscreen();
                    this.innerHTML = '<i class="fas fa-expand"></i>';
                }
            });
            
            // 监听全屏状态变化
            document.addEventListener('fullscreenchange', function() {
                if (document.fullscreenElement) {
                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                } else {
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                }
            });
            
            // 将全屏按钮添加到控制容器中
            // 确保全屏按钮在关闭按钮前面
            const closeButton = document.getElementById('closeButton');
            if (closeButton && controlsContainer.contains(closeButton)) {
                controlsContainer.insertBefore(fullscreenBtn, closeButton);
            } else {
                controlsContainer.appendChild(fullscreenBtn);
            }
        }
    }
});
