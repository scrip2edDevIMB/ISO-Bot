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

		const leaderboardLines = [];

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			let displayName = `User Not Found: ${user.discordId}`;

			try {
				const member = await interaction.guild.members.fetch(user.discordId);
				displayName = member.displayName || member.user.username;
			} catch (err) {
				console.warn(`Could not fetch member ${user.discordId}:`, err.message);
			}

			leaderboardLines.push(`**${i + 1}.** ${displayName} — \`${user.minutes} minutes\` — \`${user.patrols} session(s)\``);
		}

		const embed = createEmbed({
			title: '🏆 Weekly Leaderboard',
			description: leaderboardLines.join('\n'),
			color: '#f1c40f'
		});

		return interaction.reply({ embeds: [embed] });
	}
};