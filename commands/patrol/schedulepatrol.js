const { SlashCommandBuilder } = require('discord.js');
const Patrol = require('../../models/Patrol');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedulepatrol')
    .setDescription('Schedule a new patrol.')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to ping').setRequired(true))
    .addStringOption(o => o.setName('time').setDescription('Datetime (ISO, e.g. 2025-06-30T18:00)').setRequired(true)),

  async execute(interaction, client) {
    const allowed = hasPermission(interaction.member, { minimumRole: '[SSFC] Senior Security Officer', higherRolesAllowed: true, allowedUserId: '1122615509234487396' });
    if (!allowed) {
      return interaction.reply({ content: 'You do not have permission!', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const timeStr = interaction.options.getString('time');
    const scheduledTime = new Date(timeStr);
    if (isNaN(scheduledTime)) {
      return interaction.reply({ content: 'Invalid datetime format.', ephemeral: true });
    }

    const patrol = await Patrol.create({
      hostId: interaction.user.id,
      channelId: channel.id,
      scheduledTime
    });

    setTimeout(async () => {
      const host = await client.users.fetch(patrol.hostId);
      await host.send(`🔔 It’s time to start your patrol scheduled at ${scheduledTime.toISOString()}`);
      const textChannel = client.channels.cache.get(patrol.channelId);
      if (textChannel?.isTextBased()) {
        textChannel.send(`🚨 Patrol starting now!\nHost: <@${patrol.hostId}>`);
      }
    }, scheduledTime - Date.now());

    const embed = createEmbed({
      title: 'Patrol Scheduled',
      description: `Host: <@${interaction.user.id}>\nChannel: ${channel}\nTime: ${scheduledTime.toISOString()}`,
      color: '#3498db'
    });
    return interaction.reply({ embeds: [embed] });
  }
};
