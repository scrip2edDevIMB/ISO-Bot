const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, hasPermission, setBotStatus } = require("../../Services")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription("Set the bot's status and activity")
        .addStringOption(option =>
            option.setName('status')
                .setDescription("The bot's status (online, idle, dnd, invisible)")
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Idle', value: 'idle' },
                    { name: 'Do Not Disturb', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' },
                )
        )
        .addStringOption(option =>
            option.setName('activitytype')
                .setDescription('What type of activity the bot is doing')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'Playing' },
                    { name: 'Streaming', value: 'Streaming' },
                    { name: 'Listening', value: 'Listening' },
                    { name: 'Watching', value: 'Watching' },
                    { name: 'Competing', value: 'Competing' },
                )
        )
        .addStringOption(option =>
            option.setName('activitytext')
                .setDescription('The text shown for the activity')
                .setRequired(true)
        ),
        
    async execute(interaction,client) {
        const allowed = hasPermission(interaction.member, {minimumRole: '',higherRolesAllowed: false, allowedUserId: '1122615509234487396'});
		if (!allowed) {
            return await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }

        const status = interaction.options.getString('status');
        const activityType = interaction.options.getString('activitytype');
        const activityText = interaction.options.getString('activitytext');

        setBotStatus(client, {
            status,
            activityType,
            activityText
        });

        const embed = createEmbed({
            title: 'Status Command - Success',
            description: `✅ Bot status updated to **${status}** and **${activityType} ${activityText}**.`,
            color: '#5f8a54'
        });
		await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
