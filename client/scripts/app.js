var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.roomList = [];

app.init = function() {
  app.fetch();
  setInterval(app.fetch, 600000);
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    data: {order: '-createdAt'},
    success: function(data) {
      console.log('get success', data);

      app.clearMessages();
      _.each(data.results, function(msgObj) {
        app.renderMessage(msgObj);
        if (!app.roomList.includes(msgObj.roomname)) {
          app.roomList.push(msgObj.roomname);
        }
      });
      _.each(app.roomList, function(room) {
        app.renderRoom(room);
      });
    },

    error: function(data) {
      console.log('get failure', data);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.renderMessage = function(msgObj) {
  $('#chats').append(`
    <div>
      <span>${msgObj.text}</span>
      <span>#${msgObj.username}</span>
      <span>@${msgObj.roomname}</span>
      <span>@${msgObj.createdAt}</span>
    </div>
  `);
};

app.renderRoom = function(room) {
  $('#roomSelect').append(`
    <option>${room}</option>
  `);
};

app.send = function(msgObj) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(msgObj),
    contentType: 'application/json',
    success: function() {
      console.log('send success');
    },
    error: function() {
      console.log('send failure');
    }
  });
};

$(document).ready(function() {
  app.init();

  $('#new-msg').submit(function(event) {
    event.preventDefault();
    var message = {};
    message.text = $('#new-msg-body').val();
    message.roomname = $('#rooms').find(':selected').val();
    app.send(message);
  });
});