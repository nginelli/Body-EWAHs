var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var serverID = 'undefined';
io.on('connection', function (socket) {

    console.log('a user connected: ' + socket.id);

    //register the server id, received the command from unity
    socket.on('RegServerId', function (data) {
        serverID = socket.id;
        console.log('reg server id : ' + serverID);
    });

      socket.on('disconnect', function(){
          if (serverID == socket.id) {
              console.log('removed Server: ' + socket.id);
              serverID = 'undefined';
          }
          else {
              console.log('user disconnected: ' + socket.id);
          }
      });

    //socket.on('webimage-byte', function(data){
        //console.log('received: ' + data.ByteData.length);
    //	io.emit('webimage-byte', {
    //	    Width:data.Width,
    //	    Height:data.Height,
    //        ByteData:data.ByteData,
    //	    Base64Str:data.Base64Str
    //        });
    //});

    socket.on('DemoReceive', function(data){

        console.log('received: ' + data.name);

        socket.emit('DemoReceive', {
        name:data.name
        });
        socket.broadcast.emit('DemoReceive', {
        name:data.name
        });
    });

    socket.on('OnReceiveData', function (data) {
        //console.log(data);
        //console.log(data.length);
        //console.log('received!!: ' + data.DataString);
        //console.log('type' + data.EmitType);
        //console.log('byte length' + data.DataByte.length);
        //console.log(serverID + 'xxx');
        if (serverID != 'undefined') {
            if (data.EmitType == 0) {
                //console.log(serverID +' emit type: all');
                io.emit('OnReceiveData', {
                    DataString: data.DataString,
                    DataByte: data.DataByte
                });
            }

            if (data.EmitType == 1) {
                //console.log(serverID +' emit type: server');
                io.to(serverID).emit('OnReceiveData', {
                    DataString: data.DataString,
                    DataByte: data.DataByte
                });
            }

            if (data.EmitType == 2) {
                //console.log(serverID +' emit type: others');
                socket.broadcast.emit('OnReceiveData', {
                    DataString: data.DataString,
                    DataByte: data.DataByte
                });
            }
        }
        else {
            console.log('cannot find any active server');
        }
    });

});

http.listen(80, function(){
  console.log('listening on *:80');
});