ERR_LLM_BACKEND_FAILURE = 500


class LLMException(Exception):
    """Exception caused by underlying language model.

    Attributes:
        code -- error code of the excption
        message -- explanation of the error
    """

    def __init__(self, code, message):
        super().__init__(message)
        self._code = code
        self._message = message

    @property
    def code(self):
        """Return exception code."""
        return self._code

    @property
    def message(self):
        """Return exception message."""
        return self._message

    def __str__(self):
        """Represnt this object as a string."""
        return f"LLMException#{self.code} due to: {self.message}"


