import discord
from discord.ext import commands
from config import DISCORD_TOKEN
from commands import setup_bot_commands
from listeners import setup_bot_events

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True

bot = commands.Bot(command_prefix="!", intents=intents)

setup_bot_commands(bot)
setup_bot_events(bot)

if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
