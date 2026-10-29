ALTER TABLE workflows DROP CONSTRAINT workflows_trigger_kind_check;
ALTER TABLE workflows ADD CONSTRAINT workflows_trigger_kind_check CHECK(trigger_kind IN ('keyword','incoming','new_contact'));
