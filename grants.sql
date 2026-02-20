-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions to anon role so policies can take effect
GRANT SELECT ON customers TO anon;
GRANT SELECT ON products TO anon;
GRANT ALL ON orders TO anon;
GRANT ALL ON order_items TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
