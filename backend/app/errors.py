class DomainError(Exception):
    """Base class for domain/business-rule failures."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(DomainError):
    pass


class ValidationError(DomainError):
    pass


class ConflictError(DomainError):
    pass
