import functools

# Lives at module level so the decorator can write to it while the class is still being built.
registered_commands = {}

def OSS_CMD(arg_len, help_msg):
    """
    Decorator factory for OSS command methods. Handles arg-length validation
    and help text so each command only needs to implement its actual logic.
    """
    def decorator(method):
        @functools.wraps(method)
        async def wrapper(ODB, *args, help=False):
            if len(args) != arg_len:
                help = True
            if help or (arg_len > 0 and not args):
                return help_msg
            return await method(ODB, *args, help=help)
        registered_commands[method.__name__] = wrapper
        return staticmethod(wrapper)
    return decorator


class OSS_CMD_Parser:

    # pull in the registered commands from the module level.
    registered_commands = registered_commands

    @staticmethod
    async def CMD_Parse(ODB, command) :
        # Parse the passed command and hand it to the appropriate method.

        command = command.split()

        # Check if the passed command is empty.
        if not command:
            return "No command given"

        CMD_Method = command[0]
        del command[0]

        return await OSS_CMD_Parser.CMD_Caller(CMD_Method, ODB, command)

    @staticmethod
    async def CMD_Caller(CMD_Method, ODB, command, help=False) :
        # Call the passed command with the passed arguments.

        method = OSS_CMD_Parser.registered_commands.get(CMD_Method)

        if method is None:
            return f"Unknown Command : {CMD_Method}"

        try:
            return await method(ODB, *command, help=help)

        except Exception as e:
            return f"Error running : {CMD_Method} : {e}"


    # Only methods decorated with @OSS_CMD are reachable from the frontend.
    # Use the following template to create more commands.

    """
    @OSS_CMD(<argument count>, <help message>)
    async def [command name] (ODB, *args, help=False) :

        <Command logic>

        return "command output"
    """

    # This template allows arbitrary python running from the frontend.


    @OSS_CMD(0, "Display this help message : help")
    async def help(ODB, *args, help=False):
        # Return the help message of each method within the CMD_Parser to the front.

        ret = ""

        for method in OSS_CMD_Parser.registered_commands.values():
            ret += await method(ODB, help=True) + "\n\n"

        # Strip off the trailing newline character and return all the help messages.
        return ret.strip()


    @OSS_CMD(2, "Create an overseer user : create_user [username] [password]")
    async def create_user(ODB, *args, help=False) :
        # Create an OS user.

        NEW_USER = args[0]
        NEW_PASS = args[1]

        # Hash the passes password.
        NEW_PASS, NEW_KEY = ODB.hash_pwd(NEW_PASS)

        ret = ""

        try:
            await ODB.call_procedure("create_user", NEW_USER, "0", NEW_PASS, NEW_KEY)
            ret = f"Created new user {NEW_USER}"
        except Exception as e :
            ret = f"Error creating user : {NEW_USER} : {e}"

        return ret


    @OSS_CMD(2, "Change a users password : change_password [username] [new_password]")
    async def change_password (ODB, *args, help=False) :
        # Change a users password.

        USER     = args[0]
        NEW_PASS = args[1]

        # Hash the new password
        NEW_PASS, NEW_KEY = ODB.hash_pwd(NEW_PASS)

        ret = ""

        try:
            await ODB.call_procedure("change_password", USER, NEW_PASS, NEW_KEY)
            ret = f"Changed password for {USER}."
        except Exception as e:
            ret = f"Error changing password for {USER} : {e}"

        return ret


    @OSS_CMD(2, "Change a users permission level : change_permission [username] [permission level]")
    async def change_permission (ODB, *args, help=False) :
        # Change the permission level of a user

        USER = args[0]
        PERM = args[1]

        ret = ""
        valid_perms = ["*", "0"]

        if (PERM not in valid_perms) :
            return f"Unrecognised permission : {PERM}, must be in {valid_perms}"
        
        try:
            await ODB.call_procedure("change_permission", USER, PERM)
            ret = f"Changed permission for {USER}"
        except Exception as e:
            ret = f"Error changing permission for {USER} : {e}"

        return ret


    @OSS_CMD(1, "Delete an Overseer user : delete_user [username]")
    async def delete_user (ODB, *args, help=False) :
        # Delete an OS user.

        USER = args[0]

        ret = ""

        try:
            await ODB.call_procedure("delete_user", USER)
            ret = f"Deleted user {USER}"
        except Exception as e:
            ret = f"Error deleting user : {USER} : {e}"

        return ret