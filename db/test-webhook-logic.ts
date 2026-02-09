/**
 * Test script to verify webhook payment processing logic
 * Run with: npx tsx db/test-webhook-logic.ts
 */

import crypto from 'crypto';

// Simulate the webhook notification structure
interface MidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    settlement_time?: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status?: string;
    currency: string;
}

// Test signature verification
function verifySignature(notification: MidtransNotification, serverKey: string): boolean {
    const { order_id, status_code, gross_amount, signature_key } = notification;
    const payload = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto.createHash('sha512').update(payload).digest('hex');
    return calculatedSignature === signature_key;
}

// Test order ID parsing
function parseOrderId(orderId: string): { planType: string; userId: string } | null {
    const parts = orderId.split('-');
    if (parts.length < 4 || parts[0] !== 'AS') {
        return null;
    }

    const planInitial = parts[1];
    const planType = planInitial === 'S' ? 'suhu' : planInitial === 'B' ? 'bandar' : 'ritel';
    const userId = parts[2];

    return { planType, userId };
}

// Test billing interval detection
function getBillingInterval(amount: string, planType: string): 'monthly' | 'yearly' {
    const numAmount = parseInt(amount, 10);
    const monthlyPrices = { suhu: 99000, bandar: 189000 };

    if (planType === 'suhu' && numAmount === monthlyPrices.suhu) return 'monthly';
    if (planType === 'bandar' && numAmount === monthlyPrices.bandar) return 'monthly';

    return 'yearly';
}

// Test period calculation
function calculatePeriod(billingInterval: 'monthly' | 'yearly') {
    const now = new Date();
    const periodStart = now;
    let periodEnd: Date;

    if (billingInterval === 'monthly') {
        periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
        periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    return { periodStart, periodEnd };
}

// Run tests
console.log('🧪 Testing Webhook Logic\n');

// Test 1: Order ID Parsing
console.log('Test 1: Order ID Parsing');
const testOrderIds = [
    'AS-S-user_2abc-1707512345678',
    'AS-B-user_xyz9-1707512345679',
    'INVALID-ORDER-ID',
];

testOrderIds.forEach(orderId => {
    const result = parseOrderId(orderId);
    console.log(`  ${orderId} =>`, result);
});

// Test 2: Billing Interval Detection
console.log('\nTest 2: Billing Interval Detection');
const testAmounts = [
    { amount: '99000', planType: 'suhu', expected: 'monthly' },
    { amount: '594000', planType: 'suhu', expected: 'yearly' }, // 99000 * 12 / 2 = 594000
    { amount: '189000', planType: 'bandar', expected: 'monthly' },
    { amount: '1134000', planType: 'bandar', expected: 'yearly' }, // 189000 * 12 / 2 = 1134000
];

testAmounts.forEach(({ amount, planType, expected }) => {
    const result = getBillingInterval(amount, planType);
    const status = result === expected ? '✅' : '❌';
    console.log(`  ${status} ${planType} @ Rp${amount} => ${result} (expected: ${expected})`);
});

// Test 3: Period Calculation
console.log('\nTest 3: Period Calculation');
const monthlyPeriod = calculatePeriod('monthly');
const yearlyPeriod = calculatePeriod('yearly');

console.log('  Monthly subscription:');
console.log(`    Start: ${monthlyPeriod.periodStart.toISOString()}`);
console.log(`    End:   ${monthlyPeriod.periodEnd.toISOString()}`);
console.log(`    Days:  ${Math.round((monthlyPeriod.periodEnd.getTime() - monthlyPeriod.periodStart.getTime()) / (1000 * 60 * 60 * 24))}`);

console.log('  Yearly subscription:');
console.log(`    Start: ${yearlyPeriod.periodStart.toISOString()}`);
console.log(`    End:   ${yearlyPeriod.periodEnd.toISOString()}`);
console.log(`    Days:  ${Math.round((yearlyPeriod.periodEnd.getTime() - yearlyPeriod.periodStart.getTime()) / (1000 * 60 * 60 * 24))}`);

// Test 4: Signature Verification
console.log('\nTest 4: Signature Verification');
const serverKey = 'test-server-key';
const testNotification: MidtransNotification = {
    order_id: 'AS-S-user_2abc-1707512345678',
    status_code: '200',
    gross_amount: '99000',
    transaction_time: new Date().toISOString(),
    transaction_status: 'settlement',
    transaction_id: 'test-txn-123',
    status_message: 'Success',
    payment_type: 'credit_card',
    merchant_id: 'test-merchant',
    currency: 'IDR',
    signature_key: '', // Will be calculated
};

// Calculate correct signature
const payload = `${testNotification.order_id}${testNotification.status_code}${testNotification.gross_amount}${serverKey}`;
const correctSignature = crypto.createHash('sha512').update(payload).digest('hex');
testNotification.signature_key = correctSignature;

const isValid = verifySignature(testNotification, serverKey);
console.log(`  Valid signature: ${isValid ? '✅' : '❌'}`);

// Test with wrong signature
testNotification.signature_key = 'wrong-signature';
const isInvalid = verifySignature(testNotification, serverKey);
console.log(`  Invalid signature rejected: ${!isInvalid ? '✅' : '❌'}`);

console.log('\n✨ All tests completed!\n');
