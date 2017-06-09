module.exports = {
  aliases: ["get"],
  description: "Get current value of a permission node.",
  args: [
    {name: "role"},
    {name: "path"}
  ],
  run: function(context, role, path) {
    context.send("TODO");
  }
};
