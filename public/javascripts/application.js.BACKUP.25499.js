$(function(){
	
	function isiPhone(){
		return (
	        (navigator.platform.indexOf("iPhone") != -1) ||
	        (navigator.platform.indexOf("iPod") != -1)
	    );
	}
	if(isiPhone()){
	    window.location = "http://www.google.com";
	}

  // Desktop Version
  var socket = io.connect(location.href);

  $("#login").fadeIn();
  $("#wait").hide();
  $("#game").hide();
  $("#end").hide();
  $("#mobile").hide();

  $("#submitUsername").click(function(){
    console.log("Sending username");
    var name = $("#username").val();
    socket.emit("signup",name);
  });
  
  $("input").bind("keydown", function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
     if(code == 13) { //Enter keycode
     	socket.emit('familyAnswer',$("#answer").val());
      $('input').val("");
		console.log('Submitting ' + $('#answer').val);
     }
  });

  $("#submit").click(function(){
    console.log("submit clicked");
    socket.emit('familyAnswer',$("#answer").val());
    $('input').val("");
    console.log('Submitting ' + $('#answer').val);
  });

  $("#pass").click(function(){
    console.log("pass clicked");
    socket.emit("pass");
  });

	socket.on('updateBoard', function(data) {
		var div_id = "#answer" + data.index;
		var score_id = "#score" + data.family;
		var updatedHtml = '<div class="answer">' + data.answer + '</div><div class="points">' + data.points + '</div>';
		$(div_id).html(updatedHtml);
		$(score_id).html(data.score);
		$(div_id).addClass("animated flipInX");
	});
	
  socket.on('hideTextbox', function(){
    $("#answer").hide();
    $("#submit").hide();
    $("#pass").hide();
  });

  socket.on('showTextbox', function(){
    $("#answer").fadeIn();
    $("#submit").fadeIn();
    $("#pass").fadeIn();
  });

	socket.on('displayQuestion', function(question) {
		$('#question').html(question);
		console.log('question');
	});

  socket.on('waiting', function(){
    $("#login").fadeOut();
    $("#wait").fadeIn();
  });

  socket.on('start', function(users){
    console.log(users);
    $("#wait").fadeOut();
    $("#login").fadeOut();
    $("#game").fadeIn();
    $("#team1").html(users[0]);
    $("#team2").html(users[1]);
  })

  socket.on('endGame', function(){
    $("#game").fadeOut();
    $("#end").fadeIn();
  })

  socket.on('updateStrikes', function(data) {
    var strikes_id = "#strikes" + data.family;
    var opponent_family = (data.family == 1) ? 2 : 1;
    var opponent_strikes_id = "#strikes" + opponent_family;
    switch (data.strikes)
    {
      case 0:
        $(strikes_id).html("");
        break;
      case 1:
        $(strikes_id).html("x");
        break;
      case 2:
        $(strikes_id).html("xx");
        break;
      case 3:
        console.log("case 3");
        $(strikes_id).html("xxx");
        $("#team" + data.family).css("color", "blue");
        $("#team" + opponent_family).css("color", "red");
        break;
      default:
        console.log("not supposed to happen");
        break;
    }
  });

  socket.on('updateFamily', function(data){
    console.log("update family called");
    console.log("data is " + data);
    var family_id = "#team" + data;
    console.log("family_id is " + family_id);
    var opponent_family = (data == 1) ? 2 : 1;
    var opponent_id = "#team" + opponent_family;
    $(family_id).css("color", "red");
    $(opponent_id).css("color", "blue");
  });


  // Mobile Version
  function isiPhone(){
    return (
          (navigator.platform.indexOf("iPhone") != -1) ||
          (navigator.platform.indexOf("iPod") != -1)
      );
  }

  if(isiPhone()){
      $("#login").hide();
      $("#wait").hide();
      $("#game").hide();
      $("#end").hide();
      $("#mobile").show();
  }

});