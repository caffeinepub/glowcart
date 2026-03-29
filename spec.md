# GlowCart

## Current State
Checkout dialog collects name, phone, address, pincode and places order. No payment method selection exists.

## Requested Changes (Diff)

### Add
- Payment method selection in checkout: COD, UPI, Credit/Debit Card
- COD has no extra charge (same total as other methods)
- UPI: show UPI ID input field
- Credit/Debit Card: show card number, expiry, CVV fields
- Selected payment method stored in form state and shown in order summary

### Modify
- `handlePlaceOrder`: pass payment method to order or note it in success screen
- Checkout form state: add `paymentMethod` field
- Success screen: show selected payment method

### Remove
- Nothing removed

## Implementation Plan
1. Add `paymentMethod` and related fields (upiId, cardNumber, expiry, cvv) to form state
2. Add payment method selector UI after pincode field (radio-style cards: COD, UPI, Card)
3. Show conditional sub-fields for UPI and Card
4. Validate payment sub-fields before placing order
5. Show payment method on success screen
