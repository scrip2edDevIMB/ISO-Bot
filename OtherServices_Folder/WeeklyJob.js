const cron = require('node-cron');
const User = require('../models/User');
const Config = require('../models/Config');

cron.schedule('0 0 * * 0', async () => { // Runs every Sunday at midnight
  const config = await Config.findOne();
  const allUsers = await User.find();

  const leaderboard = allUsers
    .map(user => ({ id: user.discordId, minutes: user.minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  const met = leaderboard.filter(u => u.minutes >= config.weeklyRequirement);
  const unmet = leaderboard.filter(u => u.minutes < config.weeklyRequirement);

  const channel = client.channels.cache.get(process.env.BROADCAST_CHANNEL_ID);

  await channel.send(`@everyone **Weekly Leaderboard**\n` +
    leaderboard.map((u, i) => `${i + 1}. <@${u.id}>: ${u.minutes} mins`).join('\n'));

  await channel.send(`**Met Goal**\n${met.map(u => `<@${u.id}>`).join(', ') || 'None'}`);
  await channel.send(`**Did Not Meet Goal**\n${unmet.map(u => `<@${u.id}>`).join(', ') || 'None'}`);

  // Reset
  for (const user of allUsers) {
    user.minutes = 0;
    user.isTracking = false;
    user.trackingStart = null;
    await user.save();
  }
});
