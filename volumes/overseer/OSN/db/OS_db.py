import os
import asyncio
import aiomysql
import bcrypt
import secrets
import string
import ssl


def async_db_operation (method) :
    """
        Custom decorator used to execute async operations on the database.
    """
    async def db_op (self, *args, **kwargs) :
        # Use the connection pool within OS_db to execute queries.
        try:
            async with OS_db.pool.acquire() as conn:
                async with conn.cursor() as cursor:

                    # The method needs to have the following arguments: self, cursor
                    return await method(self, cursor, *args, **kwargs)

        except Exception as e:
            print(f"ASYNC DB OP EXCEPTION : {e}")
            return None

    return db_op


class OS_db:

    pool = None # Pools Closed...
    _pool_lock = asyncio.Lock() 

    # Create the SSL context.
    ssl_ctx = ssl.create_default_context(cafile="/certs/SSL-root.crt")
    ssl_ctx.load_cert_chain(certfile="/certs/overseer-client.crt", keyfile="/certs/overseer-client.key")


    def __init__ (self) :
        # Initialise the database connection.

        self.host     = os.getenv('DB_HOST')
        self.user     = os.getenv('DB_NAME')
        self.password = os.getenv('MASTER_PASSWORD')
        self.db       = os.getenv('DB_NAME')


    async def init_connection (self) :
        # Initialise the async connection to the database
        while not OS_db.pool:
            # Acquire the lock so that only one instance of the pool is created.
            # Very rare that two instances would create at the same time but whatever... its done now.
            async with OS_db._pool_lock:
                if OS_db.pool is None:
        
                    try:
                        # Create a connection pool.
                        # This way we dont have to remake the connection everytime.
                        OS_db.pool = await aiomysql.create_pool(
                            host=self.host,
                            user=self.user,
                            password=self.password,
                            db=self.db,
                            autocommit=True,
                            ssl=OS_db.ssl_ctx
                        )
                        print(f"OS_db connected to the Overseer database @ {self.host}")

                    except Exception as e:
                        print(f"Failed to connect to Overseer database @ {self.host}")
                        await asyncio.sleep(1)

        # Generate a password hash and a secret key from the master password.
        hash, key = OS_db.hash_pwd(self.password)

        # Generate the admin user if it hasnt been created.
        await self.call_procedure("create_user", f"{self.db}_admin", "*", hash, key)


    @staticmethod
    def hash_pwd (password) : 
        # Hash a given password, return the hash and a secret key.
        password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Define the alphabet of characters to use in the secret key.
        alphabet = string.ascii_letters + string.digits + string.punctuation
        secret_key = ''.join(secrets.choice(alphabet) for _ in range(64))

        return (password, secret_key)
    

    @classmethod
    async def close (cls) :
        # Close the connection to the database.
        if (cls.pool) :
            cls.pool.close()
            await cls.pool.wait_closed()
            print("Closed connection to the database.")


    @async_db_operation
    async def call_procedure (self, cursor, proc, *params) :
        # Call a procedure in the database and retrieve the result.
        await cursor.callproc(proc, params)
        print(f"Executed {proc} [{params}]")
        ret = await cursor.fetchone()
        print(f"{proc} returned : {ret}")
        return ret
