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
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation$.\"_Schema\" (
	version bigserial primary key ,
	activation $schema.metadata.chronon$ not null default current_timestamp,
	schema json not null
);

-- Insert the XML schema (as of now)
INSERT INTO $schema.metadata.encapsulation$.\"_Schema\" (
   schema
)
SELECT
   $$jsonstr$$$schema.serialization._serialization$$jsonstr$$::json;

-- Schema expanded view -----------------------------------------------------------------------------------------------
-- A view of the schema table that expands the XML attributes into columns
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation$.\"_Schema_Expanded\"
AS
SELECT
	version,
	activation,
	schema,
	json_extract_path_text(schema, 'schema', 'format') as format,
	json_extract_path_text(schema, 'schema', 'date')::date as date,
	json_extract_path_text(schema, 'schema', 'time')::time as time,
	json_extract_path_text(schema, 'schema', 'metadata', 'temporalization') as temporalization,
	json_extract_path_text(schema, 'schema', 'metadata', 'databaseTarget') as database_target,
	json_extract_path_text(schema, 'schema', 'metadata', 'changingRange') as changing_range,
	json_extract_path_text(schema, 'schema', 'metadata', 'encapsulation') as encapsulation,
	json_extract_path_text(schema, 'schema', 'metadata', 'identity') as identity,
	json_extract_path_text(schema, 'schema', 'metadata', 'metadataPrefix') as metadata_prefix,
	json_extract_path_text(schema, 'schema', 'metadata', 'metadataType') as metadata_type,
	json_extract_path_text(schema, 'schema', 'metadata', 'metadataUsage')::boolean as metadata_usage,
	json_extract_path_text(schema, 'schema', 'metadata', 'changingSuffix') as changing_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'identitySuffix') as identity_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'positIdentity') as posit_identity,
	json_extract_path_text(schema, 'schema', 'metadata', 'positGenerator')::boolean as posit_generator,
	json_extract_path_text(schema, 'schema', 'metadata', 'positingRange') as positing_range,
	json_extract_path_text(schema, 'schema', 'metadata', 'positingSuffix') as positing_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'positorRange') as positor_range,
	json_extract_path_text(schema, 'schema', 'metadata', 'positorSuffix') as positor_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'reliabilityRange') as reliability_range,
	json_extract_path_text(schema, 'schema', 'metadata', 'reliabilitySuffix') as reliability_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'reliableCutoff') as reliable_cutoff,
	json_extract_path_text(schema, 'schema', 'metadata', 'deleteReliability') as delete_reliability,
	json_extract_path_text(schema, 'schema', 'metadata', 'reliableSuffix') as reliable_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'partitioning')::boolean as partitioning,
	json_extract_path_text(schema, 'schema', 'metadata', 'entityIntegrity')::boolean as entity_integrity,
	json_extract_path_text(schema, 'schema', 'metadata', 'restatability')::boolean as restatability,
	json_extract_path_text(schema, 'schema', 'metadata', 'idempotency')::boolean as idempotency,
	json_extract_path_text(schema, 'schema', 'metadata', 'assertiveness')::boolean as assertiveness,
	json_extract_path_text(schema, 'schema', 'metadata', 'naming') as naming,
	json_extract_path_text(schema, 'schema', 'metadata', 'positSuffix') as posit_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'annexSuffix') as annex_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'chronon') as chronon,
	json_extract_path_text(schema, 'schema', 'metadata', 'now') as now,
	json_extract_path_text(schema, 'schema', 'metadata', 'dummySuffix') as dummy_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'statementTypeSuffix') as statement_type_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'checksumSuffix') as checksum_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'businessViews')::boolean as business_views,
	json_extract_path_text(schema, 'schema', 'metadata', 'equivalence')::boolean as equivalence,
	json_extract_path_text(schema, 'schema', 'metadata', 'equivalentSuffix') as equivalent_suffix,
	json_extract_path_text(schema, 'schema', 'metadata', 'equivalentRange') as equivalent_range
FROM
	$schema.metadata.encapsulation$.\"_Schema\";

-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation$.\"_Anchor\"
AS 
SELECT
  s.version,
  s.activation,
  ((anchor ->> 'mnemonic') || '_' || (anchor ->> 'descriptor'))::varchar as name,
  (anchor #>> '{metadata, capsule}')::varchar as capsule,
  (anchor ->> 'mnemonic')::varchar as mnemonic,
  (anchor ->> 'descriptor')::varchar as descriptor,
  (anchor ->> 'identity')::varchar as identity,
  (anchor #>> '{metadata, generator}')::boolean as generator,
  (select count(*)::int from json_object_keys(anchor -> 'attribute')) as numberOfAttributes
FROM
  aergo.\"_Schema\" s
CROSS JOIN LATERAL
  (SELECT value as anchor FROM json_each(s.schema #> '{schema, anchor}')) a;

-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation$.\"_Knot\"
AS
SELECT
  s.version,
  s.activation,
  ((knot ->> 'mnemonic') || '_' || (knot ->> 'descriptor'))::varchar as name,
  (knot #>> '{metadata, capsule}')::varchar as capsule,
  (knot ->> 'mnemonic')::varchar as mnemonic,
  (knot ->> 'descriptor')::varchar as descriptor,
  (knot ->> 'identity')::varchar as identity,
  (knot #>> '{metadata, generator}')::boolean as generator,
  (knot ->> 'dataRange')::varchar as data_range,  
  coalesce((knot #>> '{metadata, checksum}')::boolean, false) as checksum,
  coalesce((knot #>> '{metadata, equivalent}')::boolean, false) as equivalent
FROM
  aergo.\"_Schema\" s
CROSS JOIN LATERAL
  (SELECT value as knot FROM json_each(s.schema #> '{schema, knot}')) k;

-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation$.\"_Attribute\"
AS 
SELECT 
   s.version,
   s.activation
FROM
	$schema.metadata.encapsulation$.\"_Schema\" s;

-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $schema.metadata.encapsulation$.\"_Tie\"
AS 
SELECT 
   s.version,
   s.activation
FROM
	$schema.metadata.encapsulation$.\"_Schema\" s;

-- Evolution function -------------------------------------------------------------------------------------------------
-- The evolution function shows what the schema looked like at the given
-- point in time with additional information about missing or added
-- modeling components since that time.
--
-- @timepoint   The point in time to which you would like to travel.
-----------------------------------------------------------------------------------------------------------------------

-- Drop Script Generator ----------------------------------------------------------------------------------------------
-- generates a drop script, that must be run separately, dropping everything in an Anchor Modeled database
-----------------------------------------------------------------------------------------------------------------------

-- Database Copy Script Generator -------------------------------------------------------------------------------------
-- generates a copy script, that must be run separately, copying all data between two identically modeled databases
-----------------------------------------------------------------------------------------------------------------------

~*/

}