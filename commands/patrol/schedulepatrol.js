const { SlashCommandBuilder } = require('discord.js');
const Patrol = require('../../models/Patrol');
const { createEmbed, hasPermission } = require('../../Services');

    const { DateTime } = require('luxon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedulepatrol')
    .setDescription('Schedule a new patrol.')
    .addChannelOption(o =>
      o.setName('channel').setDescription('Channel to ping').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('date').setDescription('Date (YYYY-MM-DD)').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('time').setDescription('Time in EST (HH:mm, 24h)').setRequired(true)
    ),

  async execute(interaction, client) {
    const allowed = hasPermission(interaction.member, { minimumRole: '[SSFC] Senior Security Officer', higherRolesAllowed: true, allowedUserId: '1122615509234487396' });
    if (!allowed) {
      return interaction.reply({ content: 'You do not have permission!', ephemeral: true });
    }

    const dateStr = interaction.options.getString('date');
    const timeStr = interaction.options.getString('time'); 

    const estDateTime = DateTime.fromFormat(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', {
      zone: 'America/New_York'
    });

    if (!estDateTime.isValid) {
      return interaction.reply({ content: '❌ Invalid date or time format.', ephemeral: true });
    }

    const scheduledTimeUTC = estDateTime.toUTC().toJSDate();
    const humanReadable = estDateTime.toFormat('ffff');

    await Patrol.create({
      hostId: interaction.user.id,
      channelId: channel.id,
      scheduledTime: scheduledTimeUTC
    });

    const embed = createEmbed({
      title: 'Patrol Scheduled',
      description: `📅 Date: ${humanReadable}\n📍 Channel: <#${channel.id}>\n🧑‍✈️ Host: <@${interaction.user.id}>`,
      color: '#3498db'
    });

    await interaction.reply({ embeds: [embed] });
  }
};
