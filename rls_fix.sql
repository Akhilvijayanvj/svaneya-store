CREATE POLICY "Allow public inserts" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public inserts" ON order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public updates" ON products FOR UPDATE TO public USING (true);
