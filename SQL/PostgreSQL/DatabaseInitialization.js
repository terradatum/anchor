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
-- DO $$BODY$$
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
-- $$BODY$$;

-- Insert trigger Instead of Row --------------------------------------------------------------------------------------
-- tri_instead instead of INSERT trigger on first argument
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $schema.metadata.encapsulation$.tri_instead()
    RETURNS trigger AS
    $$BODY$$
    DECLARE
        prefix varchar;
        rec record;
        seq int;
    BEGIN
    FOR i IN 3..TG_NARGS-1 LOOP
        prefix := TG_ARGV[i];
        IF (prefix = 'new') THEN
            IF (TG_NARGS = 4) THEN
                EXECUTE format('SELECT nextval(''%s'');', TG_ARGV[2]) INTO seq;
                EXECUTE format('SET NEW.%s = %I;', TG_ARGV[1], seq);
            END IF;
            rec := NEW;
        END IF;
        IF (prefix = 'old') THEN
            rec := OLD;
        END IF;
        EXECUTE format('INSERT INTO %s_%s SELECT ($$1).*;', prefix, TG_ARGV[0]) USING rec;
    END LOOP;
    RETURN rec;
    END;
    $$BODY$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION $schema.metadata.encapsulation$.has_update (
  new_old_suffix varchar,
  column_name varchar
) RETURNS BOOLEAN AS
$$BODY$$
DECLARE
  ret_val BOOLEAN;
BEGIN

EXECUTE
format('
SELECT exists(select * from
 (select row_number() over () r, %1$$s as col from new_%2$$s) n,
 (select row_number() over () r, %1$$s as col from old_%2$$s) o
where n.r = o.r
and n.col != o.col
)', column_name, new_old_suffix)

INTO ret_val;

RETURN ret_val;
END;
$$BODY$$
LANGUAGE plpgsql;


~*/
