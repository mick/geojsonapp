#!/usr/bin/env node
var fs = require('fs');
var dnode = require('dnode');
var argv = require('minimist')(process.argv.slice(2));
var d = dnode.connect(5004);

//check to see if geojson.app is running. if not start it.
d.on('remote', function (remote) {
    if (!process.stdin.isTTY) {
        var data = '';
        process.stdin.on('data', function(chunk){
            data += chunk;
        });
        process.stdin.on('end', function(){
            remote.open({data:data, clear:argv.clear}, function (s) {
                d.end();
            });
        });

    } else {
        if(argv._.length) {
            var data = fs.readFileSync(argv._[0], 'utf8');
            remote.open({data:data, clear:argv.clear}, function (s) {
                d.end();
            });
        }
    }
});
