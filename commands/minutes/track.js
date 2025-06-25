const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Start or stop tracking your time (toggles).'),

	async execute(interaction) {
		const allowed = hasPermission(interaction.member, {minimumRole: '[CT] Cadet', higherRolesAllowed: true, allowedUserId: '1122615509234487396'});
		if (!allowed) return interaction.reply({ content: 'You do not have permission!', ephemeral: true });

		const user = await User.findOne({ discordId: interaction.user.id });
		if (!user) {
			const embed = createEmbed({
				title: 'Tracking Failed',
				description: 'You are not registered.',
				color: '#e74c3c'
			});
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (user.isTracking) {
			const now = new Date();
			const minutes = Math.floor((now - user.trackingStart) / 60000);
			user.minutes += minutes;
			user.isTracking = false;
			user.trackingStart = null;
			await user.save();

			const embed = createEmbed({
				title: 'Patrol Stopped',
				description: `Your Patrol has ended. Added ${minutes} minutes.`,
				color: '#3498db'
			});
			return interaction.reply({ embeds: [embed], ephemeral: false });
		} else {
			user.isTracking = true;
			user.trackingStart = new Date();
			await user.save();

			const embed = createEmbed({
				title: 'Patrol Started',
				description: 'Your time in-game is now being tracked. Please remember to stop tracking when you finish or your minutes will not be counted.',
				color: '#1abc9c'
			});
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
};
