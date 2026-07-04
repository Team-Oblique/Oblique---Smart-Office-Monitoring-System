from .status import status
from .room import room
from .usage import usage
from .toggle import toggle

def setup_bot_commands(bot):
    bot.add_command(status)
    bot.add_command(room)
    bot.add_command(usage)
    bot.add_command(toggle)
