const { SlashCommandBuilder } = require('discord.js');
const Patrol = require('../../models/Patrol');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addattendee')
    .setDescription('Add an attendee to a patrol.')
    .addIntegerOption(o => o.setName('patrolid').setDescription('Patrol ID').setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('User to add').setRequired(true)),

  async execute(interaction) {
   const allowed = hasPermission(interaction.member, { minimumRole: '[SSFC] Senior Security Officer', higherRolesAllowed: true, allowedUserId: '1122615509234487396' });
    if (!allowed) return interaction.reply({ content: 'No permission!', ephemeral: true });

    const pid = interaction.options.getInteger('patrolid');
    const target = interaction.options.getUser('user');
    const patrol = await Patrol.findById(pid);
    if (!patrol || patrol.ended) {
      return interaction.reply({ content: 'Invalid or finished patrol.', ephemeral: true });
    }

    if (target.id === patrol.hostId) {
      return interaction.reply({ content: 'Host cannot be an attendee!', ephemeral: true });
    }

    if (patrol.attendees.includes(target.id)) {
      return interaction.reply({ content: 'User already marked.', ephemeral: true });
    }

    patrol.attendees.push(target.id);
    await patrol.save();

    const embed = createEmbed({
      title: 'Attendee Added',
      description: `<@${target.id}> added to patrol **${pid}**.`,
      color: '#2ecc71'
    });
    return interaction.reply({ embeds: [embed] });
  }
};
