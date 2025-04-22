import requests
import os
from typing import Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Determine the base URL for the company service
# It's recommended to use environment variables for configuration
COMPANY_SERVICE_BASE_URL = os.getenv("COMPANY_SERVICE_URL", "http://company_service:8000")

class CompanyServiceError(Exception):
    """Custom exception for company service errors."""
    pass

class CompanyNotFound(CompanyServiceError):
    """Exception raised when a company is not found (404)."""
    pass

def get_company(company_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves company details from the company microservice.

    Args:
        company_id: The unique identifier for the company.

    Returns:
        A dictionary containing the company data if the request is successful (200 OK).
        None if the company is not found (404 Not Found).

    Raises:
        CompanyServiceError: For connection issues or unexpected errors from the service.
        requests.exceptions.HTTPError: For HTTP errors other than 404.
    """
    if not company_id:
        raise ValueError("company_id cannot be empty")

    request_url = f"{COMPANY_SERVICE_BASE_URL}/companies/{company_id}"
    logger.info(f"Requesting company data from: {request_url}")

    try:
        response = requests.get(request_url, timeout=10) # Set a reasonable timeout

        if response.status_code == 200:
            logger.info(f"Successfully retrieved company data for ID: {company_id}")
            try:
                return response.json()
            except ValueError as json_error:
                logger.error(f"Failed to decode JSON response for company {company_id}: {json_error}")
                raise CompanyServiceError(f"Invalid JSON response from company service for company {company_id}") from json_error

        elif response.status_code == 404:
            logger.warning(f"Company not found for ID: {company_id}")
            return None # Return None for 404 as requested

        else:
            # For other non-success status codes (e.g., 4xx client errors, 5xx server errors)
            logger.error(f"Company service returned error {response.status_code} for company {company_id}: {response.text}")
            response.raise_for_status() # Raise an HTTPError for other bad responses

    except requests.exceptions.Timeout:
        logger.error(f"Request timed out while fetching company {company_id} from {request_url}")
        raise CompanyServiceError(f"Timeout connecting to company service for company {company_id}")
    except requests.exceptions.ConnectionError as conn_err:
        logger.error(f"Connection error while fetching company {company_id} from {request_url}: {conn_err}")
        raise CompanyServiceError(f"Could not connect to company service for company {company_id}")
    except requests.exceptions.RequestException as req_err:
        # Catch any other request-related errors
        logger.error(f"An unexpected request error occurred for company {company_id}: {req_err}")
        raise CompanyServiceError(f"An unexpected error occurred while fetching company {company_id}")

    # This line should ideally not be reached if error handling is exhaustive
    return None