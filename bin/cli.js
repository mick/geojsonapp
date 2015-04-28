#!/usr/bin/env node
var fs = require('fs');
var dnode = require('dnode');
var argv = require('minimist')(process.argv.slice(2));
var electron = require('electron-prebuilt')
var proc = require('child_process')
var net = require('net');


//check to see if geojson.app is running. if not start it.

var startingApp = false;
var retry = 0;

function connect() {
    net.connect(5004, function(err){
        if(err) console.error(err);
        remoteCommands();
    }).on('error', function(e) {

        if(!startingApp) {
            var child = proc.spawn(electron, [__dirname+'/../'], {detached:true});
            startingApp = true;
            return setTimeout(connect, 400).unref();
        }
        if(retry > 50) {
            return console.error('Cant connect to geojson.app', e);
        }
        retry++;
        setTimeout(connect, 100).unref();
    }).unref();

}
connect();

function remoteCommands() {
    var d = dnode.connect(5004);
    d.on('remote', function (remote) {

        var data = '';
        if(argv._.length) {
            data = fs.readFileSync(argv._[0], 'utf8');
            remote.open({data:data, clear:argv.noclear}, function (s) {
                d.end();
            });
        } else {
            data = '';
            var first = true
            process.stdin.on('readable', function() {
                var chunk = this.read();
                if (chunk === null ) {
                    if(!first && data === '') { d.end(); }
                    if(first) { d.end(); process.exit(0); }

                } else {
                   data += chunk;
                }
                first = false;
            });
            process.stdin.on('end', function() {
                remote.open({data:data, clear:argv.noclear}, function (s) {
                    d.end();
                });
            });
        }
    }).on('fail', console.error);
}
