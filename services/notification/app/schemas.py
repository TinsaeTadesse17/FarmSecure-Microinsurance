from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from enum import Enum

class NotificationType(str, Enum):
    account_approval = "account_approval"
    account_rejection = "account_rejection"
    agent_account = "agent_account"

from typing import Literal
from pydantic import BaseModel, EmailStr

class BaseNotification(BaseModel):
    type: NotificationType
    subject: str
    to: EmailStr

class AccountApprovalNotification(BaseNotification):
    type: Literal[NotificationType.account_approval]
    portal_link: str = 'http://localhost:8000'
    username: str
    password: str

class AgentAccountNotification(BaseNotification):
    type: Literal[NotificationType.agent_account]
    portal_link: str = 'http://localhost:8000'
    username: str
    password: str


class AccountRejectionNotification(BaseNotification):
    type: Literal[NotificationType.account_rejection]



NotificationUnion = Union[
    AccountApprovalNotification,
    AccountRejectionNotification,
    AgentAccountNotification
]