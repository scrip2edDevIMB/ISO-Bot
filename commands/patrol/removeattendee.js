const { SlashCommandBuilder } = require('discord.js');
const Patrol = require('../../models/Patrol');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeattendee')
    .setDescription('Remove an attendee from a patrol.')
    .addIntegerOption(o => o.setName('patrolid').setDescription('Patrol ID').setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)),

  async execute(interaction) {
    hasPermission(interaction.member, { minimumRole: '[SSFC] Senior Security Officer', higherRolesAllowed: true, allowedUserId: '1122615509234487396' });
    if (!allowed) return interaction.reply({ content: 'No permission!', ephemeral: true });

    const pid = interaction.options.getInteger('patrolid');
    const target = interaction.options.getUser('user');
    const patrol = await Patrol.findById(pid);
    if (!patrol || patrol.ended) {
      return interaction.reply({ content: 'Invalid or finished patrol.', ephemeral: true });
    }

    if (!patrol.attendees.includes(target.id)) {
      return interaction.reply({ content: 'User not in attendees.', ephemeral: true });
    }

    patrol.attendees = patrol.attendees.filter(id => id !== target.id);
    await patrol.save();

    const embed = createEmbed({
      title: 'Attendee Removed',
      description: `<@${target.id}> removed from patrol **${pid}**.`,
      color: '#e67e22'
    });
    return interaction.reply({ embeds: [embed] });
  }
};
