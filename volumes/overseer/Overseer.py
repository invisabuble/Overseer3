from OSN.OSS import *

OSN = OSS()

async def main () :
    # Main loop for overseer.
    await OSN.run()

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
loop.run_until_complete(main())