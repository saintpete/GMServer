

class ConnectionTest {

    constructor() {
        // Create a socket instance
        this.socket = new WebSocket('ws://localhost:3000');
    }

    onOpen() {

        // Open the socket
        this.socket.onopen = event => {

        	// Send an initial message
            this.socket.send('I am the client and I\'m listening!');

        	// Listen for messages
            this.socket.onmessage = function(event) {
        		console.log('Client received a message',event);
        	};

        	// Listen for socket closes
            this.socket.onclose = function(event) {
        		console.log('Client notified socket has closed',event);
        	};

        	// To close the socket....
        	//socket.close()

        };
    }

    send(msg){
        this.socket.send(msg);
    }
}