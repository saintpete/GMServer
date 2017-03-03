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

app.get('/otto-request', (req, res, next) => {


    alexa_response = undefined;
    console.log("Alexa sent", req.query);
    broadcast(req.query);
    const promise = new Promise(resolve => {
        function check(){
            setTimeout(() => {
                if(typeof alexa_response !== typeof undefined){
                    resolve();
                }
                else{
                    check();
                }
            }, 100);
        }

        check();
    });

    promise.then(() => {
        res.send(alexa_response);
    });
});

const connections = [];

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('otto', data => {
        console.log("message from gm received", data);
        alexa_response = data;
        // broadcast(data);
    });

    connections.push(client);
});


function broadcast(data) {
    console.log(`There are ${connections.length} current connections`);
    connections.forEach(conn => {
        conn.emit("request", data);
    });
}


server.listen(4200); 