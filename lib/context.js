'use strict';

const UserError = lib('usererror.js');

var _outputSent = new WeakMap();

class Context {
    constructor(api, bot, redis, message, input, permission) {
        this.src = message.author;
        this.api = api;
        this.bot = bot;
        this.redis = redis;
        this.channel = message.channel;
        this.message = message;
        this.input = input;
        this.permission = permission;

        this.outputSent = false;
    }

    send(content, options) {
        this.outputSent = true;
        return this.channel.sendMessage(content, options).catch(function(error) {
            console.log("Could not send text message: %s", error);
        });
    }

    reply(content, options) {
        this.outputSent = true;
        return this.message.reply.sendMessage(content, options).catch(function(error) {
            console.log("Could not reply: %s", error);
        });
    }

    msg(content, options) {
        this.outputSent = true;
        return this.src.sendMessage(content, options).catch(function(error) {
            console.log("Could not send direct message: %s", error);
        });
    }

    dump(object) {
        return send("```"+JSON.stringify(object)+"```");
    }

    fetchUser(input) {
        if (input.match(/^\s*<@\d+>\s*$/)) {
            var key = input.trim().slice(2, -1);
            var user = this.message.mentions.users.get(key);

            if (user != null) {
                return user;
            } else {
                throw new UserError("Could not find user with id '"+key+"'.");
            }
        } else {
            throw new UserError("Invalid user input. Only mentions are supported for now.");
        }
    }

    fetchMember(input) {
        var user = this.fetchUser(input);
        return this.channel.guild.fetchMember(user);
    }

    fetchRole(input) {
        if (input.match(/^\s*<@&\d+>\s*$/)) {
            var key = input.trim().slice(3, -1);
            var role = this.message.mentions.roles[key];
            if (role != null) {
                return role;
            } else {
                throw new UserError("Could not find role.");
            }
        } else {
            throw new UserError("Invalid role input. Only mentions are supported for now.");
        }
    }

    fetchChannel(input) {
        if (input.match(/^\s*<#\d+>\s*$/)) {
            var key = input.trim().slice(2, -1);
            var channel = this.message.mentions.channels[key];
            if (channel != null) {
                return channel;
            } else {
                throw new UserError("Could not find channel.");
            }
        } else {
            throw new UserError("Invalid channel input. Only mentions are supported for now.");
        }
    }
}

module.exports = Context;
