from OSN.ODB import *
import inspect

class OSS_CMD_Parser:

    # filtered_commands has to be present in this list as its reachable using the getattr method.
    filtered_commands = ["filtered_commands", "CMD_Parse", "CMD_Caller"]

    @staticmethod
    async def CMD_Parse (command) :
        # Parse the passed command and hand it to the appropriate method.

        command = command.split()
        CMD_Method = command[0]
        del command[0]

        if (CMD_Method in OSS_CMD_Parser.filtered_commands):
            return f"Unknown Command : {CMD_Method}"

        return await OSS_CMD_Parser.CMD_Caller(CMD_Method, command)
    

    @staticmethod
    async def CMD_Caller(CMD_Method, command, help=False) :
        try:
            method = getattr(OSS_CMD_Parser, CMD_Method, None)
            if inspect.iscoroutinefunction(method) :
                return await method(*command, help=help)
            else:
                return method(*command, help=help)
        except Exception as e:
            return f"Error running : {CMD_Method} : {e}"
        

    # Everything above this comment should be in the filtered_commands list and should not be callable from the front.
    # Everything below this comment should be callable from the front and adhere to the following template:

    """
    @staticmethod
    async def [command name] (*args, help=False) :
        if (len(args) != number) : # <- Any condition on the arguments place here and return the help message if theyre incorrect.
            help = True
        if (help or not args) :
            return "A description of this command and how to use it"

        <Command logic>
        
        return "command output"
    """

    # This template allows arbitrary python running from the frontend.
    

    @staticmethod
    async def help(*args, help=False) :
        # Return the help message of each method within the CMD_Parser to the front.
        OSS_Commands = [method for method, _ in inspect.getmembers(OSS_CMD_Parser, predicate=inspect.isfunction) if method != "help" and method not in OSS_CMD_Parser.filtered_commands]

        ret = ""

        for method in OSS_Commands:
            ret += await OSS_CMD_Parser.CMD_Caller(method, [], help=True) + "\n"

        return ret.strip()
    
    @staticmethod
    async def create_user(*args, help=False) :
        if (len(args) != 2) :
            help = True
        if (help or not args) :
            return "Create an overseer user : create_user [username] [password]"
        
        # Create an OS user.
        
        return f"Creating user : {args}"