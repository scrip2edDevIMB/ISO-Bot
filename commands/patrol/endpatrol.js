const { SlashCommandBuilder } = require('discord.js');
const Patrol = require('../../models/Patrol');
const User = require('../../models/User');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('endpatrol')
    .setDescription('End a patrol and award attendance.')
    .addIntegerOption(o => o.setName('patrolid').setDescription('Patrol ID').setRequired(true)),

  async execute(interaction) {
    const pid = interaction.options.getInteger('patrolid');
    const patrol = await Patrol.findOne({ patrolNumber: pid });

    if (!patrol || patrol.ended) {
      return interaction.reply({ content: 'Invalid or already ended patrol.', ephemeral: true });
    }

    const allowed = interaction.user.id === patrol.hostId;
    if (!allowed) {
      return interaction.reply({ content: 'Only the host can end this patrol.', ephemeral: true });
    }

    patrol.ended = true;
    await patrol.save();

    const sessionUsers = [...patrol.attendees, patrol.hostId];
    await User.updateMany(
      { discordId: { $in: sessionUsers } },
      { $inc: { patrols: 1 } }
    );

    const embed = createEmbed({
      title: 'Patrol Ended',
      description: `Patrol **${pid}** ended.\nAttendees awarded: ${patrol.attendees.length + 1}.`,
      color: '#27ae60'
    });
    await interaction.reply({ embeds: [embed] });
  }
};
