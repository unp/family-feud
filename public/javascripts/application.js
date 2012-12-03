$(function(){
  var socket = io.connect(location.href);
  
  $('input').bind("keydown", function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
     if(code == 13) { //Enter keycode
     	socket.emit('familyAnswer',$("#answer").val());
		console.log('Submitting' + $('#answer').val);
     }
  });

  
  //$('button').click(familyAnswer($('#answer').val));
  
  function sendMessage(){
    var msg = $('input').val();
    $('input').val("");
    socket.emit('msg-to-server', { msg: msg });
  }
  
	//////Code that matters///////
	socket.on('updateBoard', function(data) {
		var div_id = "#answer" + data.index;
		var score_id = "#score" + data.family;
		var updatedHtml = '<div class="answer">' + data.answer + '</div><div class="points">' + data.points + '</div>';
		$(div_id).html(updatedHtml);
		$(score_id).html(data.score);
		$(div_id).addClass("animated flipInX");
	});  

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
        $(strikes_id).html("xxx");
        $(opponent_strikes_id).html("");
        break;
      default:
        console.log("not supposed to happen");
        break;
    }
  });

	//////////////////////////////

  socket.on('msg-to-client', function (data) {
    console.log(data);
    
    var new_li = $('<li></li>');
    new_li.text(data["msg"]);
    
    $('ul').append(new_li);
  });
});