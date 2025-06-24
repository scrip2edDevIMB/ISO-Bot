const { SlashCommandBuilder } = require('discord.js');
const Patrol = require('../../models/Patrol');
const { createEmbed } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listpatrols')
    .setDescription('List upcoming scheduled patrols.'),

  async execute(interaction, client) {
    const now = new Date();
    const patrols = await Patrol.find({
      scheduledTime: { $gt: now },
      ended: false
    }).sort({ scheduledTime: 1 });

    if (!patrols.length) {
      return interaction.reply({
        content: '📭 No upcoming patrols scheduled.',
        ephemeral: true
      });
    }

    const lines = patrols.map((p, i) => {
      const date = new Date(p.scheduledTime).toLocaleString('en-US', { timeZone: 'UTC', hour12: true });
      return `**#${i + 1} — ${date} UTC**\nHost: <@${p.hostId}>\nChannel: <#${p.channelId}>\nAttendees: ${p.attendees.length}\nID: \`${p.patrolNumber}\``;
    });

    const embed = createEmbed({
      title: '📅 Upcoming Patrols',
      description: lines.join('\n\n'),
      color: '#2980b9'
    });

    return interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
