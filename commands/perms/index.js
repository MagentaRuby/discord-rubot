const CommandMap = lib('commandmap.js');

module.exports = new CommandMap(__dirname, {
  aliases: ["permissions", "permission", "perms", "p"],
  description: "Read/Modify role permissions."
});
