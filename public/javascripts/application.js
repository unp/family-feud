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
	//////////////////////////////

  socket.on('msg-to-client', function (data) {
    console.log(data);
    
    var new_li = $('<li></li>');
    new_li.text(data["msg"]);
    
    $('ul').append(new_li);
  });
});