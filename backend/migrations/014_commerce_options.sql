ALTER TABLE products ADD COLUMN parent_product_id BIGINT;
ALTER TABLE products ADD COLUMN options JSONB NOT NULL DEFAULT '{}';
ALTER TABLE products ADD CONSTRAINT variant_parent_tenant FOREIGN KEY(parent_product_id,tenant_id) REFERENCES products(id,tenant_id);
ALTER TABLE products ADD CHECK(parent_product_id IS NULL OR parent_product_id<>id);
CREATE TABLE commerce_settings (
 tenant_id BIGINT PRIMARY KEY REFERENCES tenants(id),shipping_paise BIGINT NOT NULL DEFAULT 0 CHECK(shipping_paise BETWEEN 0 AND 10000000),
 tax_basis_points INT NOT NULL DEFAULT 0 CHECK(tax_basis_points BETWEEN 0 AND 10000)
);
ALTER TABLE commerce_orders ADD COLUMN subtotal_paise BIGINT;
ALTER TABLE commerce_orders ADD COLUMN shipping_paise BIGINT NOT NULL DEFAULT 0;
ALTER TABLE commerce_orders ADD COLUMN tax_paise BIGINT NOT NULL DEFAULT 0;
UPDATE commerce_orders SET subtotal_paise=total_paise;
ALTER TABLE commerce_orders ALTER COLUMN subtotal_paise SET NOT NULL;
ALTER TABLE shopping_sessions ADD COLUMN quote_total_paise BIGINT;
