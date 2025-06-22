const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, hasPermission } = require("../../Services")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, client) {
		const allowed = hasPermission(interaction.member, { minimumRole: 'Developer', higherRolesAllowed: true, allowedUserId: '1122615509234487396' });
		if (!allowed) {
			return await interaction.reply({ content: 'You do not have permission to use this!', ephemeral: true });
		}

		const embed = createEmbed({
			title: 'Ping Command - Success',
			description: `Pong! 🏓\nLatency: ${Date.now() - interaction.createdTimestamp}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms`,
			color: '#5f8a54'
		});
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};