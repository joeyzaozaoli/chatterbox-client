var app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  app.fetch();
  setInterval(app.fetch, 10000);
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    success: function(data) {
      console.log('get success', data);
      app.clearMessages();
      _.each(data.results, function(msgObj) {
        app.renderMessage(msgObj);
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
    </div>
  `);
};

app.send = function(msgObj) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(msgObj),
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