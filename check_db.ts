import { supabase } from './src/utils/supabase';

async function validateSchema() {
    console.log('Connecting to Supabase...');

    // Check Customers Table
    const { error: customerError } = await supabase.from('customers').select('id').limit(1);
    if (customerError) {
        console.error('❌ Error checking customers table:', customerError.message);
    } else {
        console.log('✅ Customers table exists and is accessible.');
    }

    // Check Products Table
    const { error: productError } = await supabase.from('products').select('id, stock').limit(1);
    if (productError) {
        console.error('❌ Error checking products table:', productError.message);
    } else {
        console.log('✅ Products table exists and is accessible.');
    }

    // Unfortunately, checking if an RPC exists specifically without running it or querying pg_proc isn't simple with anon key, 
    // but we can try running it with invalid params and see if it complains about params vs 'not found'.
    const { error: rpcError } = await supabase.rpc('create_order', {
        p_customer_id: 'dummy',
        p_items: []
    });

    if (rpcError) {
        if (rpcError.message.includes('Could not find')) {
            console.error('❌ Error checking create_order RPC:', rpcError.message);
        } else {
            // It exists but failed execution (e.g., invalid input uuid), which means the RPC is there.
            console.log('✅ create_order RPC seems to exist (failed execution due to dummy data: ' + rpcError.message + ').');
        }
    } else {
        console.log('✅ create_order RPC exists.');
    }

    console.log('Validation complete.');
}

validateSchema();
