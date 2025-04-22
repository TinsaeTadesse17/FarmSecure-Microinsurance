import logging
from src.core.config import settings
from typing import Dict, Any
import requests

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

email_server = settings.NOTIFICATION_SERVICE_URL

BASE_URL = email_server.rstrip("/") + "/notify/email"

def send_email_notification(to: str, subject: str, type="application_received", **kwargs) -> Dict[str, Any]:
    """Send an email notification via the notification service."""
    
    payload = {
        "to": to,
        "subject": subject,
        **kwargs,
        "type": type
    }

    logger.info(f"Sending email notification to {to} with subject: {subject}")

    try:
        response = requests.post(BASE_URL, json=payload, timeout=10)
        logger.debug(response.json())
        response.raise_for_status()
        result = {"status": "success", "data": response.json()}
        logger.info(result)
        return result
    except requests.exceptions.RequestException as e:
        result = {"status": "error", "message": str(e)}
        logger.error(f"Failed to send email notification: {result}")
        return result