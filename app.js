
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/slash')
  , http = require('http')
  ,	mongoose = require('mongoose')
  , db = mongoose.connect('mongodb://nodejitsu_unp:u4r5mosasltba0i8vortsg92d9@ds043947.mongolab.com:43947/nodejitsu_unp_nodejitsudb5991014428')
  , questionSchema = mongoose.Schema({
		id: 'Number',
		question: 'String',
		1:{'answer':'String', 'points':'Number'},
		2:{'answer':'String', 'points':'Number'},
		3:{'answer':'String', 'points':'Number'},
		4:{'answer':'String', 'points':'Number'},
		5:{'answer':'String', 'points':'Number'},
		6:{'answer':'String', 'points':'Number'}
	})
  , Question = db.model("Question", questionSchema)
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

// Seed the DB
var q1 = new Question({
	id:1,
	question:'Name Something People Like Doing when Listening to Music',
	1:{'answer':'Cleaning', 'points':21}, 
	2:{'answer':'Exercising', 'points':18},
	3:{'answer':'Singing', 'points':18},
	4:{'answer':'Gardening', 'points':12},
	5:{'answer':'Eating', 'points':10},
	6:{'answer':'Dancing', 'points':8}});

q1.save(function (err, q1) {
	if (err){ 
		console.log("Failed to save.");
	}
});

/* SOCKET.IO FUNCTIONS */
var users = [];
var userKey = 0;
var topAnswers = {};
var question = "";

Question.findOne({id:1}, function (err, q){
	if(err) {
		console.log("Failed to find record.");
	}
	question = q.question;
	for(var i = 1; i <= 6; i++){
		var answer = q[i]["answer"];
		var points = q[i]["points"];
		var obj = {};
		obj[answer] = points;
		topAnswers[i] = obj;
	}
	console.log(topAnswers);
	console.log(question);
});

var families = {"1":{"currStrikes":0, "score":0}, "2":{"currStrikes":0, "score":0}};
var currFamily = 1;
io.sockets.on('connection', function(socket){
  socket.emit('displayQuestion', question);
  socket.emit('hideTextbox');
    socket.on('familyAnswer', function(answer) {
        // Correct Answer
        for(i in topAnswers){
            if(answer in topAnswers[i]){
                families[currFamily].score += topAnswers[i][answer];
                socket.emit('updateBoard',{"answer":answer,"points":topAnswers[i][answer], "index":i, "family":currFamily, "score":families[currFamily].score});
                socket.broadcast.emit('updateBoard',{"answer":answer,"points":topAnswers[i][answer], "index":i, "family":currFamily, "score":families[currFamily].score});
                return;
            }
        }
        // Incorrect Answer
        families[currFamily].currStrikes++;
        console.log(currFamily + " has " + families[currFamily].currStrikes + " strikes.");
        socket.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
        socket.broadcast.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
        if (families[currFamily].currStrikes == 3){
            if (currFamily == 2){
              socket.emit('endGame');
              socket.broadcast.emit('endGame');
              return;
            }
            socket.emit('hideTextbox');
            socket.broadcast.emit('showTextbox');
            swapFamily();
            console.log("current family is now " + currFamily);
        }
    });

    // Signup Listener
    socket.on('signup', function(user){
        userKey++;
        users.push(user);
        // Check if were exactly 2 users
        if(users.length == 2){
            socket.broadcast.emit('showTextbox');
            socket.emit('start', users);
            socket.broadcast.emit('start', users);
        }
        else{
            socket.emit('waiting');
        }
    });

    socket.on("pass", function(){
      if (currFamily == 2){
        socket.emit('endGame');
        socket.broadcast.emit('endGame');
        return;
      }
      families[currFamily].currStrikes = 0;
      socket.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
      socket.broadcast.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
      socket.emit('hideTextbox');
      socket.broadcast.emit('showTextbox');
      swapFamily();
      families[currFamily].currStrikes = 0;
      console.log("pass called. current family is " + currFamily);
      socket.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
      socket.broadcast.emit('updateStrikes', {"family":currFamily, "strikes":families[currFamily].currStrikes});
      socket.emit('updateFamily', currFamily);
      socket.broadcast.emit('updateFamily', currFamily);
    });    

    socket.on("addQuestion", function(question){
      var q2 = new Question(JSON.stringify(eval("(" + question + ")")));
      q2.save(function (err, q2) {
        if (err){ 
          console.log("Failed to save.");
        }

      });
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

