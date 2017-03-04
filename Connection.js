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

    alexa_response   = undefined;
    const to_vehicle = send_to_vehicle(req.query);

    if(to_vehicle){
        broadcastToVehicles(req.query);
    }
    else {
        broadcastToPhones('pong');
    }

    const promise = new Promise(resolve => {
        //Check every 100 ms to see if the request has completed
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



const phones      = [];
const vehicles    = [];

io.use((socket, next) => {
    const handshake = socket.handshake;
    const query     = handshake.query;
    console.log("query", query);
    if(query.hasOwnProperty('vehicle')){
        vehicles.push({
            connection : {
                vin     : query.vin,
                client  : socket
            }
        });
    }
    else {
        phones.push(socket);
    }
    next();
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('otto', data => {
        console.log("message from gm received", data);
        alexa_response = data;
    });


    client.on('location_request', data => {
        console.log("to vehicles", data);
        broadcastToVehicles({
            "intent_name" : "NAV",
            "address" : data
        });
    });


    client.on('end', () => {
        client.disconnect();
    });

});


/**
 * Broadcast a message to all connected phones
 *
 * @param data
 */
function broadcastToPhones(data){
    console.log("to phones");
    phones.forEach(phone => {
       phone.emit("location_request", data);
    });
}

/**
 * Broadcast a message to all connected vehicles
 *
 * @param data
 */
function broadcastToVehicles(data){
    vehicles.forEach(vehicle => {
        vehicle.connection.client.emit("request", data);
    });
}

/**
 * Determine if we need to send a request to the vehicle or the phone.
 *
 * @param query
 * @returns {boolean}
 */
function send_to_vehicle(query) {


    const intent = query['intent_name'];

    if(intent !== "NAV"){
        return true;
    }

    const slot = JSON.parse(query['slots'])[0];
    return slot['value'] !== "Zach";
}


server.listen(4200); 