"""
Aangaraa Pay API client — Mobile Money Cameroon (MTN / Orange).
"""
import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass

from django.conf import settings

logger = logging.getLogger(__name__)


class AangaraaPayError(Exception):
    """Aangaraa Pay API error."""

    def __init__(self, message, status_code=None, payload=None):
        self.message = message
        self.status_code = status_code
        self.payload = payload or {}
        super().__init__(message)


OPERATORS = {
    'MTN_Cameroon': 'MTN_Cameroon',
    'Orange_Cameroon': 'Orange_Cameroon',
    'MTN': 'MTN_Cameroon',
    'ORANGE': 'Orange_Cameroon',
}


@dataclass
class PaymentInitResult:
    transaction_id: str
    pay_token: str | None
    status: str
    payment_url: str | None
    raw: dict


@dataclass
class PaymentStatusResult:
    status: str
    transaction_id: str | None
    pay_token: str | None
    amount: float | None
    raw: dict


class AangaraaPayClient:
    """Thin wrapper around Aangaraa Pay REST endpoints."""

    def __init__(self):
        self.app_key = getattr(settings, 'AANGARAAPAY_APP_KEY', '')
        base = getattr(settings, 'AANGARAAPAY_API_BASE_URL', 'https://api-production.aangaraa-pay.com')
        self.api_base = f'{base.rstrip("/")}/api/v1'
        self.checkout_base = getattr(
            settings,
            'AANGARAAPAY_CHECKOUT_BASE_URL',
            'https://aangaraa-pay.com',
        ).rstrip('/')

    @property
    def configured(self) -> bool:
        return bool(self.app_key)

    def _post(self, path: str, payload: dict) -> dict:
        url = f'{self.api_base}/{path.lstrip("/")}'
        body = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=body,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode('utf-8')
            try:
                payload_err = json.loads(raw)
            except json.JSONDecodeError:
                payload_err = {'message': raw or str(exc)}
            message = payload_err.get('message') or payload_err.get('error') or raw or str(exc)
            raise AangaraaPayError(message, status_code=exc.code, payload=payload_err) from exc
        except urllib.error.URLError as exc:
            raise AangaraaPayError(f'Connexion Aangaraa Pay impossible : {exc.reason}') from exc

    def _absolute_payment_url(self, payment_url: str | None) -> str | None:
        if not payment_url:
            return None
        if payment_url.startswith('http://') or payment_url.startswith('https://'):
            return payment_url
        return f'{self.checkout_base}{payment_url}'

    def initiate_no_redirect(
        self,
        *,
        phone_number: str,
        amount: int | float,
        description: str,
        transaction_id: str,
        operator: str,
        notify_url: str,
        return_url: str,
        user_name: str = '',
        user_email: str = '',
    ) -> PaymentInitResult:
        operator_key = OPERATORS.get(operator, operator)
        payload = {
            'phone_number': normalize_phone(phone_number),
            'amount': str(int(amount)),
            'description': description[:250],
            'app_key': self.app_key,
            'transaction_id': transaction_id,
            'return_url': return_url,
            'notify_url': notify_url,
            'operator': operator_key,
            'devise_id': 'XAF',
        }
        if user_name:
            payload['user_name'] = user_name
        if user_email:
            payload['user_email'] = user_email

        data = self._post('no_redirect/payment', payload)
        inner = data.get('data') or {}
        return PaymentInitResult(
            transaction_id=transaction_id,
            pay_token=inner.get('payToken') or inner.get('paytoken'),
            status=inner.get('status') or data.get('message') or 'PENDING',
            payment_url=None,
            raw=data,
        )

    def initiate_redirect(
        self,
        *,
        amount: int | float,
        description: str,
        transaction_id: str,
        operator: str,
        notify_url: str,
        return_url: str,
        user_name: str = '',
        user_email: str = '',
        user_phone_number: str = '',
    ) -> PaymentInitResult:
        operator_key = OPERATORS.get(operator, operator)
        payload = {
            'amount': float(amount),
            'description': description[:250],
            'app_key': self.app_key,
            'transaction_id': transaction_id,
            'return_url': return_url,
            'notify_url': notify_url,
            'operator': operator_key,
            'devise_id': 'XAF',
        }
        if user_name:
            payload['user_name'] = user_name
        if user_email:
            payload['user_email'] = user_email
        if user_phone_number:
            payload['user_phone_number'] = normalize_phone(user_phone_number)

        data = self._post('redirect/payment', payload)
        inner = data.get('data') or {}
        return PaymentInitResult(
            transaction_id=transaction_id,
            pay_token=None,
            status='PENDING',
            payment_url=self._absolute_payment_url(inner.get('payment_url')),
            raw=data,
        )

    def check_status(self, pay_token: str) -> PaymentStatusResult:
        data = self._post('aangaraa_check_status', {
            'payToken': pay_token,
            'app_key': self.app_key,
        })
        return PaymentStatusResult(
            status=(data.get('status') or 'PENDING').upper(),
            transaction_id=data.get('transaction_id'),
            pay_token=data.get('pay_token') or pay_token,
            amount=data.get('amount'),
            raw=data,
        )


def normalize_phone(phone: str) -> str:
    """Ensure Cameroon MSISDN format (237XXXXXXXXX)."""
    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('237'):
        return digits
    if digits.startswith('0'):
        return f'237{digits[1:]}'
    return f'237{digits}'


def map_webhook_status(status: str) -> str:
    normalized = (status or '').upper()
    if normalized == 'SUCCESSFUL':
        return 'COMPLETED'
    if normalized in ('FAILED', 'CANCELLED', 'EXPIRED'):
        return 'CANCELLED' if normalized in ('CANCELLED', 'EXPIRED') else 'FAILED'
    return 'PENDING'
