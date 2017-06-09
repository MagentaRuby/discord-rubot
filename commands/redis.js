module.exports = {
  aliases: ["redis"],
  description: "Run redis commands.",
  args: [
    {name: "command"},
    {name: "args"}
  ],
  run: function() {
    var args = Array.prototype.slice.call(arguments);
    var context = args.shift();
    var commandName = args.shift();

    context.redis.send_command(commandName, args, function (err, res) {
      if (err != null) {
        console.log(err);
        context.send(err);
      } else if (typeof res == "string") {
        context.send(res);
      } else {
        context.send(JSON.stringify(res));
      }
    });
  }
};
