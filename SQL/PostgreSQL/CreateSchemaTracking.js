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
DROP MATERIALIZED VIEW IF EXISTS $schema.metadata.encapsulation$.\"_Schema_Expanded\";

CREATE MATERIALIZED VIEW $schema.metadata.encapsulation$.\"_Schema_Expanded\"
AS
SELECT
	version,
	activation,
	schema,
	(schema #>> '{schema, format}') as format,
	(schema #>> '{schema, date}')::date as date,
	(schema #>> '{schema, time}')::time as time,
	(schema #>> '{schema, metadata, temporalization}') as temporalization,
	(schema #>> '{schema, metadata, databaseTarget}') as database_target,
	(schema #>> '{schema, metadata, changingRange}') as changing_range,
	(schema #>> '{schema, metadata, encapsulation}') as encapsulation,
	(schema #>> '{schema, metadata, identity}') as identity,
	(schema #>> '{schema, metadata, metadataPrefix}') as metadata_prefix,
	(schema #>> '{schema, metadata, metadataType}') as metadata_type,
	(schema #>> '{schema, metadata, metadataUsage}')::boolean as metadata_usage,
	(schema #>> '{schema, metadata, changingSuffix}') as changing_suffix,
	(schema #>> '{schema, metadata, identitySuffix}') as identity_suffix,
	(schema #>> '{schema, metadata, positIdentity}') as posit_identity,
	(schema #>> '{schema, metadata, positGenerator}')::boolean as posit_generator,
	(schema #>> '{schema, metadata, positingRange}') as positing_range,
	(schema #>> '{schema, metadata, positingSuffix}') as positing_suffix,
	(schema #>> '{schema, metadata, positorRange}') as positor_range,
	(schema #>> '{schema, metadata, positorSuffix}') as positor_suffix,
	(schema #>> '{schema, metadata, reliabilityRange}') as reliability_range,
	(schema #>> '{schema, metadata, reliabilitySuffix}') as reliability_suffix,
	(schema #>> '{schema, metadata, reliableCutoff}') as reliable_cutoff,
	(schema #>> '{schema, metadata, deleteReliability}') as delete_reliability,
	(schema #>> '{schema, metadata, reliableSuffix}') as reliable_suffix,
	(schema #>> '{schema, metadata, partitioning}')::boolean as partitioning,
	(schema #>> '{schema, metadata, entityIntegrity}')::boolean as entity_integrity,
	(schema #>> '{schema, metadata, restatability}')::boolean as restatability,
	(schema #>> '{schema, metadata, idempotency}')::boolean as idempotency,
	(schema #>> '{schema, metadata, assertiveness}')::boolean as assertiveness,
	(schema #>> '{schema, metadata, naming}') as naming,
	(schema #>> '{schema, metadata, positSuffix}') as posit_suffix,
	(schema #>> '{schema, metadata, annexSuffix}') as annex_suffix,
	(schema #>> '{schema, metadata, chronon}') as chronon,
	(schema #>> '{schema, metadata, now}') as now,
	(schema #>> '{schema, metadata, dummySuffix}') as dummy_suffix,
	(schema #>> '{schema, metadata, statementTypeSuffix}') as statement_type_suffix,
	(schema #>> '{schema, metadata, checksumSuffix}') as checksum_suffix,
	(schema #>> '{schema, metadata, businessViews}')::boolean as business_views,
	(schema #>> '{schema, metadata, equivalence}')::boolean as equivalence,
	(schema #>> '{schema, metadata, equivalentSuffix}') as equivalent_suffix,
	(schema #>> '{schema, metadata, equivalentRange}') as equivalent_range
FROM
	$schema.metadata.encapsulation$.\"_Schema\"
ORDER by version desc;

-- Anchor view --------------------------------------------------------------------------------------------------------
-- The anchor view shows information about all the anchors in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS $schema.metadata.encapsulation$.\"_Anchor\";

CREATE MATERIALIZED VIEW $schema.metadata.encapsulation$.\"_Anchor\"
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
  (select count(*)::int from json_object_keys(anchor -> 'attribute')) as number_of_attributes
FROM
  $schema.metadata.encapsulation$.\"_Schema\" s
CROSS JOIN LATERAL
  (SELECT value as anchor FROM json_each(s.schema #> '{schema, anchor}')) a
ORDER by version desc;

-- Knot view ----------------------------------------------------------------------------------------------------------
-- The knot view shows information about all the knots in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS $schema.metadata.encapsulation$.\"_Knot\";

CREATE MATERIALIZED VIEW $schema.metadata.encapsulation$.\"_Knot\"
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
  $schema.metadata.encapsulation$.\"_Schema\" s
CROSS JOIN LATERAL
  (SELECT value as knot FROM json_each(s.schema #> '{schema, knot}')) k
ORDER by version desc;

-- Attribute view -----------------------------------------------------------------------------------------------------
-- The attribute view shows information about all the attributes in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS $schema.metadata.encapsulation$.\"_Attribute\";

CREATE MATERIALIZED VIEW $schema.metadata.encapsulation$.\"_Attribute\"
AS 
SELECT
  s.version,
  s.activation,
  ((anchor ->> 'mnemonic') || '_' || (attr ->> 'mnemonic') || '_' || (anchor ->> 'descriptor') || '_' || (attr ->> 'descriptor'))::varchar as name,
  (attr #>> '{metadata, capsule}')::varchar as capsule,
  (attr ->> 'mnemonic')::varchar as mnemonic,
  (attr ->> 'descriptor')::varchar as descriptor,
  (attr ->> 'identity')::varchar as identity,
  coalesce((attr #>> '{metadata, equivalent}')::boolean, false) as equivalent,
  (attr #>> '{metadata, generator}')::boolean as generator,
  (attr #>> '{metadata, assertive}')::boolean as assertive,
  coalesce((attr #>> '{metadata, checksum}')::boolean, false) as checksum,
  (attr #>> '{metadata, restatable}')::boolean as restatable,
  (attr #>> '{metadata, idempotent}')::boolean as idempotent,
  (anchor ->> 'mnemonic')::varchar as anchor_mnemonic,
  (anchor ->> 'descriptor')::varchar as anchor_descriptor,
  (anchor ->> 'identity')::varchar as anchor_identity,
  (attr ->> 'dataRange')::varchar as data_range,
  (attr ->> 'knotRange')::varchar as knot_range,
  (attr ->> 'timeRange')::varchar as time_range
FROM
  $schema.metadata.encapsulation$.\"_Schema\" s
CROSS JOIN LATERAL
  (SELECT value as anchor FROM json_each(s.schema #> '{schema, anchor}')) a
CROSS JOIN LATERAL
  (SELECT value as attr FROM json_each(anchor -> 'attribute')) r
ORDER by version desc;

-- Tie view -----------------------------------------------------------------------------------------------------------
-- The tie view shows information about all the ties in a schema
-----------------------------------------------------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS $schema.metadata.encapsulation$.\"_Tie\";

CREATE MATERIALIZED VIEW $schema.metadata.encapsulation$.\"_Tie\"
AS 
WITH with_roles AS (
  SELECT
    s.*,
    tie,
    name,
    (select json_agg(row_to_json(roles) order by n) from (
      (select row_number() over () n, value \"role\" from json_each(tie -> 'anchorRole'))
      union all
      (select 900 + row_number() over () n, value \"role\" from json_each(tie -> 'knotRole'))
    ) roles ) as roles
  FROM
    $schema.metadata.encapsulation$.\"_Schema\" s
CROSS JOIN LATERAL
  (SELECT key as name, value as tie FROM json_each(s.schema #> '{schema, tie}')) t
)
SELECT
  version,
  activation,
  name::varchar,
  (tie #>> '{metadata, capsule}')::varchar as capsule,
  json_array_length(roles) as number_of_roles,
  (select array_agg(value#>>'{role, role}')::varchar[] from json_array_elements(roles)) roles,
  (select count(*)::int from json_object_keys(tie -> 'anchorRole')) as number_of_anchors,
  (select array_agg(value ->> 'type') from json_each(tie -> 'anchorRole'))::varchar[] as anchors,
  (select count(*)::int from json_object_keys(tie -> 'knotRole')) as number_of_knots,
  (select array_agg(value ->> 'type') from json_each(tie -> 'knotRole'))::varchar[] as knots,
  (select count(*) from json_array_elements(roles) where value#>>'{role, identifier}' = 'true') number_of_identifiers,
  (select array_agg(value#>>'{role, role}')::varchar[] from json_array_elements(roles) where value#>>'{role, identifier}' = 'true') identifiers,
  (tie ->> 'timeRange')::varchar as time_range,
  (tie #>> '{metadata, generator}')::boolean as generator,
  (tie #>> '{metadata, assertive}')::boolean as assertive,
  (tie #>> '{metadata, restatable}')::boolean as restatable,
  (tie #>> '{metadata, idempotent}')::boolean as idempotent
FROM with_roles
ORDER by version desc;

-- Evolution function -------------------------------------------------------------------------------------------------
-- The evolution function shows what the schema looked like at the given
-- point in time with additional information about missing or added
-- modeling components since that time.
--
-- @timepoint   The point in time to which you would like to travel.
-----------------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION $schema.metadata.encapsulation$.\"_Evolution\"(
  v_timepoint timestamp(6) with time zone DEFAULT now()
) RETURNS TABLE(
  version bigint,
  name varchar,
  activation timestamp(6) with time zone,
  existence varchar
)
AS
$$BODY$$
WITH all_names AS (
   SELECT name, version, activation FROM $schema.metadata.encapsulation$.\"_Anchor\" a
   UNION ALL
   SELECT name, version, activation FROM $schema.metadata.encapsulation$.\"_Knot\" k
   UNION ALL
   SELECT name, version, activation FROM $schema.metadata.encapsulation$.\"_Attribute\" b
   UNION ALL
   SELECT name, version, activation FROM $schema.metadata.encapsulation$.\"_Tie\" t
)
SELECT
   v.version,
   coalesce(s.name, t.name) AS name,
   v.activation AS activation,
   CASE
      WHEN s.name is null THEN
         CASE
            WHEN (
               SELECT 
                 coalesce(min(activation), null)
               FROM
                 all_names
               WHERE
                 all_names.name = t.name
            ) < (
               SELECT
                  coalesce(min(activation), null)
               FROM
                  $schema.metadata.encapsulation$.\"_Schema\"
               WHERE
                  activation >= v_timepoint
            ) THEN 'Past' --didn't exist at specified time but exists now (created before specified time)
            ELSE 'Future' --didn't exist at specified time but exists now (created after specified time)
         END
      WHEN t.name is null THEN 'Missing' --existed at specified time but doesn't exist now
      ELSE 'Present'  --existed at specified time and also exists now
   END AS Existence
FROM (
   SELECT
      max(version) as version,
      max(activation) as activation
   FROM
      $schema.metadata.encapsulation$.\"_Schema\"
   WHERE
      activation <= v_timepoint
) v
JOIN
  all_names s
ON
   s.version = v.version
FULL OUTER JOIN (
   SELECT
    distinct replace(replace(tablename, '_Posit', ''), '_Annex', '') as name
   FROM 
    pg_tables 
   WHERE 
    schemaname = 'aergo'
   AND
    left(tablename, 1) <> '_' 
) t
ON s.name = t.name
$$BODY$$
LANGUAGE SQL

-- Drop Script Generator ----------------------------------------------------------------------------------------------
-- generates a drop script, that must be run separately, dropping everything in an Anchor Modeled database
-----------------------------------------------------------------------------------------------------------------------

-- Database Copy Script Generator -------------------------------------------------------------------------------------
-- generates a copy script, that must be run separately, copying all data between two identically modeled databases
-----------------------------------------------------------------------------------------------------------------------

~*/

}