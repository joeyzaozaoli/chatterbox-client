var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.roomList = {All: true};
app.friendList = {};

app.init = function() {
  app.fetch();

  // message: user event of changing room -> render view
  $('#roomSelect').change(app.fetch);
  // message: model CRUD -> render view
  setInterval(app.fetch, 10000);
  // message: user event of submitting form -> CRUD model
  $('#send').submit(app.handleSubmit);
  // message: user event of submitting form -> CRUD model -> render view
  $('#send').submit(app.fetch);

  // room: user event of creating room -> CRUD model
  $('#newRoom').click(app.handleCreateRoom);
};

// message: set function to render view
app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    data: {order: '-createdAt'},

    success: function(data) {
      console.log('get success', data);

      var messages = data.results;

      app.displayMessages(messages);

      // room: external event > CRUD model
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
    if (msgObj.roomname === $('#roomSelect').find(':selected').val() || $('#roomSelect').find(':selected').val() === 'All') {
      var $message = app.renderMessage(msgObj);
      $template.append($message);
    }
  });

  return $template;
};

app.renderMessage = function(msgObj) {
  var $template = $(`
    <div class='chat'>
      <span class='text'}>${_.escape(msgObj.text)}</span>
      <span class='username'>${_.escape(msgObj.username)}</span>
      <span>@${_.escape(msgObj.roomname)}</span>
      <span>@${msgObj.createdAt}</span>
    </div>
  `);

  // friend: user event of clicking user name -> CRUD model
  $template.find('.username').click(app.handleUsernameClick);
  if (app.friendList[msgObj.username]) {
    $template.find('.text').addClass('friend');
  }

  return $template;
};

// friend: set function to CRUD model
app.handleUsernameClick = function(event) {
  // friend: model CRUD -> render message view
  app.addFriendToList(event.target.textContent, app.fetch);
};

app.addFriendToList = function(friend, cb) {
  if (app.friendList[friend] === undefined) {
    app.friendList[friend] = true;

    cb();
  }
};

// room: set function to render view
app.displayRooms = function(rooms) {
  $('#roomSelect').empty();

  rooms.forEach(function(room) {
    var $room = app.renderRoom(room);
    $('#roomSelect').append($room);
  });
};

app.renderRoom = function(room) {
  var $template;

  if (room === 'All') {
    $template = $(`
      <option selected>${_.escape(room)}</option>
    `);
  } else {
    $template = $(`
      <option>${_.escape(room)}</option>
    `);
  }

  return $template;
};

// message: set function to CRUD model
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

// room: set function to CRUD model
app.handleCreateRoom = function() {
  var newRoom = prompt('Please name the new room:');
  // room: model CRUD -> render view
  app.addRoomToList(newRoom, app.displayRooms);
};

app.updateRoomList = function(msgArr) {
  msgArr.forEach(function(msgObj) {
    // room: model CRUD -> render view
    app.addRoomToList(msgObj.roomname, app.displayRooms);
  });
};

app.addRoomToList = function(room, cb) {
  if (app.roomList[room] === undefined) {
    app.roomList[room] = true;

    cb(Object.keys(app.roomList));
  }
};

$(document).ready(function() {
  app.init();
});