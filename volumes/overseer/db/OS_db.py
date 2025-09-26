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
