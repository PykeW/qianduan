// 建立WebSocket连接时，建议添加错误处理和连接状态监听
const ws = new WebSocket('ws://localhost:5173');

ws.onopen = () => {
    console.log('WebSocket连接已建立');
};

ws.onerror = (error) => {
    console.error('WebSocket错误:', error);
};

ws.onclose = () => {
    console.log('WebSocket连接已关闭');
};

// 添加消息接收处理
ws.onmessage = (event) => {
    console.log('收到服务器消息:', event.data);
    try {
        const data = JSON.parse(event.data);
        // 处理数据并更新UI
        updateUI(data);
    } catch (error) {
        console.error('解析消息错误:', error);
    }
}; 