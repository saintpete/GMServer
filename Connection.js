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

let alexa_response = undefined;

app.get('/test', (req, res, next) => {


    console.log("Alexa sent", req.query);
    broadcast(req.query);
    while(typeof alexa_response === typeof undefined){
        setTimeout(() => {
            console.log("waiting on response");
        }, 1000);
    }

    console.log("sending response to alexa", alexa_response);
    return res.send(alexa_response);
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
        alexa_response = data;
        // broadcast(data);
    });

});


function broadcast(data) {
    connections.forEach(conn => {
        conn.emit("request", data);
    });
}


server.listen(4200); 