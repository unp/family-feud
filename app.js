
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/slash')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

http = http.createServer(app);

// Set up socket.io server
var io = require('socket.io').listen(http);

/* SOCKET.IO FUNCTIONS */
var users = [];
var trendList = [];
var tweets = [];
var votes = [];
var family1 = [];
var family2 = [];
var audience = [];
var userKey = 0;
var clients = {};

///////// Real stuff to use ///////////
var topAnswers = {1:{"Pasta sauce":55},2:{"Cheese":43}, 3:{"Parmesean":30}, 4:{"Wine":20}, 5:{"Tomatoes":8}, 6:{"Oregano":5}}; //this should be an array of the top answers, sorted by points
var families = {"1":{"currStrikes":0, "score":0}, "2":{"currStrikes":0, "score":0}};
var currFamily = 1;
///////////////////////////////////////
io.sockets.on('connection', function(socket){
    clients[JSON.stringify(socket.id)] = socket;
    socket.emit('userlist',users);
    socket.broadcast.emit('userlist',users);
    userKey++;

    ///////// Real stuff to use ///////////
    socket.on('familyAnswer', function(answer) {
        // Correct Answer
        for(i in topAnswers){
            if(answer in topAnswers[i]){
                families[currFamily].score += topAnswers[i][answer];
                socket.emit('updateBoard',{"answer":answer,"points":topAnswers[i][answer], "index":i, "family":currFamily, "score":families[currFamily].score});
                return;
            }
        }
        // Incorrect Answer
        families[currFamily].currStrikes++;
        console.log(currFamily + " has " + families[currFamily].currStrikes + " strikes.");
        socket.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
        if (families[currFamily].currStrikes == 3){
            swapFamily();
            console.log("current family is now " + currFamily);
        }
    });

    ///////////////////////////////////////
    // Signup Listener
    socket.on('signup', function(user){
        var obj = {};
        var sid = JSON.stringify(socket.id);
        obj[sid] = user;
        users.push(obj);

        // Make each user either a family member or audience
        if (userKey % 3 == 1){
            family1.push(obj);
        }
        else if (userKey % 3 == 2){
            family2.push(obj);
        }
        else{
            audience.push(obj);
        }
        // Check if were at more than 2 users
        if(users.length >= 3){
            startGame(socket);
        }
        else{
            socket.emit('userlist',users);
            socket.broadcast.emit('userlist',users);
        }
    });

    socket.on("pass", function(){
        families[currFamily].currStrikes = 0;
        socket.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
        swapFamily();
        families[currFamily].currStrikes = 0;
        console.log("pass called. current family is " + currFamily);
        socket.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
        socket.emit('updateFamily', currFamily);
    });    
    
    socket.on('disconnect', function(){
        delete clients[JSON.stringify(socket.id)];
    });
});

// Function to swap families
function swapFamily(){
    console.log("swap family called");
    families[currFamily].currStrikes = 0;
    currFamily = (currFamily == 1) ? 2 : 1;
}

// Start express server
http.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

