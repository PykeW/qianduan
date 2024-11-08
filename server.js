// 确保服务器正确处理WebSocket连接
wss.on('connection', (ws) => {
    console.log('新的客户端连接');
    
    // 发送初始数据
    ws.send(JSON.stringify({
        type: 'init',
        data: '初始数据'
    }));
    
    ws.on('message', (message) => {
        console.log('收到消息:', message);
    });
}); 