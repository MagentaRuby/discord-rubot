module.exports = {
    aliases: ["roles"],
    description: "List roles of this server.",
    args: [{
        name: "member",
        optional: true
    }],
    run: function(context, memberStr) {
        if (memberStr != null) {
            var member = context.fetchMember(memberStr).then(function(member) {
                echoRoles(context, member.roles.array());
            }, function(reason) {
                console.log("Failed to fetch member %s: %s", memberStr, reason);
                context.send("Failed to fetch member.");
            });
        } else {
            echoRoles(context, context.channel.guild.roles.array());
        }
    }
};

function echoRoles(context, roles) {
    roles = context.api.sortRoles(roles);
    var message = "```";
    for (var i = 0; i < roles.length; i++) {
        message += roles[i].id + " -- " + roles[i].name.replace(/^@/, '') + "\r\n";
    }
    context.send(message + "```");
}
