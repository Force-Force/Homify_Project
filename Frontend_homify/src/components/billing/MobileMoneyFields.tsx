import { useTranslation } from 'react-i18next';
import { PaymentOperator } from '@/services/billingService';
import { inputClass } from '@/lib/formStyles';

export interface MobileMoneyFormValues {
  phone_number: string;
  operator: PaymentOperator;
}

interface MobileMoneyFieldsProps {
  values: MobileMoneyFormValues;
  onChange: (values: MobileMoneyFormValues) => void;
  disabled?: boolean;
}

export function MobileMoneyFields({ values, onChange, disabled }: MobileMoneyFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-homify-muted mb-1.5">
          {t('billing.phoneLabel')}
        </label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="6XX XXX XXX"
          value={values.phone_number}
          disabled={disabled}
          onChange={(e) => onChange({ ...values, phone_number: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-homify-muted mb-1.5">
          {t('billing.operatorLabel')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['MTN_Cameroon', 'Orange_Cameroon'] as PaymentOperator[]).map((op) => (
            <button
              key={op}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...values, operator: op })}
              className={`py-2.5 rounded-btn text-sm font-semibold border transition ${
                values.operator === op
                  ? 'border-homify-accent bg-homify-accent/10 text-homify-accent'
                  : 'border-homify-border text-homify-muted hover:border-homify-primary/30'
              }`}
            >
              {op === 'MTN_Cameroon' ? 'MTN MoMo' : 'Orange Money'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-homify-muted">{t('billing.mobileMoneyHint')}</p>
    </div>
  );
}
