CREATE TABLE workflows (
 id BIGSERIAL PRIMARY KEY,tenant_id BIGINT NOT NULL REFERENCES tenants(id),name TEXT NOT NULL,
 trigger_kind TEXT NOT NULL CHECK(trigger_kind IN ('keyword','incoming')),keyword TEXT NOT NULL DEFAULT '',
 draft JSONB NOT NULL, published JSONB,version INT NOT NULL DEFAULT 0,enabled BOOLEAN NOT NULL DEFAULT false,
 created_by BIGINT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(created_by,tenant_id) REFERENCES users(id,tenant_id),UNIQUE(id,tenant_id)
);
CREATE TABLE workflow_versions(
 workflow_id BIGINT NOT NULL,tenant_id BIGINT NOT NULL,version INT NOT NULL,definition JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(workflow_id,version),
 FOREIGN KEY(workflow_id,tenant_id) REFERENCES workflows(id,tenant_id)
);
CREATE TRIGGER workflow_version_immutable BEFORE UPDATE OR DELETE ON workflow_versions FOR EACH ROW EXECUTE FUNCTION reject_record_mutation();
CREATE TABLE workflow_runs(
 id BIGSERIAL PRIMARY KEY,tenant_id BIGINT NOT NULL,workflow_id BIGINT NOT NULL,version INT NOT NULL,
 conversation_id BIGINT NOT NULL,incoming_id BIGINT NOT NULL REFERENCES chat_messages(id),definition JSONB NOT NULL,
 step INT NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','completed','failed','skipped')),
 available_at TIMESTAMPTZ NOT NULL DEFAULT now(),lease_until TIMESTAMPTZ,error TEXT,attempts INT NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(workflow_id,incoming_id),
 FOREIGN KEY(workflow_id,tenant_id) REFERENCES workflows(id,tenant_id),
 FOREIGN KEY(conversation_id,tenant_id) REFERENCES conversations(id,tenant_id)
);
CREATE TABLE workflow_steps(
 run_id BIGINT NOT NULL REFERENCES workflow_runs(id),step INT NOT NULL,kind TEXT NOT NULL,result TEXT NOT NULL,outbound_id BIGINT REFERENCES chat_messages(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(run_id,step)
);
CREATE INDEX workflow_ready ON workflow_runs(status,available_at,id);
