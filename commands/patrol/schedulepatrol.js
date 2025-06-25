const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const Patrol = require('../../models/Patrol');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedulepatrol')
    .setDescription('Schedule a new patrol.')
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
    const channel = 1299211801111695421;

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

    const latestPatrol = await Patrol.findOne().sort({ patrolNumber: -1 });
    const nextNumber = (latestPatrol?.patrolNumber ?? 0) + 1;


    await Patrol.create({
      patrolNumber: nextNumber,
      hostId: interaction.user.id,
      channelId: channel,
      scheduledTime: scheduledTimeUTC,
      attendees: [],
      ended: false
    });


    const embed = createEmbed({
      title: '🗓️ Patrol Scheduled',
      description: `**Host:** <@${interaction.user.id}>\n**Channel:** <#${channel}>\n**When:** ${estDateTime.toFormat('cccc, LLLL dd, yyyy • h:mm a')} EST\n **Patrol ID:** ${nextNumber}`,
      color: '#27ae60'
    });

    return interaction.reply({ embeds: [embed] });
  }
};