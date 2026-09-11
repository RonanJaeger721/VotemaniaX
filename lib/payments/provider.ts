export type PaymentState =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'expired';
export interface PaymentProvider {
  createPayment(input: {
    reference: string;
    amount: number;
    currency: string;
    method: string;
    returnUrl: string;
  }): Promise<{ providerReference: string; redirectUrl: string }>;
  checkPaymentStatus(providerReference: string): Promise<PaymentState>;
  verifyCallback(
    request: Request,
  ): Promise<{ providerReference: string; state: PaymentState }>;
}
export class UnconfiguredPaymentProvider implements PaymentProvider {
  private fail(): never {
    throw new Error(
      'Production payment provider is not configured. No payment or vote was created.',
    );
  }
  async createPayment(): Promise<never> {
    return this.fail();
  }
  async checkPaymentStatus(): Promise<never> {
    return this.fail();
  }
  async verifyCallback(): Promise<never> {
    return this.fail();
  }
}
export function getPaymentProvider(): PaymentProvider {
  return new UnconfiguredPaymentProvider();
}
