import asyncio
from db.OS_db import *

db = OS_db()

async def main () :
    # Main loop for overseer.
    await db.init_connection()

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
loop.run_until_complete(main())