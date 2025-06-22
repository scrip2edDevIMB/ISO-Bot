const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('viewminutes')
		.setDescription('View your or another user\'s total tracked minutes.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to check (optional)')
				.setRequired(false)
		),

	async execute(interaction) {
		const target = interaction.options.getUser('user') || interaction.user;

		const isSelf = target.id === interaction.user.id;

		if (!isSelf) {
			const allowed = hasPermission(interaction.member, {minimumRole: 'Pre-Leadership', higherRolesAllowed: true, allowedUserId: '1122615509234487396'});

			if (!allowed) {
				return interaction.reply({
					content: 'You do not have permission to view other users\' minutes.',
					ephemeral: true
				});
			}
		}

		const user = await User.findOne({ discordId: target.id });

		if (!user) {
			const embed = createEmbed({
				title: 'User Not Registered',
				description: `${isSelf ? 'You are' : `${target.tag} is`} not registered in the system.`,
				color: '#e74c3c'
			});
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const embed = createEmbed({
			title: `Time Tracked — ${target.username}`,
			description: `🕒 Total Minutes: **${user.minutes}**\n${user.isTracking ? '📍 Currently tracking...' : ''}`,
			color: '#3498db'
		});

		return interaction.reply({ embeds: [embed], ephemeral: isSelf });
	}
};
