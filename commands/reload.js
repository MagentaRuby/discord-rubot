module.exports = {
  aliases: ["reload"],
  description: "Reload commands.",
  args: [],
  run: function(context, message) {
    context.api.loadCommands();
    context.send("Commands reloaded.");
  }
};
