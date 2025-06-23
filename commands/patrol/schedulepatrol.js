const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const Patrol = require('../../models/Patrol');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedulepatrol')
    .setDescription('Schedule a new patrol.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to ping for the patrol')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Date in format YYYY-MM-DD (e.g. 2025-06-30)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time in EST, 24h format (e.g. 18:00 for 6 PM)')
        .setRequired(true)
    ),

  async execute(interaction) {
   const allowed = hasPermission(interaction.member, { minimumRole: '[SSFC] Senior Security Officer', higherRolesAllowed: true, allowedUserId: '1122615509234487396' });
    if (!allowed) {
      return interaction.reply({
        content: '❌ You do not have permission to use this!',
        ephemeral: true
      });
    }

    const dateStr = interaction.options.getString('date');
    const timeStr = interaction.options.getString('time');
    const channel = interaction.options.getChannel('channel');

    const estDateTime = DateTime.fromFormat(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', {
      zone: 'America/New_York'
    });

    if (!estDateTime.isValid) {
      return interaction.reply({
        content: '❌ Invalid date or time. Make sure format is YYYY-MM-DD and HH:mm (24h).',
        ephemeral: true
      });
    }

    const scheduledTimeUTC = estDateTime.toUTC().toJSDate();

    await Patrol.create({
      hostId: interaction.user.id,
      channelId: channel.id,
      scheduledTime: scheduledTimeUTC,
      attendees: [],
      ended: false
    });

    const embed = createEmbed({
      title: '🗓️ Patrol Scheduled',
      description: `**Host:** <@${interaction.user.id}>\n**Channel:** <#${channel.id}>\n**When:** ${estDateTime.toFormat('cccc, LLLL dd, yyyy • h:mm a')} EST`,
      color: '#27ae60'
    });

    return interaction.reply({ embeds: [embed] });
  }
};