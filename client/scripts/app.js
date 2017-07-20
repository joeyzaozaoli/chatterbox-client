var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.roomList = [];
app.friendList = [];

app.init = function() {
  // render on initialization
  app.fetch();
  // re-render on user event
  $('#roomSelect').change(app.fetch);
  // re-render on model change
  setInterval(app.fetch, 5000);

  // update model on user event
  $('#send').submit(app.handleSubmit);
  // update model on user event
  $('#newRoom').click(function() {
    var newRoom = prompt("Please name the new room:");
    app.addRoomToList(newRoom);
  });
};

// render definition
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
        }
        app.addRoomToList(msgObj.roomname);
      });
    },

    error: function(data) {
      console.log('get failure', data);
    }
  });
};

// render definition - helper
app.clearMessages = function() {
  $('#chats').empty();
};

// render definition - helper
app.renderMessage = function(msgObj) {
  var $template = $(`
    <div class="chat">
      <span class="text"}>${_.escape(msgObj.text)}</span>
      <span class="username">${_.escape(msgObj.username)}</span>
      <span>@${_.escape(msgObj.roomname)}</span>
      <span>@${msgObj.createdAt}</span>
    </div>
  `);

  $('#chats').append($template);

  $('.username').click(app.handleUsernameClick);

  if (app.friendList.includes(msgObj.username)) {
    $template.find('.text').addClass('friend');
  }
};

// render definition - helper
app.handleUsernameClick = function(event) {
  app.addFriendToList(event.target.textContent);
};

// render definition - helper
app.addFriendToList = function(friend) {
  if (!app.friendList.includes(friend)) {
    app.friendList.push(friend);
  }
};

// render definition - helper
app.addRoomToList = function(room) {
  if (!app.roomList.includes(room)) {
    app.roomList.push(room);
    app.renderRoom(room);
  }
};

// render definition - helper
app.renderRoom = function(room) {
  $('#roomSelect').append(`
    <option>${room}</option>
  `);
};

// update definition
app.handleSubmit = function(event) {
  event.preventDefault();
  var message = {};
  message.text = $('#message').val();
  message.username = window.location.search.slice(10);
  message.roomname = $('#roomSelect').find(':selected').val();
  app.send(message);
  $('#message').val('');
};

// update definition (cont'd)
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
});