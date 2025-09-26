import asyncio
from db.OS_db import *

db = OS_db()

async def db_init () :
    await db._init_()