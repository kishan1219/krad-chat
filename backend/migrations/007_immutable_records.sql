CREATE FUNCTION reject_record_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'This record is append-only; write a compensating record instead.' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_record_mutation();
CREATE TRIGGER ledger_append_only BEFORE UPDATE OR DELETE ON ledger FOR EACH ROW EXECUTE FUNCTION reject_record_mutation();
CREATE TRIGGER automation_version_immutable BEFORE UPDATE OR DELETE ON automation_versions FOR EACH ROW EXECUTE FUNCTION reject_record_mutation();
