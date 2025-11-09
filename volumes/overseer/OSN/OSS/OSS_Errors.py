class OSS_CMD_PROC_ERROR (Exception):
    # Error for the OSS CMD Processor
    def __init__ (self, message):
        super().__init__(f"OSS CMD PROCESSOR ERROR : {message}")