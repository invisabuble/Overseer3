import os
import asyncio
import aiomysql


class OS_db:

    def __init__ (self) :
        # Initialise the database connection.

        self.pool = None

        self.host=os.getenv('DB_HOST')
        self.user='root'
        self.password=os.getenv('MASTER_PASSWORD')
        self.db=os.getenv('DB_NAME')

        print(f"{self.host}, {self.user}, {self.password}, {self.db}")

    async def _init_ (self) :
        # Initialise the async connection to the database

        while not self.pool:
        
            try:
                # Create a connection pool.
                # This way we dont have to remake the connection everytime.
                self.pool = await aiomysql.create_pool(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    db=self.db,
                    autocommit=True
                )
                print(f"OS_db connected to the Overseer database @ {self.host}")

            except Exception as e:
                print(f"Failed to connect to Overseer database @ {self.host}")
                await asyncio.sleep(1)
