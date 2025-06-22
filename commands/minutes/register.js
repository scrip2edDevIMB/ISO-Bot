const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register for the weekly time tracking system.'),

	async execute(interaction) {
		const allowed = hasPermission(interaction.member, {minimumRole: '[CT] Cadet', higherRolesAllowed: true, allowedUserId: '1122615509234487396'});
		if (!allowed) return interaction.reply({ content: 'You do not have permission!', ephemeral: true });

		const existing = await User.findOne({ discordId: interaction.user.id });
		if (existing) {
			const embed = createEmbed({
				title: 'Already Registered',
				description: 'You are already registered!',
				color: '#f1c40f'
			});
			return interaction.reply({ embeds: [embed], ephemeral: false });
		}

		await User.create({ discordId: interaction.user.id });

		const embed = createEmbed({
			title: 'Registration Successful',
			description: 'You are now registered for time tracking!',
			color: '#2ecc71'
		});
		return interaction.reply({ embeds: [embed], ephemeral: false });
	}
};
