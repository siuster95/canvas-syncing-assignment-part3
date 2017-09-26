const http = require('http');

const socketio = require('socket.io');

const fs = require('fs');

const draws = {};

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handler = (request, response) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200);
    response.end(data);
  });
};

const app = http.createServer(handler);

app.listen(port);

const io = socketio(app);

io.on('connection', (socket) => {
  // joining
  socket.join('room1');
  console.log('someone joined room1');

  // quiting
  socket.on('disconnect', () => {
    socket.leave('room1');
    console.log('someone left room1');
  });

  // recieving updates
  socket.on('updatePosition', (data) => {
    console.log('getting data from client');
    if (!draws[data.user]) {
      draws[data.user] = data.info;
    } else if (data.info.lastUpdatetime > draws[data.user].lastUpdatetime) {
      draws[data.user] = data.info;
      const time = new Date().getTime();
      draws[data.user].lastUpdatetime = time;
      const Halfwidth = draws[data.user].width / 2;
      const xlimit = draws[data.user].x + Halfwidth;
      if (xlimit > 450) {
        draws[data.user].x = 0;
      }
    }
    io.in('room1').emit('updateFromserver', { user: data.user, info: draws[data.user] });
    console.log('sending back');
  });
});

console.log(`Listening on localhost on port ${port}`);
