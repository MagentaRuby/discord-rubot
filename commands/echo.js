module.exports = {
  aliases: ["echo", "say", "ping"],
  description: "Send a message using the bot.",
  args: [
    {name: "message", optional: true}
  ],
  // opts: {
  //   string: "test"
  // },
  run: function(context, message) {
    if (message != null) {
      context.send(message);
    } else if (context.input.match(/^echo\b/)) {
      context.send("**ECHO!** Echo! *echo...*");
    } else if (context.input.match(/^say\b/)) {
      context.send("Say what?");
    } else if (context.input.match(/^ping\b/)) {
      context.send("Pong!");
    }
  }
};
