"use strict";

// The Lounge — committed config using process.env (Model B)
// No envsubst, no template, no host-side generation step.
// Env vars passed via compose environment: section.

module.exports = {
  public: false,
  reverseProxy: true,
  theme: "default",

  defaults: {
    name: process.env.IRC_NETWORK_NAME || "allthingslinux",
    host: "atl-irc-server",
    port: 6697,
    tls: true,
    rejectUnauthorized: process.env.IRC_LOUNGE_REJECT_UNAUTHORIZED !== "false",
    nick: "atl%%",
    username: "atl",
    realname: "The Lounge User",
    join: "#help",
  },

  webirc: {
    "atl-irc-server":
      process.env.THELOUNGE_WEBIRC_PASSWORD || "change_me_thelounge_webirc",
    "irc.atl.chat":
      process.env.THELOUNGE_WEBIRC_PASSWORD || "change_me_thelounge_webirc",
    "irc.localhost":
      process.env.THELOUNGE_WEBIRC_PASSWORD || "change_me_thelounge_webirc",
  },

  fileUpload: { enable: true },

  // thelounge-plugin-janitor: minutes before deleting uploads.
  // Core logs "Unknown key" warning — expected and harmless.
  deleteUploadsAfter: parseInt(
    process.env.THELOUNGE_DELETE_UPLOADS_AFTER_MINUTES || "1440",
    10
  ),
};
