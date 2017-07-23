var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.roomList = {};
app.friendList = {};

app.init = function() {
  // render view on initialization
  app.fetch();

  // render view on user event: change dropdown selection
  $('#roomSelect').change(app.fetch);
  // render view on user event: submit form
  $('#send').submit(app.fetch);
  // render view on model change
  setInterval(app.fetch, 10000);

  // CRUD model on user event: submit form
  $('#send').submit(app.handleSubmit);
  // CRUD model on user event: create room
  $('#newRoom').click(function() {
    var newRoom = prompt("Please name the new room:");
    if (app.roomList[newRoom] === undefined) {
      app.addRoomToList[newRoom] = true;
    }
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
          app.displayMessage(msgObj);
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
app.displayMessage = function(msgObj) {
  var template = app.renderMessage(msgObj);
  $('#chats').append(template);

  // CRUD model on user event: click user name
  $('.username').click(app.handleUsernameClick);
  if (app.friendList[msgObj.username]) {
    template.find('.text').addClass('friend');
  }
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

  return $template;
};

// render definition - helper
app.handleUsernameClick = function(event) {
  app.addFriendToList(event.target.textContent);
};

// render definition - helper
app.addFriendToList = function(friend) {
  if (app.friendList[friend] === undefined) {
    app.friendList[friend] = true;
  }
};

// render definition - helper
app.addRoomToList = function(room) {
  if (app.roomList[room] === undefined) {
    app.roomList[room] = true;
    app.renderRoom(room);
  }
};

// render definition - helper
app.renderRoom = function(room) {
  $('#roomSelect').append(`
    <option>${_.escape(room)}</option>
  `);
};

// CRUD definition
app.handleSubmit = function(event) {
  event.preventDefault();
  var message = {};
  message.text = $('#message').val();
  message.username = window.location.search.slice(10);
  message.roomname = $('#roomSelect').find(':selected').val();
  app.send(message);
  $('#message').val('');
};

// CRUD definition (cont'd)
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