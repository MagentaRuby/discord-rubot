'use strict';

const splitArgs = require('splitargs');
const parseArgs = require('minimist');

const cmdpattern = /^(\S+)(?:\s+(.+?)\s*)?$/;

var _fileMap = new WeakMap();
var _aliasMap = new WeakMap();

class CommandMap {
    constructor(commandsPath, options) {
        options = options || {};
        for (var attrname in options) {
            this[attrname] = options[attrname];
        }
        this.args = [{
            name: "cmd"
        }, {
            name: "args",
            optional: true,
            greedy: true
        }];
        _fileMap.set(this, {});
        _aliasMap.set(this, {});

        var self = this;
        require("fs").readdirSync(commandsPath).forEach(function(file) {
            if (file != "index.js") {
                var path = require("path").join(commandsPath, file);
                delete require.cache[require.resolve(path)];
                var cmd = require(path);

                if (cmd.aliases == null || !Array.isArray(cmd.aliases)) {
                    cmd.aliases = [file.replace(/\.js$/, '')];
                }

                _fileMap.get(self)[file] = cmd;
                for (var i = 0; i < cmd.aliases.length; i++) {
                    _aliasMap.get(self)[cmd.aliases[i]] = file;
                }
            }
        });
    }

    get(alias) {
        var fileMap = _fileMap.get(this);
        var aliasMap = _aliasMap.get(this);
        if (alias in aliasMap) {
            var file = aliasMap[alias];
            if (file in fileMap) {
                return fileMap[file];
            }
        }
        return null;
    }

    run() {
        var args = Array.prototype.slice.call(arguments);
        var context = args.shift();
        var alias;

        if (args.length == 1) {
            var r = cmdpattern.exec(args[0]);

            if (r !== null) {
                alias = r[1];
                args = r[2] ? splitArgs(r[2]) : [];
            } else {
                context.send("Invalid command. Type /help for help.");
                return;
            }
        } else {
            alias = args.shift();
        }

        var cmd;

        if (alias == null || alias == "help" || alias == "?") {
            cmd = this.help();
        } else {
            cmd = this.get(alias);
        }

        if (cmd !== null) {
            context.permission.child(cmd.aliases[0], function(permission) {
                if (permission != null && permission.allow) {
                    console.log(context.src.username + ' has permission: ' + permission.path);
                    if (cmd.opts instanceof Object) {
                        var unknownOpts = [];
                        if (cmd.opts.unknown == null) {
                            cmd.opts.unknown = function(option) {
                                unknownOpts.push(option);
                                return false;
                            }
                        }
                        var vargs = parseArgs(args, cmd.opts);
                        if (unknownOpts.length > 0) {
                            context.send("Unknown options: "+unknownOpts.join(", "));
                            return;
                        }
                        args = vargs._;
                        delete vargs._;
                        context.opts = vargs;
                    }

                    cmd.run.apply(cmd, [context].concat(args));
                } else {
                    console.log(context.src.username + ' was denied permission: ' + permission.path);
                    context.send("You don't have permission to execute this command.");
                    return false;
                }
            });
        } else {
            context.send("Unknown command. Type /help for help.");
        }
    }

    help() {
        var fileMap = _fileMap.get(this);
        return {
            aliases: ["help", "?"],
            run: function(context) {
                var message = "```\r\n";

                for (var file in fileMap) {
                    if (fileMap.hasOwnProperty(file)) {
                        var cmd = fileMap[file];

                        message += cmd.aliases.join(", ") + "\r\n";
                    }
                }
                context.send(message + "```");
            }
        };
    }

}

module.exports = CommandMap;
