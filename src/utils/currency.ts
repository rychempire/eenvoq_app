// Currency configuration and utilities

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateFromUSD: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'USD ($)', rateFromUSD: 1.0 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Naira (₦)', rateFromUSD: 1500.0 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedis (GH₵)', rateFromUSD: 15.0 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)', rateFromUSD: 130.0 },
  GBP: { code: 'GBP', symbol: '£', name: 'Pounds (£)', rateFromUSD: 0.80 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euros (€)', rateFromUSD: 0.92 }
};

// Returns the current selected currency from localStorage, defaulting to 'USD'
export function getStoredCurrency(): string {
  const saved = localStorage.getItem('eenvoq_selected_currency');
  if (saved && CURRENCIES[saved]) {
    return saved;
  }
  return 'USD';
}

// Stores the selected currency in localStorage
export function setStoredCurrency(code: string): void {
  if (CURRENCIES[code]) {
    localStorage.setItem('eenvoq_selected_currency', code);
  }
}

// Converts a base Naira numeric amount (the original scale in demodata/codebase)
// to the designated target currency.
export function convertFromNairaBase(nairaAmount: number, targetCurrency: string): number {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  // Base scale is Naira (1 NGN).
  // 1500 NGN = 1 USD.
  const usdAmount = nairaAmount / 1500.0;
  return usdAmount * config.rateFromUSD;
}

// Converts from a USD numeric amount to the target currency
export function convertFromUSDBase(usdAmount: number, targetCurrency: string): number {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  return usdAmount * config.rateFromUSD;
}

// Formats a base Naira amount into a clean, localized string in the target currency
export function formatCurrency(
  nairaAmount: number, 
  targetCurrencyCode: string = getStoredCurrency(), 
  decimals: number = 2
): string {
  const converted = convertFromNairaBase(nairaAmount, targetCurrencyCode);
  const config = CURRENCIES[targetCurrencyCode] || CURRENCIES.USD;
  
  // Format beautifully using standard locale rules
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${config.symbol}${formatted}`;
}

// Helper to format a USD-scaled base amount into the target currency
export function formatFromUSD(
  usdAmount: number,
  targetCurrencyCode: string = getStoredCurrency(),
  decimals: number = 2
): string {
  const converted = convertFromUSDBase(usdAmount, targetCurrencyCode);
  const config = CURRENCIES[targetCurrencyCode] || CURRENCIES.USD;
  
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${config.symbol}${formatted}`;
}
