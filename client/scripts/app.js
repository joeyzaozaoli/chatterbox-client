var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.roomList = [];
app.friendList = [];

app.init = function() {
  app.fetch();
  $('#roomSelect').change(app.fetch);
  setInterval(app.fetch, 10000);

  $('#newRoom').click(function() {
    var newRoom = prompt("Please name the new room:");
    app.addRoomToList(newRoom);
  });

  $('#send').submit(app.handleSubmit);
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
        if (msgObj.roomname === $('#roomSelect').find(':selected').val()) {
          app.renderMessage(msgObj);
          if (app.friendList.includes(msgObj.username)) {
            $('.text').addClass('friend');
          }
        }
        app.addRoomToList(msgObj.roomname);
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
      <span class="text">${msgObj.text}</span>
      <span class="userName">${msgObj.username}</span>
      <span>@${msgObj.roomname}</span>
      <span>@${msgObj.createdAt}</span>
    </div>
  `);

  $('.userName').click(function(event) {
    app.addFriendToList(event.target.textContent);
  });
};

app.addRoomToList = function(room) {
  if (!app.roomList.includes(room)) {
    app.roomList.push(room);
    app.renderRoom(room);
  }
};

app.renderRoom = function(room) {
  $('#roomSelect').append(`
    <option>${room}</option>
  `);
};

app.handleSubmit = function(event) {
  event.preventDefault();
  var message = {};
  message.text = $('#message').val();
  message.username = window.location.search.slice(10);
  message.roomname = $('#roomSelect').find(':selected').val();
  app.send(message);
  $('#message').val('');
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

app.addFriendToList = function(friend) {
  if (!app.friendList.includes(friend)) {
    app.friendList.push(friend);
  }
};

$(document).ready(function() {
  app.init();
});