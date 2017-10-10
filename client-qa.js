const net = require('net');
const fs = require('fs');
const shuffle = require('shuffle-array');
const port = 8124;
const client = new net.Socket();

const req = 'QA';
const goodResp = 'ACK';
const badResp = 'DEC';

let arr = require('./qa.json');
let currInd = 0;
client.setEncoding('utf8');
client.connect(port, function () {
    console.log('Connected');
    shuffle(arr);
    client.write(req);
});

client.on('data',  (data) => {
    if(data === goodResp) {
        console.log(data);
        client.write(arr[currInd].question);
    }
    else if(data === badResp){
        console.log(data);
        client.destroy();
    }
    else{
        console.log(`Question: ${arr[currInd].question}`);
        console.log(`Good answer: ${arr[currInd].goodAns}`);
        console.log(`Server answer: ${data}`);
        if(currInd < arr.length-1){
            currInd++;
            client.write(arr[currInd].question);
        }
        else{
            client.destroy();
        }
    }
});

client.on('close', function () {
    console.log('Connection closed');
});