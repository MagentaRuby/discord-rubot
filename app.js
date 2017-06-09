global.lib = function(name) {
    return require(__dirname + '/lib/' + name);
}

const JSON5 = require('json5-utils');
const Context = lib('context.js');
const UserError = lib('usererror.js');

var api = {
    matchFilter: function(obj, filter) {
        // Create arrays of property names
        var filterProps = Object.getOwnPropertyNames(filter);

        for (var i = 0; i < filterProps.length; i++) {
            var propName = filterProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (obj[propName] instanceof Object && filter[propName] instanceof Object) {
                return matchFilter(obj[propName], filter[propName]);
            } else if (obj[propName] !== filter[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    },
    sortRoles: function(roles) {
        return roles.sort(function (a, b) {
          if (a.position > b.position) {
            return -1;
          }
          if (a.position < b.position) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
    }
};

//
// Discord Client
//
const Discord = require('discord.js');
var bot = new Discord.Client();

bot.login("MjE4MTMyNjA5NjEwMjg1MDY3.CrN6iA.mTbMux0W99VC721oan41Vzkl9fs");

//
// Command Processing
//
const CommandMap = lib('commandmap.js');

var rootCommandMap;

(api.loadCommands = function() {
    rootCommandMap = new CommandMap(require("path").join(__dirname, "commands"));
})();

api.runCommand = function() {
    var args = arguments;
    var context = args[0];
    var d = require('domain').create()
    d.on('error', function(err) {
        if (err instanceof UserError) {
            context.send(err.message);
        } else {
            context.send("An internal error has occurred while executing this command.");
            console.error(err.stack);
        }
    });
    d.run(function() {
        rootCommandMap.run.apply(rootCommandMap, args);
    });
}

bot.on("message", function(message) {
    var command = null;

    if (message.content.startsWith("/")) {
        command = message.content.substr(1);
    } else if (message.channel.isPrivate) {
        command = message.content;
    }

    if (command) {
        console.log(message.author.username + ' executed command: ' + command);
        api.getNode(message.author, "discord.command", function(permission) {
            api.runCommand(new Context(api, bot, redis, message, command, permission), command);
        });
    }
});

//
// Permission Nodes
//
var redis = require("redis").createClient();
const Permission = lib('permission.js');

api.sanitizeNodePath = function(path) {
    return path.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$|[^\w\-\.]+/, '');
}

api.getNode = function(user, path, callback) {
    path = api.sanitizeNodePath(path);
    var paths = [path];
    var p = path;

    while (p.includes(".")) {
        p = p.substr(0, p.lastIndexOf("."));
        paths.push(p);
    }

    var guild = bot.guilds.first();

    var fn_gn = function(p, callback) {
        return api.getNode(user, p, callback);
    };

    // Allow access for debugging
    callback(new Permission(fn_gn, path, path, true, true));
    return;

    guild.fetchMember(user).then(function(member) {
        var roles = api.sortRoles(member.roles.array());

        var checkRole = function(role) {
            console.log("checkRole: %s", role.id);
            if (!role) {
                console.log("no role with permission");
                callback(new Permission(fn_gn, path, undefined, false, undefined));
            } else {
                console.log("calling redis");
                var hmgetCallback = function(err, res) {
                    console.log("redis responded with: (%s) '%s'", (typeof res), res);
                    console.log("error? (%s) '%s'", (typeof err), err);
                    if (err instanceof Error) {
                        console.error(err.stack);
                        callback(new Permission(fn_gn, path, undefined, false, err));
                        return;
                    }
                    for (var i = 0; i < paths.length; i++) {
                        if (res[i] != null) {
                            var value = JSON.parse(res[i]);
                            var v = value;

                            if (typeof value == "object") {
                                v = api.matchFilter(user, value);
                            }

                            callback(new Permission(fn_gn, path, paths[i], v, value));
                            return;
                        }
                    }
                };

                var hmgetArgs = ["hmget", "role:"+role.id].concat(paths, hmgetCallback);
                console.log(hmgetArgs);
                redis.send_command.apply(redis, hmgetArgs);
            }
        }

        checkRole(roles.shift());

    }, function(reason) {
        console.error("Failed to fetch member: %s", reason);
    });
}

api.setNode = function(role, path, value) {
    path = api.sanitizeNodePath(path);
    var roleid = (typeof role === 'object') ? role.id : role;

    client.hset("perms:" + roleid, path, JSON.stringify(), redis.print);
}
