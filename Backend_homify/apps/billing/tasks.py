"""
Celery tasks — poll Aangaraa Pay until payment confirmed or timeout.
"""
import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(ignore_result=True)
def poll_payment_order_task(order_id: int):
    """Background poll: check provider status and update order in DB."""
    from .services import BillingService

    result = BillingService.run_payment_status_poll(order_id)
    logger.info(
        'Payment poll finished for order %s → %s',
        order_id,
        result.status if result else 'missing',
    )
