/*~
-- DATABASE INITIALIZATION -----------------------------------------------------
--
-- The following code performs the initial setup of the PostgreSQL database with
-- required objects for the anchor database.
--
--------------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS $schema.metadata.encapsulation;

-- Note that prior to PostgreSQL 9.3 the IF NOT EXISTS syntax was not available such that
-- something like this was needed:
-- DO $$$$
-- BEGIN

--     IF NOT EXISTS(
--         SELECT schema_name
--           FROM information_schema.schemata
--           WHERE schema_name = '$schema.metadata.encapsulation'
--       )
--     THEN
--       CREATE SCHEMA $schema.metadata.encapsulation;
--     END IF;

-- END
-- $$$$;

~*/