import { supabase } from '../../utils/supabase.js';
import { AppError } from '../../utils/errors.js';

export class OrderService {
    async processOrder(orderInput) {
        // 1. Parallel Validations: Validate Customer and Stock
        const validationPromises = [
            this.validateCustomer(orderInput.customerId),
            this.validateStock(orderInput.items),
        ];

        const results = await Promise.allSettled(validationPromises);

        const errors = results
            .filter((r) => r.status === 'rejected')
            .map(r => r.reason.message);

        if (errors.length > 0) {
            throw new AppError(`Validation failed: ${errors.join(', ')}`, 400);
        }

        // 2. Perform DB transaction using RPC with Retry Logic
        const orderData = await this.executeRpcWithRetry('create_order', {
            p_customer_id: orderInput.customerId,
            p_items: orderInput.items,
        });

        return {
            id: orderData.id,
            customerId: orderInput.customerId,
            status: 'success',
            total: orderData.total,
        };
    }

    async validateCustomer(customerId) {
        const { data, error } = await supabase
            .from('customers')
            .select('id')
            .eq('id', customerId)
            .single();

        if (error || !data) {
            throw new Error(`Customer ${customerId} not found`);
        }
    }

    async validateStock(items) {
        const productIds = items.map(i => i.productId);
        const { data, error } = await supabase
            .from('products')
            .select('id, stock')
            .in('id', productIds);

        if (error || !data) {
            throw new Error(`Could not verify stock`);
        }

        for (const item of items) {
            const product = data.find(p => p.id === item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.productId}`);
            }
        }
    }

    async executeRpcWithRetry(rpcName, params, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const { data, error } = await supabase.rpc(rpcName, params);

            if (!error) {
                return data; // Success
            }

            // Retry mechanism for transient errors
            if (attempt === retries) {
                throw new AppError(`DB Transaction failed after ${retries} attempts: ${error.message}`, 500);
            }

            // Exponential backoff
            const delay = Math.pow(2, attempt) * 100;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

export const orderService = new OrderService();
