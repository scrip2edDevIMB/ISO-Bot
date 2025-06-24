const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const { createEmbed } = require('../../Services');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewdata')
    .setDescription('View your tracked minutes, patrols, and sessions.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Optional: View data for another user')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;

    let userData = await User.findOne({ discordId: target.id });

    if (!userData) {
      return interaction.reply({
        content: `❌ No data found for ${target.username}. They might not be registered.`,
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: `📊 User Data for ${target.username}`,
      fields: [
        { name: '🕒 Minutes Tracked', value: `${userData.minutesThisWeek ?? 0}`, inline: true },
        { name: '🛡️ Patrols Attended', value: `${userData.patrolsThisWeek ?? 0}`, inline: true },
        { name: '📅 Sessions Completed', value: `${userData.sessionsThisWeek ?? 0}`, inline: true },
        { name: '📍 Weekly Requirement', value: `${userData.weeklyRequirement ?? 'Not Set'}`, inline: true }
      ],
      color: '#7289da'
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};