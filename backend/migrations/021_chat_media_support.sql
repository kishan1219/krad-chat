-- 021: Chat Media Support (Inbound/Outbound Media Attachments)

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'audio', 'video', 'document')),
  ADD COLUMN IF NOT EXISTS file_id UUID REFERENCES files(id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_file_id ON chat_messages(file_id);
