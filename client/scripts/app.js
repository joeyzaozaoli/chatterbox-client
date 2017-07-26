var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.roomList = {};
app.friendList = {};

app.init = function() {
  app.fetch();

  // message model CRUD -> render message view
  setInterval(app.fetch, 10000);
  $('#send').submit(app.fetch);
  // user event: change room -> render message view
  $('#roomSelect').change(app.fetch);

  // user event: submit form -> CRUD message model
  $('#send').submit(app.handleSubmit);
  // user event: create room -> CRUD room model
  $('#newRoom').click(app.handleCreateRoom);
};

// set function to render message view
app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    data: {order: '-createdAt'},

    success: function(data) {
      console.log('get success', data);

      var messages = data.results;

      app.displayMessages(messages);

      // outside event -> CRUD room model
      app.updateRoomList(messages);
    },

    error: function(data) {
      console.log('get failure', data);
    }
  });
};

app.displayMessages = function(msgArr) {
  $('#chats').empty();

  var $template = app.renderMessages(msgArr);
  $('#chats').append($template);
};

app.renderMessages = function(msgArr) {
  var $template = $('<div></div>');

  msgArr.forEach(function(msgObj) {
    if (msgObj.roomname === $('#roomSelect').find(':selected').val()) {
      var $message = app.renderMessage(msgObj);
      $template.append($message);
    }
  });

  return $template;
};

app.renderMessage = function(msgObj) {
  var $template = $(`
    <div class="chat">
      <span class="text"}>${_.escape(msgObj.text)}</span>
      <span class="username">${_.escape(msgObj.username)}</span>
      <span>@${_.escape(msgObj.roomname)}</span>
      <span>@${msgObj.createdAt}</span>
    </div>
  `);

  // user event: click user name -> CRUD friend model
  $template.find('.username').click(app.handleUsernameClick);
  if (app.friendList[msgObj.username]) {
    $template.find('.text').addClass('friend');
  }

  return $template;
};

// set function to CRUD friend model
app.handleUsernameClick = function(event) {
  app.addFriendToList(event.target.textContent);
};

app.addFriendToList = function(friend) {
  if (app.friendList[friend] === undefined) {
    app.friendList[friend] = true;

    // friend model CRUD -> render message view
    app.fetch();
  }
};

// set function to render room view
app.displayRooms = function(rooms) {
  $('#roomSelect').empty();

  rooms.forEach(function(room) {
    var $room = app.renderRoom(room);
    $('#roomSelect').append($room);
  });
};

app.renderRoom = function(room) {
  var $template = $(`
    <option>${_.escape(room)}</option>
  `);

  return $template;
};

// set function to CRUD message model
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

// set function to CRUD room model
app.handleCreateRoom = function() {
  var newRoom = prompt("Please name the new room:");
  app.addRoomToList(newRoom);
};

app.updateRoomList = function(msgArr) {
  msgArr.forEach(function(msgObj) {
    app.addRoomToList(msgObj.roomname);
  });
};

app.addRoomToList = function(room) {
  if (app.roomList[room] === undefined) {
    app.roomList[room] = true;

    // room model CRUD -> render room view
    app.displayRooms(Object.keys(app.roomList));
  }
};

$(document).ready(function() {
  app.init();
});