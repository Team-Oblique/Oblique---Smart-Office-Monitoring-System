import discord
from discord.ext import tasks
from api_client import APIClient
from config import ALERT_CHANNEL_ID

sent_alerts = set()

def setup_bot_events(bot):
    @bot.event
    async def on_ready():
        print(f"🚀 Discord Bot logged in as {bot.user}")
        if ALERT_CHANNEL_ID != 0:
            track_alerts_loop.start()

    @tasks.loop(seconds=10)
    async def track_alerts_loop():
        await bot.wait_until_ready()
        channel = bot.get_channel(ALERT_CHANNEL_ID)
        if not channel:
            return
            
        active_alerts = await APIClient.get_alerts()
        for alert in active_alerts:
            alert_id = alert.get("id")
            if alert_id not in sent_alerts:
                msg = f"🚨 **Proactive Office Alert:** {alert.get('message', 'Anomalous power activity!')} 🕒 {alert.get('timestamp')}"
                await channel.send(msg)
                sent_alerts.add(alert_id)
