// -- Varibles -- \\

const { REST, Routes, Client, Events, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const { createEmbed, setBotStatus } = require("./Services")
const dotenv = require('dotenv');
dotenv.config();

const Patrol = require('./models/Patrol.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// -- Slash Commands Handler -- \\

const fs = require('node:fs');
const path = require('node:path');

client.commands = new Collection();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(process.env.TOKEN);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// -- Login/Startup Events -- \\

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	setBotStatus(client, {
		status: 'online', // online | idle | dnd | invisible
		activityType: 'Streaming', // Playing | Streaming | Listening | Watching | Competing
		activityText: 'ISO Activity'
	});

	setInterval(async () => {
		const now = new Date();
		const in1Min = new Date(now.getTime() + 60000);

		const upcomingPatrols = await Patrol.find({
			ended: false,
			scheduledTime: { $gte: now, $lt: in1Min }
		});

		for (const patrol of upcomingPatrols) {
			const hostUser = await client.users.fetch(patrol.hostId);
			try {
				await hostUser.send(`📣 Reminder: Your patrol is starting now in <#${patrol.channelId}>.`);
			} catch (err) {
				console.warn(`Could not DM user ${patrol.hostId}`);
			}

			const channel = await client.channels.fetch(patrol.channelId);
			await channel.send(`🚨 The patrol hosted by <@${patrol.hostId}> is starting now!`);
		}
	}, 30000);
});

require('./OtherServices_Folder/Database.js').connectToDatabase()
require('./OtherServices_Folder/WeeklyJob.js')

client.login(process.env.TOKEN)