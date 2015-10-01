/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--

-- sequence for the positor ------------------------------------------------------------------------------------
DO
$$BODY$$
BEGIN
    CREATE SEQUENCE $schema.metadata.encapsulation$.\"_$schema.metadata.positorSuffix$_seq\";
EXCEPTION WHEN duplicate_table THEN
        -- do nothing, it's already there
END
$$BODY$$ LANGUAGE plpgsql;


-- Positor table ------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\"" (
    $schema.metadata.positorSuffix $schema.metadata.positorRange not null,
    constraint pk_$schema.metadata.positorSuffix primary key (
        $schema.metadata.positorSuffix
    )
);

DO $$BODY$$
BEGIN
    IF NOT EXISTS(
        SELECT $schema.metadata.positorSuffix
        FROM $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\""
        WHERE $schema.metadata.positorSuffix = 0
    )
    THEN
        INSERT INTO $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\"" (
            $schema.metadata.positorSuffix
        )
        VALUES (
            0 -- the default positor
        );
    END IF;
END
$$BODY$$ LANGUAGE plpgsql;


~*/