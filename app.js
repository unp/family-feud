
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
io.sockets.on('connection', function(socket){
    clients[JSON.stringify(socket.id)] = socket;
    socket.emit('userlist',users);
    socket.broadcast.emit('userlist',users);
    userKey++;
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
    
    // Receive Tweet Listener
    socket.on("tweet", function(tweet){
        var obj = {};
        var sid = JSON.stringify(socket.id);
        obj[sid] = tweet;
        tweets.push(obj);
        if(tweets.length >= 2){
            socket.emit("voting",tweets);
            socket.broadcast.emit("voting",tweets);
        }
    });
    
    // Receive Vote Listener
    socket.on("voteTweet", function(vote){
        votes.push(vote);
        if(votes.length == userKey){
            var winner = getWinner();
            socket.emit("winner",winner);
            socket.broadcast.emit("winner",winner);
        }
    });
    
    socket.on('disconnect', function(){
        delete clients[JSON.stringify(socket.id)];
    });
});

// Function to find the winner
function getWinner(){
    var winner = {};
    var biggest = {};
    var winningUser = "";
    var retObj = {};
    biggest.key = "";
    biggest.value = 0;
    for(var i = 0; i < votes.length; i++){
        var uid = votes[i];
        if(winner[uid]){
            winner[uid] = winner[uid] + 1;
            if(winner[uid] > biggest.value){
                biggest.key = uid;
                biggest.value = winner[uid];
            }
        }else{
            winner[uid] = 1;
        }
    }
    
    // Find User
    for(var i = 0; i < users.length; i++){
        var user = users[i];
        if(user[biggest.key]){
            retObj.winner = user[biggest.key];
        }
    }
    
    // Find Tweet
    for(var i = 0; i < tweets.length; i++){
        var tweet = tweets[i];
        if(tweet[biggest.key]){
            retObj.tweet = tweet[biggest.key];
        }
    }
    return retObj;
}

// Function called when 4 people have signed up
function startGame(socket){
    // Get random trend from trend array
    var trend = trendList[Math.floor(Math.random()*trendList.length)];
    socket.emit('startgame',{"trend" : trend});
    socket.broadcast.emit('startgame',{"trend" : trend});
}


function getTrends(){
    console.log("Getting Trends");
    var httpclient = require("https");
    // Get a random top trending tweet
    var options = {
        host : "api.twitter.com",
        path : "/1/trends/daily.json"
    };
    
    var req = httpclient.request(options, function(response){
        console.log("STATUS: " + response.statusCode);
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
          str += chunk;
        });
        
        response.on('error', function(err){
            console.log("Problem with request: " + err.message);
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            str = JSON.parse(str);
            var firstIndex;
            for(firstIndex in str.trends){
                var hashtags = str.trends[firstIndex]
                for(var i = 0; i < hashtags.length; i++){
                    trendList.push(hashtags[i].name);
                }
                break;
            }
        });
    });
    req.end();
}

// Start express server
http.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

getTrends();


