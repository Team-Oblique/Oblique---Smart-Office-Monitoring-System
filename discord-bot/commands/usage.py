from discord.ext import commands
from api_client import APIClient
from openai import AsyncOpenAI
from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

openai_client = AsyncOpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)

@commands.command(name="usage")
async def usage(ctx):
    usage_data = await APIClient.get_usage()
    if not usage_data:
        return await ctx.send("Unable to compute power usage parameters right now.")
        
    prompt = f"Translate this raw electrical footprint usage data into a witty, conversational update for the office boss: {usage_data}"
    
    completion = await openai_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    await ctx.send(completion.choices[0].message.content)
