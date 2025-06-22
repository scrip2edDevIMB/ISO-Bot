const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows the top users by total minutes tracked.'),

	async execute(interaction) {
		const users = await User.find({}).sort({ minutes: -1 }).limit(10);

		if (!users.length) {
			const embed = createEmbed({
				title: 'Leaderboard',
				description: 'No one has tracked any minutes yet!',
				color: '#95a5a6'
			});
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const leaderboard = users.map((user, index) => {
			const member = interaction.guild.members.cache.get(user.discordId);
			const displayName = member ? member.displayName : user.discordId;
			return `**${index + 1}.** ${displayName} — \`${user.minutes} minutes\``;
		}).join('\n');

		const embed = createEmbed({
			title: '🏆 Weekly Leaderboard',
			description: leaderboard,
			color: '#f1c40f'
		});

		return interaction.reply({ embeds: [embed] });
	}
};
