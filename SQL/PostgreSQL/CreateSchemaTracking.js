if(schema.serialization) {
/*~
-- SCHEMA EVOLUTION ---------------------------------------------------------------------------------------------------
--
-- The following tables, views, and functions are used to track schema changes
-- over time, as well as providing every XML that has been 'executed' against
-- the database.
--
-- Schema table -------------------------------------------------------------------------------------------------------
-- The schema table holds every xml that has been executed against the database
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation$.schema_evolution (
	schema_version bigserial primary key ,
	schema_activation $schema.metadata.chronon$ not null default current_timestamp,
	schema_json json not null
);

-- Insert the XML schema (as of now)
INSERT INTO $schema.metadata.encapsulation$.schema_evolution (
   schema_json
)
SELECT
   $$jsonstr$$$schema.serialization._serialization$$jsonstr$$::json;

-- Schema expanded view -----------------------------------------------------------------------------------------------
-- A view of the schema table that expands the XML attributes into columns
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation$.schema_expanded
AS
SELECT
	schema_version,
	schema_activation,
	schema_json,
	json_extract_path_text(schema_json, 'schema', 'format') as schema_format,
	json_extract_path_text(schema_json, 'schema', 'date')::date as schema_date,
	json_extract_path_text(schema_json, 'schema', 'time')::time as schema_time,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'temporalization') as temporalization,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'databaseTarget') as database_target,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'changingRange') as changing_range,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'encapsulation') as encapsulation,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'identity') as identity,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'metadataPrefix') as metadata_prefix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'metadataType') as metadata_type,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'metadataUsage')::boolean as metadata_usage,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'changingSuffix') as changing_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'identitySuffix') as identity_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positIdentity') as posit_identity,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positGenerator')::boolean as posit_generator,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positingRange') as positing_range,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positingSuffix') as positing_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positorRange') as positor_range,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positorSuffix') as positor_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'reliabilityRange') as reliability_range,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'reliabilitySuffix') as reliability_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'reliableCutoff') as reliable_cutoff,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'deleteReliability') as delete_reliability,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'reliableSuffix') as reliable_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'partitioning')::boolean as partitioning,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'entityIntegrity')::boolean as entity_integrity,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'restatability')::boolean as restatability,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'idempotency')::boolean as idempotency,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'assertiveness')::boolean as assertiveness,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'naming') as naming,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'positSuffix') as posit_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'annexSuffix') as annex_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'chronon') as chronon,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'now') as now,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'dummySuffix') as dummy_suffix,
  json_extract_path_text(schema_json, 'schema', 'metadata', 'statementTypeSuffix') as statement_type_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'checksumSuffix') as checksum_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'businessViews')::boolean as business_views,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'equivalence')::boolean as equivalence,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'equivalentSuffix') as equivalent_suffix,
	json_extract_path_text(schema_json, 'schema', 'metadata', 'equivalentRange') as equivalent_range
FROM
	$schema.metadata.encapsulation$.schema_evolution;
~*/
}