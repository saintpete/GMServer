const express = require('express');  
const app = express();  
const server = require('http').createServer(app);  
const io = require('socket.io')(server);


app.use(express.static(__dirname + '/node_modules'));
app.use("/styles",  express.static(__dirname + '/public/stylesheets'));
app.use("/javascript", express.static(__dirname + '/public/javascript'));
app.use("/images",  express.static(__dirname + '/public/images'));

app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});


app.get('/test', (req, res, next) => {
    try{
        console.log("WOOOHOOOOO");
        console.log(req.query);
        broadcast(req.query);

        return res.send(JSON.stringify({
            test : 'test'
        }));
    }
    catch (err){
        console.log(err);
    }
});

const connections = [];

io.on('connection', function(client) {
    console.log('Client connected...');

    connections.push(client);

    client.on('join', function (data) {
        console.log(data);
    });

    client.on('messages', data => {
        console.log("message received", data);
    });

    client.on('otto', data => {
        console.log("message from gm received", data);
        broadcast(data);
    });


    client.send('request', 'something');
});


function broadcast(data) {
    connections.forEach(conn => {
        conn.emit("request", data);
    });
}
// setInterval(() => {
//     if(connections.length > 0){
//         console.log("connetions", connections);
//         connections[0].emit("request", "Hello from server");
//     }
// }, 1000);

server.listen(4200); 