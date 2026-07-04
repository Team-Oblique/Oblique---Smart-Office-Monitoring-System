from discord.ext import commands
from api_client import APIClient
from openai import AsyncOpenAI
from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

openai_client = AsyncOpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)

@commands.command(name="status")
async def status(ctx):
    raw_data = await APIClient.get_devices()
    if not raw_data:
        return await ctx.send("Could not access office grid sensors right now, Boss.")
        
    prompt = (
        f"You are a helpful, conversational executive assistant for a corporate boss. "
        f"Summarize this raw office device data frame into a friendly, professional, room-by-room status update. "
        f"Do not make up facts, rely on the exact numbers: {raw_data}"
    )
    
    completion = await openai_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    await ctx.send(completion.choices[0].message.content)
