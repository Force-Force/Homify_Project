"""Business logic exceptions for Homify services."""


class BusinessLogicError(Exception):
    """Base exception for domain rule violations."""

    def __init__(self, message, code='business_error', **extra):
        self.message = message
        self.code = code
        self.extra = extra
        super().__init__(message)


class PropertyLifecycleError(BusinessLogicError):
    """Invalid property status transition."""


class PropertyMediaError(BusinessLogicError):
    """Photo upload validation failure."""


class MessagingPolicyError(BusinessLogicError):
    """Messaging rate limit or policy violation."""
