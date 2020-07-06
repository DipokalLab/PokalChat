var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
const socketUpload = require( "socketio-file-upload" );



//헤더보안
app.disable('x-powered-by');

//view engine 을 EJS(쉽게 말해서 Express 를 위한 HTML 같은거)로 설정
app.set('view engine','ejs');

//view 를 views 디렉토리로 설정
app.set('views','./views');
app.use(express.static('pub'));
app.use('/file',express.static('file'));

app.use(socketUpload.router);

app.get('/', function(req, res) {
    res.render('./index');

});

var port = process.env.PORT || 4000;


var user = [];
var uniqueUsers = [];


var c = 0;

io.on('connection', (socket) => {
    console.log('connected');
    c = c+1;
    io.emit('chat', "유저입장", "userName");
    io.emit('count', c);

    let uploader = new socketUpload();

    // @breif 업로드 경로를 지정
    uploader.dir = "./file";
    uploader.listen( socket );


    uploader.on("saved", function(event) {

        var reg = /(.*?)\.(jpg|jpeg|png|gif|bmp)$/;

        if(event.file.pathName.match(reg)) {

            socket.emit('file', event.file.pathName);

        } else {

            console.log('nan')

        }

    });



    uploader.on("error", function(event) {
        console.log("Error from uploader", event);
    });

    socket.on('chat', (msg, userName) => {
        user.push(userName);

        io.emit('user', user);

        if (msg !== '') {
            if (userName.length <= 7) {
                io.emit('chat', userName+": "+msg, userName);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log('disconnected');
        c = c-1;
        io.emit('count', c);

    });

    
  });

server.listen(port);
