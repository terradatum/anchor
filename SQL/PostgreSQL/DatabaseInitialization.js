/*~
-- DATABASE INITIALIZATION -----------------------------------------------------
--
-- The following code performs the initial setup of the PostgreSQL database with
-- required objects for the anchor database.
--
--------------------------------------------------------------------------------

-- Note that in PostgreSQL 9.3 the IF NOT EXISTS syntax is available so that
-- at which time this can be simplified to simple read
-- CREATE SCHEMA IF NOT EXISTS $schema.metadata.encapsulation;
DO $$$$
BEGIN

    IF NOT EXISTS(
        SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name = '$schema.metadata.encapsulation'
      )
    THEN
      CREATE SCHEMA $schema.metadata.encapsulation;
    END IF;

END
$$$$;

~*/