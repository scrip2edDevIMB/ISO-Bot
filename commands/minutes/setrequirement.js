const { SlashCommandBuilder } = require('discord.js');
const Config = require('../../models/Config');
const { createEmbed, hasPermission } = require('../../Services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setrequirement')
		.setDescription('Set the weekly required minutes.')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('New weekly required minutes')
				.setRequired(true)
		),

	async execute(interaction) {
		const allowed = hasPermission(interaction.member, {minimumRole: 'Pre-Leadership', higherRolesAllowed: true, allowedUserId: '1122615509234487396'});
		if (!allowed) return interaction.reply({ content: 'You do not have permission!', ephemeral: true });

		const amount = interaction.options.getInteger('amount');
		let config = await Config.findOne();
		if (!config) config = await Config.create({ weeklyRequirement: amount });
		else config.weeklyRequirement = amount;

		await config.save();

		const embed = createEmbed({
			title: 'Requirement Updated',
			description: `Weekly requirement is now set to ${amount} minutes.`,
			color: '#2980b9'
		});
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}
};
