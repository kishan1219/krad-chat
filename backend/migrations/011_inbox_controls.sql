ALTER TABLE conversations ADD COLUMN custom_fields JSONB NOT NULL DEFAULT '{}';
CREATE TABLE conversation_reads (
 tenant_id BIGINT NOT NULL,user_id BIGINT NOT NULL,conversation_id BIGINT NOT NULL,
 last_message_id BIGINT NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,conversation_id),
 FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id),
 FOREIGN KEY(conversation_id,tenant_id) REFERENCES conversations(id,tenant_id)
);
CREATE INDEX chat_incoming_cursor ON chat_messages(tenant_id,conversation_id,id) WHERE direction='in';
