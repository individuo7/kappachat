/* globals rivets, jQuery */

(function(global, rivets, $, WebSocket) {
    if (!WebSocket) throw new Error('Sorry, but your browser doesn\'t support WebSockets.');
    var app, connection = new WebSocket('ws://127.0.0.1:1337');
    app = {
        view: $('#app'),
        scope: {},
        init: function() {
            "use strict";
            var self = this,
                scope = self.scope;

            self.defineFormatters();
            self.defineBinders();
            self.defineComponents();
            
            connection.onopen = function () {
                // first we want users to enter their names
            };

            connection.onerror = function (error) {
                // just in there were some problems with conenction...
                alert('Sorry, but there\'s some problem ' +
                      'with your connection or the server is down.');
            };

            // incoming messages
            connection.onmessage = function (message) {
                var json = JSON.parse(message.data);

                if (json.type === 'color') {
                    // first response from the server with user's color
                    // from now user can start sending messages
                } else if (json.type === 'history') { // entire message history
                    // insert every single message to the chat window
                    for (var i=0; i < json.data.length; i++) {
                        /*
                            addMessage
                                json.data[i].author
                                json.data[i].text
                                json.data[i].color,
                                new Date(json.data[i].time)
                        */
                    }
                } else if (json.type === 'message') { // it's a single message
                    scope.connected = true; // let the user write another message
                    /*
                        addMessage
                            json.data.author
                            json.data.text
                            json.data.color,
                            new Date(json.data.time)
                    */
                } else {
                    console.log('Hmm..., I\'ve never seen JSON like this: ', json);
                }
            };
        },
        addMessage: function(author, message, color, dt) {
             //
        },
        defineFormatters: function() {},
        defineBinders: function() {},
        defineComponents: function() {}
    };
    global.scope = app.scope;
    global.app = app;
})(window, rivets, jQuery, window.WebSocket || window.MozWebSocket);

app.init();
