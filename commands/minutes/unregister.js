const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unregister')
		.setDescription('Remove a user from the time tracking system.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to unregister')
				.setRequired(true)
		),

	async execute(interaction) {
		const allowed = hasPermission(interaction.member, {minimumRole: 'Pre-Leadership', higherRolesAllowed: true, allowedUserId: '1122615509234487396'});

		if (!allowed) {
			return interaction.reply({
				content: 'You do not have permission to use this!',
				ephemeral: true
			});
		}

		const target = interaction.options.getUser('user');
		const user = await User.findOne({ discordId: target.id });

		if (!user) {
			const embed = createEmbed({
				title: 'Unregister - Failed',
				description: `${target.tag} is not registered in the system.`,
				color: '#e74c3c'
			});
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		await User.deleteOne({ discordId: target.id });

		const embed = createEmbed({
			title: 'Unregister - Success',
			description: `<@${target.id}> has been unregistered and their data has been deleted.`,
			color: '#e67e22'
		});
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}
};
