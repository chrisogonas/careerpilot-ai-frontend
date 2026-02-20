# Stripe Integration Documentation

## Overview

CareerPilot AI uses Stripe to handle subscription management and payment processing. This document describes the Stripe integration architecture, setup process, and how to use the subscription features.

## Architecture

### Type System

The Stripe integration uses comprehensive TypeScript type definitions in `lib/types/index.ts`:

- **Plan**: Represents pricing plans (Free, Pro, Premium)
- **Subscription**: User subscription status and details
- **StripeCustomer**: Stripe customer information mapping
- **Payment Types**: Checkout sessions, payment intents, subscriptions
- **Billing Types**: Billing events and history

### API Client

The `lib/utils/api.ts` file includes Stripe-specific API methods:

```typescript
// Get available plans
getPlans(): Promise<Plan[]>

// Get user's current subscription
getSubscription(): Promise<GetSubscriptionResponse>

// Create a checkout session
createCheckoutSession(payload): Promise<CreateCheckoutSessionResponse>

// Update subscription to a new plan
updateSubscription(payload): Promise<UpdateSubscriptionResponse>

// Cancel active subscription
cancelSubscription(payload): Promise<CancelSubscriptionResponse>

// Create payment intent (for custom payments)
createPaymentIntent(payload): Promise<PaymentIntentResponse>

// Get billing history
getBillingHistory(): Promise<GetBillingHistoryResponse>
```

### Authentication Context

The `useAuth()` hook includes subscription methods:

```typescript
// State
subscription: Subscription | null
currentPlan: Plan | null

// Methods
getSubscription(): Promise<void>
getPlans(): Promise<Plan[]>
createCheckoutSession(priceId, successUrl, cancelUrl): Promise<string>
updateSubscription(newPlan, billingCycle?): Promise<void>
cancelSubscription(atPeriodEnd?): Promise<void>
getBillingHistory(): Promise<BillingEvent[]>
```

## Pages

### `/subscribe` - Plan Selection

**Purpose**: Display available plans and allow users to upgrade

**Features**:
- Shows Free, Pro, and Premium plans
- Monthly/Yearly billing toggle (20% save on yearly)
- Plan comparison with features and pricing
- Redirect to Stripe Checkout on plan selection
- FAQ section answering common questions

**Flow**:
1. User clicks "Upgrade" link in navbar
2. Browse available plans
3. Select billing cycle (monthly/yearly)
4. Click plan button → Stripe Checkout session created
5. Redirected to `{STRIPE_PUBLISHABLE_KEY}` hosted checkout
6. After payment → Redirected to `/billing?success=true`

### `/billing` - Subscription Management

**Purpose**: View and manage active subscription and billing history

**Features**:
- Current plan display with status and billing dates
- Upgrade/change plan functionality
- Cancel subscription (with confirmation modal)
- Billing history table showing all charges and refunds
- Payment method management link to Stripe portal
- Plan details card showing included features

**Sections**:
1. **Current Plan**: Shows active subscription status
2. **Plan Details**: Features and limits of current plan
3. **Billing History**: Transaction log with dates, types, and amounts
4. **Payment Methods**: Link to Stripe customer portal

## Setup

### Environment Variables

Add the following to `.env.local`:

```env
# Stripe Public Key (visible to frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX

# Backend Stripe Secret Key (NOT exposed to frontend)
# This should be set on your backend server
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXX
```

### Dependencies

Install Stripe packages:

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

### Stripe Setup

1. **Create Stripe Account**: https://stripe.com
2. **Get API Keys**: 
   - Go to Dashboard → Developers → API Keys
   - Copy Publishable Key and Secret Key
3. **Create Products and Prices**:
   - Free Plan (no Stripe price needed)
   - Pro Plan: Monthly ($29) and Yearly ($290)
   - Premium Plan: Monthly ($99) and Yearly ($990)
4. **Setup Webhooks** (for backend):
   - `charge.succeeded`
   - `charge.failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Usage

### Check User's Subscription

```typescript
import { useAuth } from '@/lib/context/AuthContext';

export default function Dashboard() {
  const { subscription, currentPlan } = useAuth();
  
  return (
    <div>
      <p>Plan: {subscription?.plan}</p>
      <p>Status: {subscription?.status}</p>
      <p>Features: {currentPlan?.monthly_credits} credits</p>
    </div>
  );
}
```

### Upgrade Plan

```typescript
const { subscription, updateSubscription } = useAuth();

const handleUpgrade = async () => {
  try {
    await updateSubscription('pro', 'monthly');
    // Subscription updated
  } catch (error) {
    console.error('Upgrade failed:', error);
  }
};
```

### Get User's Subscription Data

```typescript
const { getSubscription } = useAuth();

useEffect(() => {
  getSubscription(); // Loads subscription and currentPlan
}, [getSubscription]);
```

## Plan Structure

Plans are defined in the backend and returned by the `/stripe/plans` endpoint:

```typescript
interface Plan {
  id: string;
  name: "free" | "pro" | "premium";
  display_name: string;
  price_monthly: number; // in cents
  price_yearly: number; // in cents
  currency: string;
  description: string;
  features: string[];
  max_resumes: number;
  monthly_credits: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}
```

## Subscription Status

Subscriptions have the following statuses:

- **active**: Subscription is active and user has access
- **trialing**: Trial period (if enabled)
- **past_due**: Payment failed but user still has access
- **canceled**: User canceled; access ends at period end
- **unpaid**: Multiple failed payments
- **paused**: Subscription paused (if supported)

## Billing Cycle

Users can choose between:
- **Monthly**: Charge every month
- **Yearly**: Charge once per year (typically 20% discount)

## Checkout Flow

1. **Initiate Checkout**:
   ```typescript
   const checkoutUrl = await createCheckoutSession(
     priceId,
     'https://example.com/billing?success=true',
     'https://example.com/subscribe'
   );
   ```

2. **Redirect to Stripe**:
   ```typescript
   window.location.href = checkoutUrl;
   ```

3. **Stripe Handles Payment**: User enters card details on Stripe-hosted page

4. **Redirect Back**: 
   - Success: → `/billing?success=true`
   - Cancel: → `/subscribe`

## Webhook Handling (Backend)

When Stripe events occur, webhooks should update the database:

```
charge.succeeded → Update billing_events table
subscription.created → Create subscription record
subscription.updated → Update subscription status
subscription.deleted → Mark subscription as canceled
```

## Error Handling

Common error scenarios:

- **Declined Card**: User sees error on Stripe checkout page
- **Network Error**: Retry logic in API client
- **Invalid Plan**: Check `stripe_price_id_monthly/yearly` is set
- **No Session**: User not authenticated → redirect to login
- **Quota Exceeded**: User reached max resumes/credits → show upgrade prompt

## Testing

### Test Cards

Use these cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0000 0000 3220`

Any future date and any 3-digit CVC.

### Test Environment

1. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to test key
2. Backend uses test secret key
3. Stripe creates test subscriptions without charging

## Best Practices

1. **Always validate plan existence** before checkout
2. **Store subscription data** in database, not just frontend
3. **Handle expired sessions** gracefully
4. **Sync subscriptions** periodically with Stripe API
5. **Log all payment events** for support
6. **Test all error flows** before production
7. **Use Stripe dashboard** to monitor transactions
8. **Enable webhook security** with signing key verification
9. **Never expose secret key** to frontend
10. **Refresh subscription** after successful payment

## Migration to Production

1. **Get Production Keys**: Get live keys from Stripe
2. **Update Environment**: Set `pk_live_` and `sk_live_` keys
3. **Test Thoroughly**: Use test cards first, then small real charge
4. **Enable Webhooks**: Configure webhook endpoints on backend
5. **Monitor**: Watch Stripe dashboard for issues
6. **Document Prices**: Keep product/price IDs in sync with frontend

## Troubleshooting

### Issue: "Price ID not found"
**Solution**: Verify `stripe_price_id_monthly/yearly` is set for plan in backend

### Issue: Checkout session fails
**Solution**: Check API credentials, verify plan exists, check network logs

### Issue: Subscription not updating
**Solution**: Verify webhook received, check database update logic

### Issue: User sees cached plan
**Solution**: Call `getSubscription()` to refresh subscription data

## Related Documentation

- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhook Security](https://stripe.com/docs/webhooks/securing)

## Next Steps

1. Set up Stripe account and get API keys
2. Create products and prices in Stripe
3. Configure environment variables
4. Test checkout flow with test cards
5. Implement backend webhook handlers
6. Monitor subscription metrics in Stripe dashboard

