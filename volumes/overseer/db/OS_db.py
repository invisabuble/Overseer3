import os
import asyncio
import aiomysql
import bcrypt
import secrets
import string


def async_db_operation (method) :
    """
        Custom decorator used to execute async operations on the database.
    """
    async def wrapper (self, *args, **kwargs) :

        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cursor:

                    # The method needs to have the following arguments: self, cursor
                    return await method(self, cursor, *args, **kwargs)

        except Exception as e:
            print(f"ASYNC DB OP EXCEPTION : {e}")
            return None

    return wrapper


class OS_db:

    def __init__ (self) :
        # Initialise the database connection.

        self.pool = None

        self.host=os.getenv('DB_HOST')
        self.user='root'
        self.password=os.getenv('MASTER_PASSWORD')
        self.db=os.getenv('DB_NAME')


    async def init_connection (self) :
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

        # Generate a password hash and a secret key from the master password.
        hash, key = self.hash_pwd(self.password)

        # Generate the admin user if it hasnt been created.
        await self.call_procedure("create_user", f"{self.db}_admin", "*", hash, key)


    def hash_pwd (password) : 
        # Hash a given password, return the hash and a secret key.
        password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Define the alphabet of characters to use in the secret key.
        alphabet = string.ascii_letters + string.digits + string.punctuation
        secret_key = ''.join(secrets.choice(alphabet) for _ in range(64))

        return (password, secret_key)


    async def close (self) :
        # Close the connection to the database.
        if (self.pool) :
            self.pool.close()
            await self.pool.close()
            print("Closed connection to the database.")


    @async_db_operation
    async def call_procedure (self, cursor, proc, *params) :
        # Call a procedure in the database and retrieve the result.
        await cursor.callproc(proc, params)
        ret = await cursor.fetchone()
        return ret
