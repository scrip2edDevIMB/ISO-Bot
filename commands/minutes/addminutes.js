const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addminutes')
		.setDescription('Add minutes to a user\'s total.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to modify')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Amount of minutes to add')
				.setRequired(true)
		),

	async execute(interaction) {
		const allowed = hasPermission(interaction.member, {minimumRole: 'Pre-Leadership', higherRolesAllowed: true, allowedUserId: '1122615509234487396'});
		if (!allowed) {
			return interaction.reply({ content: 'You do not have permission to use this!', ephemeral: true });
		}

		const target = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('amount');
		const user = await User.findOne({ discordId: target.id });

		if (!user) {
			const embed = createEmbed({
				title: 'Add Failed',
				description: `${target.tag} is not registered.`,
				color: '#e74c3c'
			});
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		user.minutes += Math.abs(amount);
		await user.save();

		const embed = createEmbed({
			title: 'Minutes Added',
			description: `Added ${amount} minutes to <@${target.id}>.\nNew total: **${user.minutes} minutes**.`,
			color: '#2ecc71'
		});
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}
};
