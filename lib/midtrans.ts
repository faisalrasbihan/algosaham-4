// Midtrans API configuration and helper functions

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
// Use explicit MIDTRANS_IS_PRODUCTION flag, fallback to checking NODE_ENV
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true' || process.env.NODE_ENV === 'production';

const BASE_URL = IS_PRODUCTION
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';

// Basic auth header for Midtrans API
const getAuthHeader = () => {
    const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    return `Basic ${authString}`;
};

export interface SubscriptionSchedule {
    interval: number;
    interval_unit: 'day' | 'week' | 'month' | 'year';
    max_interval?: number;
    start_time?: string;
}

export interface SubscriptionRetrySchedule {
    interval: number;
    interval_unit: 'day' | 'hour' | 'minute';
    max_interval: number;
}

export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
}

export interface CreateSubscriptionRequest {
    name: string;
    amount: string;
    currency: 'IDR';
    payment_type: 'credit_card' | 'gopay';
    token: string;
    schedule: SubscriptionSchedule;
    retry_schedule?: SubscriptionRetrySchedule;
    metadata?: Record<string, unknown>;
    customer_details?: CustomerDetails;
    gopay?: {
        account_id: string;
    };
}

export interface SubscriptionResponse {
    id: string;
    name: string;
    amount: string;
    currency: string;
    created_at: string;
    schedule: SubscriptionSchedule;
    status: 'active' | 'inactive' | 'pending';
    token: string;
    payment_type: string;
    transaction_ids?: string[];
    metadata?: Record<string, unknown>;
    customer_details?: CustomerDetails;
}

export interface MidtransError {
    status_code: string;
    status_message: string;
    id?: string;
}

// ==========================================
// GoPay Tokenization (Account Linking) APIs
// ==========================================

export interface CreatePayAccountRequest {
    payment_type: 'gopay';
    gopay_partner: {
        phone_number: string;
        country_code: string;
        redirect_url: string;
    };
}

export interface PayAccountAction {
    name: string;
    method: string;
    url: string;
}

export interface CreatePayAccountResponse {
    status_code: string;
    payment_type: string;
    account_id: string;
    account_status: string;
    actions: PayAccountAction[];
    metadata?: {
        payment_options?: Array<{
            name: string;
            active: boolean;
            balance?: { value: string; currency: string };
            metadata?: Record<string, unknown>;
            token: string;
        }>;
        reference_id?: string;
    };
    status_message?: string;
}

export interface GetPayAccountResponse {
    status_code: string;
    payment_type: string;
    account_id: string;
    account_status: 'PENDING' | 'ENABLED' | 'DISABLED' | 'EXPIRED';
    metadata?: {
        payment_options?: Array<{
            name: string;
            active: boolean;
            balance?: { value: string; currency: string };
            metadata?: Record<string, unknown>;
            token: string;
        }>;
    };
}

/**
 * Create a GoPay Pay Account (initiate account linking)
 * User needs to complete the linking via the returned action URL
 */
export async function createPayAccount(
    data: CreatePayAccountRequest
): Promise<CreatePayAccountResponse> {
    const url = `${BASE_URL}/v2/pay/account`;

    console.log('[Midtrans] Creating pay account:', {
        url,
        payment_type: data.payment_type,
        phone: data.gopay_partner.phone_number,
        redirect_url: data.gopay_partner.redirect_url,
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log('[Midtrans] Pay account response:', {
        status: response.status,
        ok: response.ok,
        result: JSON.stringify(result),
    });

    if (!response.ok) {
        console.error('[Midtrans] Pay account error:', result);
        throw new Error(result.status_message || `Failed to create pay account (${response.status})`);
    }

    return result as CreatePayAccountResponse;
}

/**
 * Get GoPay Pay Account status
 * Check if the account linking is complete
 */
export async function getPayAccount(
    accountId: string
): Promise<GetPayAccountResponse> {
    const response = await fetch(`${BASE_URL}/v2/pay/account/${accountId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to get pay account');
    }

    return result as GetPayAccountResponse;
}

/**
 * Unbind (unlink) a GoPay Pay Account
 */
export async function unbindPayAccount(
    accountId: string
): Promise<{ status_code: string; status_message: string; account_id: string; account_status: string }> {
    const response = await fetch(`${BASE_URL}/v2/pay/account/${accountId}/unbind`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to unbind pay account');
    }

    return result;
}

/**
 * Create a new subscription in Midtrans
 */
export async function createSubscription(
    data: CreateSubscriptionRequest
): Promise<SubscriptionResponse> {
    const response = await fetch(`${BASE_URL}/v1/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to create subscription');
    }

    return result as SubscriptionResponse;
}

/**
 * Get subscription details from Midtrans
 */
export async function getSubscription(
    subscriptionId: string
): Promise<SubscriptionResponse> {
    const response = await fetch(`${BASE_URL}/v1/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to get subscription');
    }

    return result as SubscriptionResponse;
}

/**
 * Disable a subscription (pause recurring charges)
 */
export async function disableSubscription(
    subscriptionId: string
): Promise<{ status_message: string }> {
    const response = await fetch(`${BASE_URL}/v1/subscriptions/${subscriptionId}/disable`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to disable subscription');
    }

    return result;
}

/**
 * Enable a previously disabled subscription
 */
export async function enableSubscription(
    subscriptionId: string
): Promise<{ status_message: string }> {
    const response = await fetch(`${BASE_URL}/v1/subscriptions/${subscriptionId}/enable`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to enable subscription');
    }

    return result;
}

/**
 * Cancel a subscription permanently
 */
export async function cancelSubscription(
    subscriptionId: string
): Promise<{ status_message: string }> {
    const response = await fetch(`${BASE_URL}/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to cancel subscription');
    }

    return result;
}

/**
 * Update subscription details
 */
export async function updateSubscription(
    subscriptionId: string,
    data: Partial<Pick<CreateSubscriptionRequest, 'name' | 'amount' | 'schedule' | 'retry_schedule' | 'gopay' | 'token'>>
): Promise<SubscriptionResponse> {
    const response = await fetch(`${BASE_URL}/v1/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.status_message || 'Failed to update subscription');
    }

    return result as SubscriptionResponse;
}

// Snap integration for getting tokens
export interface SnapTransactionRequest {
    transaction_details: {
        order_id: string;
        gross_amount: number;
    };
    credit_card?: {
        secure: boolean;
        save_card: boolean;
    };
    customer_details?: CustomerDetails;
    callbacks?: {
        finish?: string;
        error?: string;
        pending?: string;
    };
    enabled_payments?: string[];
}

export interface SnapTokenResponse {
    token: string;
    redirect_url: string;
}

/**
 * Get Snap token for payment popup
 */
export async function getSnapToken(
    data: SnapTransactionRequest
): Promise<SnapTokenResponse> {
    const snapUrl = IS_PRODUCTION
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const response = await fetch(snapUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error_messages?.join(', ') || 'Failed to get snap token');
    }

    return result as SnapTokenResponse;
}

// Export client key for frontend
export const getMidtransClientKey = () => MIDTRANS_CLIENT_KEY;
export const isMidtransProduction = () => IS_PRODUCTION;
