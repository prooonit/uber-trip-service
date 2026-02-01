
const webpush = require('web-push');

webPush.setVapidDetails(
  "mailto:pronit25io045@satiengg.in",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;