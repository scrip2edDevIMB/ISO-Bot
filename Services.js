const { EmbedBuilder,ActivityType } = require('discord.js');

/**
 * Creates a custom embed with flexible options and defaults.
 * 
 * @param {Object} options - Options for the embed.
 * @param {string} options.title - Title of the embed.
 * @param {string} options.description - Description text.
 * @param {string} [options.color='#0099ff'] - Hex color code.
 * @param {string} [options.image] - Image URL.
 * @param {string} [options.thumbnail] - Thumbnail URL.
 * @param {Object} [options.footer] - Footer object ({ text: string, iconURL?: string }).
 * @param {Object} [options.author] - Author object ({ name: string, iconURL?: string }).
 * @param {boolean} [options.timestamp=false] - Whether to include a timestamp.
 * @param {Array<Object>} [options.fields] - Fields array ({ name: string, value: string, inline?: boolean }).
 * @returns {EmbedBuilder} - The generated embed.
 */
function createEmbed(options) {
    const embed = new EmbedBuilder()
        .setTitle(options.title || 'No Title')
        .setDescription(options.description || 'No Description')
        .setColor(options.color || '#4287f5');

    if (options.image) embed.setImage(options.image);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);

    // Handle footer (use defaults if none given)
    if (options.footer && options.footer.text) {
        embed.setFooter({ 
            text: options.footer.text, 
            iconURL: options.footer.iconURL || null
        });
    } else {
        embed.setFooter({
            text: 'made with ❤️ by scrippy',
            iconURL: 'https://avatar.hyra.io/colour/1393279067.png'
        });
    }

    if (options.author && options.author.name) {
        embed.setAuthor({ 
            name: options.author.name, 
            iconURL: options.author.iconURL || null 
        });
    }

    if (options.timestamp) embed.setTimestamp();

    if (Array.isArray(options.fields)) {
        options.fields.forEach(field => {
            embed.addFields({
                name: field.name || 'No Name',
                value: field.value || 'No Value',
                inline: field.inline || false,
            });
        });
    }

    return embed;
}

/**
 * Sets the bot's presence (status and activity).
 * 
 * @param {Client} client - The Discord.js client.
 * @param {Object} options - Options to set the bot's status and activity.
 * @param {string} options.status - The bot's status (online, idle, dnd, invisible).
 * @param {string} options.activityType - The activity type (Playing, Streaming, Listening, Watching, Competing).
 * @param {string} options.activityText - The text that will be shown for the activity.
 */
async function setBotStatus(client, { status, activityType, activityText }) {
    try {
        // Set the bot's status
        await client.user.setStatus(status);
        console.log(`Bot status set to: ${status}`);

        // Set the bot's activity
        await client.user.setPresence({activities: [{name: activityText, type: ActivityType[activityType] || ActivityType.Playing, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1'}],
		status: 'online'
	});
        console.log(`Bot activity set to: ${activityType} ${activityText}`);
    } catch (error) {
        console.error(`Failed to set bot status or activity: ${error}`);
    }
}

/**
 * Checks if a member has the required role permissions or specific user ID.
 * 
 * @param {GuildMember} member - The Discord guild member to check.
 * @param {Object} options - Options for the permission check.
 * @param {string} [options.minimumRole] - Name of the minimum required role.
 * @param {boolean} [options.higherRolesAllowed=true] - Whether higher roles are allowed.
 * @param {string} [options.allowedUserId] - Specific user ID allowed to bypass.
 * @returns {boolean} - Whether the member has permission.
 */
function hasPermission(member, options) {
    const { minimumRole, higherRolesAllowed = true, allowedUserId } = options;

    if (!member) return false;

    // Check if specific user is allowed
    if (allowedUserId && member.id === allowedUserId) {
        return true;
    }

    // If no role required, and no user override, deny
    if (!minimumRole) return false;

    const targetRole = member.guild.roles.cache.find(role => role.name === minimumRole);
    if (!targetRole) {
        console.warn(`Role "${minimumRole}" not found in guild "${member.guild.name}".`);
        return false;
    }

    const memberRoles = member.roles.cache;

    if (higherRolesAllowed) {
        // Allow if member has the minimum role OR a higher role
        return memberRoles.some(role => role.position >= targetRole.position);
    } else {
        // Only allow if member has EXACTLY the minimum role
        return memberRoles.has(targetRole.id);
    }
}

module.exports = { createEmbed, setBotStatus, hasPermission };