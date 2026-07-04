from discord.ext import commands
from api_client import APIClient

@commands.command(name="toggle")
async def toggle(ctx, device_id: str = None, status: str = None):
    if not device_id or not status or status.lower() not in ["on", "off"]:
        return await ctx.send("Usage syntax: `!toggle <device_name_or_id> <on/off>`")
        
    success = await APIClient.toggle_device(device_id, status)
    if success:
        await ctx.send(f"✅ Toggled device `{device_id}` to `{status.upper()}` successfully.")
    else:
        await ctx.send(f"❌ Failed to toggle device. Ensure the name/ID is correct and backend API is live.")
