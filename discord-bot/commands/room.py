from discord.ext import commands
from api_client import APIClient
from openai import AsyncOpenAI
from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

openai_client = AsyncOpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)

@commands.command(name="room")
async def room(ctx, room_name: str = None):
    if not room_name:
        return await ctx.send("Please specify a room, Boss! (e.g., drawing, work1, work2)")
        
    room_data = await APIClient.get_room_status(room_name)
    if not room_data:
        return await ctx.send(f"Couldn't pull status profiles for '{room_name}'. Make sure it's drawing, work1, or work2.")
        
    prompt = f"Convert this raw array for room '{room_name}' into a casual, conversational summary for your office manager boss: {room_data}"
    
    completion = await openai_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    await ctx.send(completion.choices[0].message.content)
