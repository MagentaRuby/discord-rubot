module.exports = {
  aliases: ["set"],
  description: "Set value of a permission node.",
  args: [
    {name: "role"},
    {name: "path"},
    {name: "value"}
  ],
  run: function(context, role, path, value) {
    context.send("TODO");
  }
};
