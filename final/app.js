/* globals rivets, jQuery */

(function(global, rivets, $, WebSocket) {
    if (!WebSocket) throw new Error('Sorry, but your browser doesn\'t support WebSockets.');
    var app, connection = new WebSocket('ws://127.0.0.1:1337');
    app = {
        view: $('#app'),
        scope: {
            messages: [],
            status: 'Connecting...',
            sendMessage: function(e) {
                if (!scope.message) {
                    return;
                }
                // send the message as an ordinary text
                connection.send(scope.message);
                // disable the input field to make the user wait until server
                // sends back response
                scope.connected = false;

                // we know that the first message sent from a user their name
                if (!scope.username) {
                    scope.username = scope.message;
                }
                scope.message = '';
            },
            wordOccurrences: function() {
                ocurrences = {others: 0};
                scope.messages.forEach(function(message) {
                    var words = message.text.replace(/[^a-zA-Z0-9\s\:]+/g, '').split(/\s+/);
                    words.forEach(function(word) {
                        if (ocurrences[word]) {
                            ocurrences[word] += 1;
                        }
                        else {
                            if (Object.keys(ocurrences).length < 7) {
                                ocurrences[word] = 1;
                                return;
                            }
                            ocurrences.others += 1;
                        }
                    });
                });
                return ocurrences;
            },
        },
        init: function() {
            "use strict";
            var self = this,
                scope = self.scope;

            self.defineFormatters();
            self.defineBinders();
            self.defineComponents();

            rivets.bind(self.view, scope);

            connection.onopen = function () {
                // first we want users to enter their names
                scope.connected = true;
                scope.status = 'Choose name';
            };

            connection.onerror = function (error) {
                // just in there were some problems with conenction...
                scope.error = 'Sorry, but there\'s some problem ' +
                              'with your connection or the server is down.';
            };

            // incoming messages
            connection.onmessage = function (message) {
                var json = JSON.parse(message.data);

                if (json.type === 'color') {
                    // first response from the server with user's color
                    scope.connected = true;
                    scope.status = '';
                    scope.usercolor = json.data;
                    // from now user can start sending messages
                } else if (json.type === 'history') { // entire message history
                    // insert every single message to the chat window
                    for (var i=0; i < json.data.length; i++) {
                        self.addMessage(json.data[i].author, json.data[i].text,
                                   json.data[i].color, new Date(json.data[i].time));
                    }
                } else if (json.type === 'message') { // it's a single message
                    scope.connected = true; // let the user write another message
                    self.addMessage(json.data.author,
                                    json.data.text,
                                    json.data.color,
                                    new Date(json.data.time));
                } else {
                    console.log('Hmm..., I\'ve never seen JSON like this: ', json);
                }
            };
        },
        addMessage: function(author, message, color, dt) {
             var self = this;
             self.scope.messages.push({
                user: author,
                color: color,
                time: dt,
                text: message,
             });
        },
        defineFormatters: function() {
            rivets.formatters.time = function(dt) {
                return moment(dt).fromNow();
            };
            rivets.formatters.color = function(value) {
                return 'color: ' + value;
            };
            rivets.formatters.not = function(value) {
                return !value;
            };
            rivets.formatters.void = function(value) {
                return value;
            };
            rivets.formatters.toHTML = function(value) {
                return value ? value.replace(/\:kappa\:/g, '<img src="kappa.png">') : '';
            };
        },
        defineBinders: function() {
            rivets.binders['on-enter-key-press'] = function(el) {
                var rivetsView = this,
                    $el = $(el);
                $el.on('keypress', function(event) {
                    if(event.keyCode === 13) {
                        $el.blur();
                        rivetsView.observer.value()(event);
                    }
                });
            };
            rivets.binders['scroll-bottom'] = function(el) {
                setTimeout(function() {
                    $(el).scrollTop($(el)[0].scrollHeight);
                });
            };
            rivets.binders.focus = function(el) {
                $(el).focus();
            };
            rivets.binders['radar-chart'] = function(el, data) {
                var radarChartData = {
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: "Word Counter",
                            fillColor: "rgba(220,220,220,0.2)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: Object.keys(data).map(function(k){return data[k];})
                        }
                    ]
                };
                new Chart(el.getContext("2d")).Radar(radarChartData);
            };
            rivets.binders['from-now'] = function(el, value) {
                var rivetsView = this;
                el.innerText = moment(value).fromNow();
                setInterval(function() {
                    el.innerText = moment(rivetsView.observer.value()).fromNow();
                }, 10000);
            };
        },
        defineComponents: function() {
            rivets.components['chat-messages'] = {
                // Return the template for the component.
                template: function() {
                    return '<p rv-each-msg="messages"><span rv-style="msg.color | color">{ msg.user }</span> @ <span rv-from-now="msg.time"></span>: <span rv-html="msg.text | toHTML"></span></p>';
                },
                initialize: function(el, data) {
                    return {
                        messages: scope.messages
                    };
                }
            };
        }
    };
    global.scope = app.scope;
    global.app = app;
})(window, rivets, jQuery, window.WebSocket || window.MozWebSocket);

app.init();
