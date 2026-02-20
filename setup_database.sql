-- Create Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'completed',
    total NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0)
);

-- Create the RPC function to handle the order transaction atomically
CREATE OR REPLACE FUNCTION create_order(
    p_customer_id UUID,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC := 0;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_product_price NUMERIC;
BEGIN
    -- 1. Create the order framework
    INSERT INTO orders (customer_id, status, total)
    VALUES (p_customer_id, 'processing', 0)
    RETURNING id INTO v_order_id;

    -- 2. Process each item (decrement stock, calculate total, insert order_items)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'productId')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;

        -- Get price and lock the product row for update
        SELECT price INTO v_product_price FROM products WHERE id = v_product_id FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;

        -- Update stock
        UPDATE products 
        SET stock = stock - v_quantity 
        WHERE id = v_product_id AND stock >= v_quantity;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
        END IF;

        -- Calculate item total
        v_total := v_total + (v_product_price * v_quantity);

        -- Insert into order items
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (v_order_id, v_product_id, v_quantity, v_product_price);
    END LOOP;

    -- 3. Update the order total and status
    UPDATE orders 
    SET total = v_total, status = 'completed'
    WHERE id = v_order_id;

    -- Return the result expected by our Fastify service
    RETURN jsonb_build_object(
        'id', v_order_id,
        'total', v_total
    );
END;
$$;

-- Insert some dummy data to be able to test right away
INSERT INTO customers (id, name, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, price, stock) VALUES 
('22222222-2222-2222-2222-222222222222', 'Laptop', 999.99, 50),
('33333333-3333-3333-3333-333333333333', 'Mouse', 49.99, 100)
ON CONFLICT DO NOTHING;

-- Turn on RLS but allow anon access for testing purposes, or just setup basic policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read customers" ON customers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all orders" ON orders FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon all order_items" ON order_items FOR ALL TO anon USING (true);
