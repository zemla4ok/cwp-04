const net = require('net');
const fs = require('fs');
const path = require("path");
const port = 8124;
const client = new net.Socket();
const reqRemote = 'REMOTE';
const goodResp = 'ACK';
const badResp = 'DEC';

client.setEncoding('utf8');

client.connect(port, () => {
    console.log('Connected');
    client.write(reqRemote);
});

client.on('data', (data) => {
    console.log(data);
    if(data === badResp){
        client.destroy();
    }
    else if(data === goodResp){
        client.write('zek');
    }
});

client.on('close', function () {
    console.log('Connection closed');
});