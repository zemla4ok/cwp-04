const net = require('net');
const fs = require('fs');
const path = require("path");
const port = 8124;
const client = new net.Socket();

client.setEncoding('utf8');

client.connect(port, () => {
});

client.on('data', (data) => {

});

client.on('close', function () {
    console.log('Connection closed');
});