const express = require('express');  
const app = express();  
const server = require('http').createServer(app);  
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/test', (req, res, next) => {
    io.sockets.emit('messages', req.body);
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function (data) {
        console.log(data);
    });

    client.on('messages', data => {
        console.log("message received", data);
    })
});



server.listen(4200); 