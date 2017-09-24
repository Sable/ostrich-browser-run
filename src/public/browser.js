console.log('configuring requirejs')
requirejs.config({
    baseUrl: '../'
})
var server = {}
console.log('waiting for connect to be called')

function connect() {
    console.log('initializing connection')
    var browser = {
        log: console.log.bind(console)
    }

    browser.log("Connecting to websocket")
    var ws = new WebSocket("ws://localhost:8080/socket")
    var ___loadcb = null;
    ___loadcb = function () {}
    server.loadcsv = function (path, cb) {
        ws.send(JSON.stringify({
            "type": "load",
            "path": path
        }))
        ___loadcb = function (data) {
            if (!data) {
                server.error("loadcsv: invalid path " + path)
                return
            }

            browser.log('Converting data: ' + data)
            var matrix = null
            var lines = data.split('\n')
            for (var l = 0; l < lines.length; ++l) {
                var numbers = lines[l].split(',')
                for (var n = 0; n < numbers.length; ++n) {
                    if (matrix === null) {
                        matrix = new Float64Array(lines.length * numbers.length)
                    }
                    matrix[numbers.length * l + n] = Number.parseFloat(numbers[n])
                }
            }
            cb(matrix)
        }
    }

    server.save = function (path, data) {
        ws.send(JSON.stringify({
            "type": "save",
            "path": path,
            "data": data.toString()
        }))
    }

    server.done = function () {
        ws.send(JSON.stringify({
            "type": "done"
        }))
    }



    ws.onopen = function () {
        browser.log("Connection opened");
        server.log = function (s) {
            try {
                var temp = JSON.parse(s);
                if ((typeof temp === 'undefined' ? 'undefined' : _typeof(temp)) === 'object') {
                    browser.log("sent to server: " + s);
                    ws.send(JSON.stringify({
                        'type': 'output',
                        'output': s
                    }));
                } else {
                    browser.log(s);
                }
            } catch (e) {
                browser.log(s)
            }
        }

        server.error = function (s) {
            ws.send(JSON.stringify({
                "type": "error",
                "message": s
            }))
            browser.log("sent to server error: " + s)
        }

        ws.send(JSON.stringify({
            'type': 'status',
            'status': 'connected'
        }))
        console.log = server.log
    };

    ws.onmessage = function (evt) {
        function dispatch(msg) {
            try {
                browser.log("Received msg '" + msg.type + "'")
                if (msg.type === 'eval') {
                    browser.log('Browser received cmd: ' + JSON.stringify(msg))
                    try {
                        // eval(msg.code)
                        runBenchmark(msg.code.dependencies,msg.code.expressions)
                    } catch (e) {
                        ws.send(JSON.stringify({
                            'type': 'error',
                            'message': e.toString()
                        }))
                    }
                } else if (msg.type === 'loadresult') {
                    browser.log('Received loadresult')
                    ___loadcb(msg.data)
                } else if (msg.type === 'close') {
                    window.close()
                } else if (msg.type === 'done') {
                    ws.send(JSON.stringify({
                        'type': 'done'
                    }))
                } else {
                    browser.log('Message not understood: ' + evt.data)
                }
            } catch (e) {
                browser.log(e)
            }
        }

        try {
            var msg = JSON.parse(evt.data);
        } catch (e) {
            server.error('Invalid JSON format for message: ' + evt.data)
        }

        dispatch(msg)
    }
    ws.onclose = function () {
        browser.log("Connection closed");
    };
}

function runBenchmark(dependencies,expressions)
{
    requirejs(dependencies, function (args, prng, benchmark) { 
    Math.random = prng.random;
    if(expressions) eval(expression);
    try {
      if (typeof runner === 'function' ) {
        Promise.resolve(runner.apply(null, args)).then(function(resolve){
          if (runner.toString().indexOf('server.done') === -1) {
              server.done();
          }
        }).catch(function(e){
            alert(e);
            server.log("Error running benchmark: ",e,"asda")
            server.error(e.stack)
        });
      }
      else if (typeof run === 'function' ) {
        Promise.resolve(run.apply(null, args)).then(function(resolve){
          if (run.toString().indexOf('server.done') === -1) {
              server.done();
          }
        }).catch(function(e){
            server.log("Error running benchmark: ",e)
            server.error(e.stack)
        });
      }
      else if (typeof benchmark  === 'object' ) {
        if (benchmark.hasOwnProperty('runner')) {
           Promise.resolve(benchmark.runner.apply(null, args)).then(function(resolve){
              if (benchmark.runner.toString().indexOf('server.done') === -1) {
                  server.done();
              }
          }).catch(function(e){
              server.log("Error running benchmark: ",e)
              server.error(e.stack)
          });
        }
        else if (benchmark.hasOwnProperty('run')) {
           Promise.resolve(benchmark.run.apply(null, args)).then(function(resolve){
              if (benchmark.run.toString().indexOf('server.done') === -1) {
                  server.done();
              }
          }).catch(function(e){
              server.log("Error running benchmark: ",e)
              server.error(e.stack)
          });
        }
      }
    } catch (e) {
      server.log(e)
      server.error(e.stack)
    }})
}