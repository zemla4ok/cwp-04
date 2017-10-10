const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const port = 8124;

const reqRemote = 'REMOTE';
const reqRemCopy = 'COPY';
const reqRemEncode = 'ENCODE';
const reqRemDecode = 'DECODE';
const algorithm = 'aes-128-cbc';
const reqFiles = 'FILES';
const reqQA = 'QA';
const resGood = 'ACK';
const resBad = 'DEC';
const resFiles = 'NEXT';
const defaultDir = process.env.FILES_DIR;
const maxConn = parseInt(process.env.CONN);

let seed = 0;
let arr = require('./qa.json')
let clients = [];
let files = [];
let fdFile;
let flag = 0;
let connections = 0;


const server = net.createServer((client) => {
    if(++connections === maxConn){
        client.destroy();
    }
    client.setEncoding('utf8');

    client.on('data', (data) => {
        if (data === reqFiles || data === reqQA || data === reqRemote) {
            client.id = getUniqID();
            if (data === reqFiles) {
                files[client.id] = [];
                fs.mkdir(defaultDir + path.sep + client.id);
            }
            console.log(data);
            console.log(`Client ${client.id} connected`);
            clients[client.id] = data;
            fs.open(`./log/client_${client.id}.txt`, 'w', (err, fd) => {
                fdFile = fd;
                client.write(resGood);
            })
        }
        else if (client.id === undefined) {
            client.write(resBad);
            client.destroy();
        }
        if (clients[client.id] === reqQA && data !== reqQA) {
            console.log(data);
            let questionInd = getQuestionId(data);
            let answer;
            if (answerTheQuestion() === 1) {
                answer = arr[questionInd].goodAns;
            }
            else {
                answer = arr[questionInd].badAns;
            }
            client.write(answer);
        }
        if (clients[client.id] === reqFiles && data !== reqFiles) {
            files[client.id].push(data);
            flag++;
            if (flag === 2) {
                let buf = Buffer.from(files[client.id][0],'hex');
                let filePath = defaultDir+path.sep+client.id+path.sep+files[client.id][1];
                let fil = fs.createWriteStream(filePath);
                fil.write(buf);
                flag=0;
                files[client.id] = [];
                client.write(resFiles);
            }
        }
        if(clients[client.id] === reqRemote && data !== reqRemote){
            console.log(data);
            let remoting = data.split(' ');
            let rd = fs.createReadStream(remoting[1]);
            let wr = fs.createWriteStream(remoting[2]);
            if(remoting[0] === reqRemCopy){
                rd.pipe(wr);
            }
            if(remoting[0] === reqRemEncode){
                let cryptoStream = crypto.createCipher(algorithm, remoting[3]);
                rd.pipe(cryptoStream).pipe(wr);
            }
            if(remoting[0] === reqRemDecode){
                let cryptoStream = crypto.createDecipher(algorithm, remoting[3]);
                rd.pipe(cryptoStream).pipe(wr);
            }
            client.write(resGood);
        }
    });

    client.on('end', () => {
        connections--;
        console.log(`Client ${client.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

//*************************************
function getUniqID() {
    return Date.now() + seed++;
}

function getQuestionId(question) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].question === question)
            return i;
    }
}

function answerTheQuestion() {
    return Math.random() > 0.5 ? 1 : 0;
}

