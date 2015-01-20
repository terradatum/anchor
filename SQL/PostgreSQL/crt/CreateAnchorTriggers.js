/*~
-- ANCHOR TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest view make it behave like a table.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, knot, attribute;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- INSERT function -----------------------------------------------------------------------------------------------------
-- if_l$anchor.name instead of INSERT trigger function on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule$.\"if_l$anchor.name\"()
    RETURNS trigger AS 
    $$BODY$$
    DECLARE \"now\" $schema.metadata.chronon;
    \"id\" $anchor.identity;
    BEGIN
    now := $schema.metadata.now;
    CREATE TEMP TABLE N ON COMMIT DROP
    AS SELECT NEW.$anchor.metadataColumnName AS $anchor.metadataColumnName,
              NEW.$anchor.identityColumnName AS $anchor.identityColumnName;
    CREATE TEMP TABLE $anchor.mnemonic (
        Row serial not null CONSTRAINT pk_row primary key,
        $anchor.identityColumnName $anchor.identity not null
    ) ON COMMIT DROP;
    INSERT INTO $anchor.capsule$.\"$anchor.name\" (
        $(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    )
    SELECT
        $(schema.METADATA)? $anchor.metadataColumnName : null
    FROM
        N
    WHERE
        N.$anchor.identityColumnName is null
    RETURNING $anchor.identityColumnName
    INTO id;
    INSERT INTO \"$anchor.mnemonic\" (
        $anchor.identityColumnName
    )
    VALUES (
        id
    );

    CREATE TEMP TABLE inserted (
        $anchor.identityColumnName $anchor.identity not null,
        $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange null,
        $attribute.positorColumnName $schema.metadata.positorRange null,
        $attribute.positingColumnName $schema.metadata.positingRange null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
        $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
        $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
        $attribute.valueColumnName $attribute.dataRange null$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
    ) ON COMMIT DROP;
    INSERT INTO inserted
    SELECT
        COALESCE(i.$anchor.identityColumnName, a.$anchor.identityColumnName),
        $(schema.METADATA)? i.$anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(schema.IMPROVED)? COALESCE(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName, a.$anchor.identityColumnName),
        $(schema.METADATA)? COALESCE(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
        $(attribute.isHistorized())? COALESCE(i.$attribute.changingColumnName, now),
        COALESCE(i.$attribute.positorColumnName, i.$schema.metadata.positorSuffix, 0),
        COALESCE(i.$attribute.positingColumnName, now),
        COALESCE(i.$attribute.reliabilityColumnName,
        CASE
            WHEN i.$schema.metadata.reliableSuffix = 0 THEN $schema.metadata.deleteReliability
            WHEN i.$attribute.reliableColumnName = 0 THEN $schema.metadata.deleteReliability
            ELSE $schema.metadata.reliableCutoff
        END),
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        i.$attribute.knotValueColumnName,
        $(knot.hasChecksum())? COALESCE(i.$attribute.knotChecksumColumnName, ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.knotValueColumnName as varbinary(max)))),
        $(schema.METADATA)? COALESCE(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
~*/
            }
/*~
        i.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
    FROM (
        SELECT
            $schema.metadata.positorSuffix,
            $schema.metadata.reliableSuffix,
            $anchor.identityColumnName,
            $(schema.METADATA)? $anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.anchorReferenceName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.positorColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName,
            $attribute.reliableColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            $attribute.knotValueColumnName,
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName,
            $(schema.METADATA)? $attribute.knotMetadataColumnName,
~*/
            }
/*~
            $attribute.valueColumnName,
~*/
        }
/*~
            ROW_NUMBER() OVER () AS Row
        FROM
            inserted
    ) i
    LEFT JOIN
        $anchor.mnemonic a
    ON
        a.Row = i.Row;
~*/
        while (attribute = anchor.nextAttribute()) {
            knot = attribute.knot;
/*~
    INSERT INTO $attribute.capsule$.\"$attribute.name\" (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $attribute.valueColumnName,
        $(attribute.timeRange)? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        i.$attribute.anchorReferenceName,
        $(attribute.isKnotted())? COALESCE(i.$attribute.valueColumnName, k$knot.mnemonic$.$knot.identityColumnName), : i.$attribute.valueColumnName,
        $(attribute.timeRange)? i.$attribute.changingColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.positorColumnName,
        i.$attribute.reliabilityColumnName
    FROM
        inserted i
~*/
            if(attribute.isKnotted()) {
/*~
    LEFT JOIN
        $knot.capsule$.\"$knot.name\" k$knot.mnemonic
    ON
        $(knot.hasChecksum())? k$knot.mnemonic$.$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : k$knot.mnemonic$.$knot.valueColumnName = i.$attribute.knotValueColumnName
    WHERE
        COALESCE(i.$attribute.valueColumnName, k$knot.mnemonic$.$knot.identityColumnName) IS NOT NULL;
~*/
            }
            else {
/*~
    WHERE
        i.$attribute.valueColumnName IS NOT NULL;
~*/
            }
        }
/*~

    RETURN null;
    END;
    $$BODY$$
    LANGUAGE plpgsql;

-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"it_l$anchor.name\" ON $anchor.capsule$.\"l$anchor.name\";
CREATE TRIGGER \"it_l$anchor.name\" INSTEAD OF INSERT ON $anchor.capsule$.\"l$anchor.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $anchor.capsule$.\"if_l$anchor.name\"();
~*/
    } // end of if attributes exist
    if(anchor.hasMoreAttributes()) {
/*~
-- UPDATE function -----------------------------------------------------------------------------------------------------
-- uf_l$anchor.name instead of UPDATE trigger function on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule$.\"uf_l$anchor.name\"()
    RETURNS trigger AS 
    $$BODY$$
    DECLARE \"now\" $schema.metadata.chronon;
    BEGIN
    now := $schema.metadata.now;
   IF(OLD.$anchor.identityColumnName != NEW.$anchor.identityColumnName)
        THEN RAISE EXCEPTION 'The identity column $anchor.identityColumnName is not updatable.';
    END IF;
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    IF(OLD.$attribute.identityColumnName != NEW.$attribute.identityColumnName)
        THEN RAISE EXCEPTION 'The identity column $attribute.identityColumnName is not updatable.';
    END IF;
    IF(OLD.$attribute.anchorReferenceName != NEW.$attribute.anchorReferenceName)
        THEN RAISE EXCEPTION 'The foreign key column $attribute.anchorReferenceName is not updatable.';
    END IF;
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    IF(OLD.$attribute.valueColumnName != NEW.$attribute.valueColumnName OR OLD.$attribute.knotValueColumnName != NEW.$attribute.knotValueColumnName)
    THEN BEGIN
        INSERT INTO $attribute.capsule$.\"$attribute.name\" (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.anchorReferenceName,
            $attribute.valueColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.positingColumnName,
            $attribute.positorColumnName,
            $attribute.reliabilityColumnName
        )
        SELECT
            $(schema.METADATA)? COALESCE(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
            COALESCE(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            CASE WHEN (OLD.$attribute.valueColumnName != NEW.$attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE k$knot.mnemonic$.$knot.identityColumnName END,
~*/
                if(attribute.isHistorized()) {
/*~
            cast(CASE
                WHEN i.$attribute.valueColumnName is null AND k$knot.mnemonic$.$knot.identityColumnName is null THEN i.$attribute.changingColumnName
                WHEN (OLD.$attribute.changingColumnName != NEW.$attribute.changingColumnName) THEN i.$attribute.changingColumnName
                ELSE now
            END as $attribute.timeRange),
~*/
                }
/*~
            cast(CASE WHEN (OLD.$attribute.positingColumnName != NEW.$attribute.positingColumnName) THEN i.$attribute.positingColumnName ELSE now END as $schema.metadata.positingRange),
            CASE WHEN (OLD.$schema.metadata.positorSuffix != NEW.$schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE COALESCE(i.$attribute.positorColumnName, 0) END,
            CASE
                WHEN i.$attribute.valueColumnName is null AND k$knot.mnemonic$.$knot.identityColumnName is null THEN $schema.metadata.deleteReliability
                WHEN (OLD.$schema.metadata.reliableSuffix != NEW.$schema.metadata.reliableSuffix) THEN
                    CASE i.$schema.metadata.reliableSuffix
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                WHEN (OLD.$attribute.reliableColumnName != NEW.$attribute.reliableColumnName) THEN
                    CASE i.$attribute.reliableColumnName
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                ELSE COALESCE(i.$attribute.reliabilityColumnName, $schema.metadata.reliableCutoff)
            END
        FROM
            inserted i
        LEFT JOIN
            $knot.capsule$.\"$knot.name\" \"k$knot.mnemonic\"
        ON
            $(knot.hasChecksum())? k$knot.mnemonic$.$knot.checksumColumnName = ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.knotValueColumnName as varbinary(max))) : k$knot.mnemonic$.$knot.valueColumnName = i.$attribute.knotValueColumnName;
    END;
    END IF;
~*/
            }
            else { // not knotted
/*~
    IF(OLD.$attribute.valueColumnName != NEW.$attribute.valueColumnName)
    THEN BEGIN
        INSERT INTO $attribute.capsule$.\"$attribute.name\" (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.anchorReferenceName,
            $attribute.valueColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.positingColumnName,
            $attribute.positorColumnName,
            $attribute.reliabilityColumnName
        )
        SELECT
            $(schema.METADATA)? COALESCE(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
            COALESCE(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            i.$attribute.valueColumnName,
~*/
                if(attribute.isHistorized()) {
/*~
            cast(CASE
                WHEN i.$attribute.valueColumnName is null THEN i.$attribute.changingColumnName
                WHEN (OLD.$attribute.changingColumnName != NEW.$attribute.changingColumnName) THEN i.$attribute.changingColumnName
                ELSE now
            END as $attribute.timeRange),
~*/
                }
/*~
            cast(CASE WHEN (OLD.$attribute.positingColumnName != NEW.$attribute.positingColumnName) THEN i.$attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange),
            CASE WHEN (OLD.$schema.metadata.positorSuffix != NEW.$schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE COALESCE(i.$attribute.positorColumnName, 0) END,
            CASE
                WHEN i.$attribute.valueColumnName is null THEN $schema.metadata.deleteReliability
                WHEN (OLD.$schema.metadata.reliableSuffix != NEW.$schema.metadata.reliableSuffix) THEN
                    CASE i.$schema.metadata.reliableSuffix
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                WHEN (OLD.$attribute.reliableColumnName != NEW.$attribute.reliableColumnName) THEN
                    CASE i.$attribute.reliableColumnName
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                ELSE COALESCE(i.$attribute.reliabilityColumnName, $schema.metadata.reliableCutoff)
            END
        FROM
            inserted i;
    END;
    END IF;
~*/
            } // end of not knotted
        } // end of while loop over attributes
/*~
    RETURN null;
    END;
    $$BODY$$
    LANGUAGE plpgsql;

-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$anchor.name instead of UPDATE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"ut_l$anchor.name\" ON $anchor.capsule$.\"l$anchor.name\";
CREATE TRIGGER \"ut_l$anchor.name\" INSTEAD OF UPDATE ON $anchor.capsule$.\"l$anchor.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $anchor.capsule$.\"uf_l$anchor.name\"();
~*/
    } // end of if attributes exist
    if(anchor.hasMoreAttributes()) {
/*~
-- DELETE function -----------------------------------------------------------------------------------------------------
-- df_l$anchor.name instead of DELETE trigger function on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule$.\"df_l$anchor.name\"()
    RETURNS trigger AS 
    $$BODY$$
    DECLARE \"now\" $schema.metadata.chronon;
    BEGIN
    now := $schema.metadata.now;
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    INSERT INTO $attribute.capsule$.\"$attribute.annexName\" (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? p.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        p.$attribute.positorColumnName,
        now,
        $schema.metadata.deleteReliability
    FROM
        deleted d
    JOIN
        $attribute.capsule$.\"$attribute.annexName\" p
    ON
        p.$attribute.identityColumnName = d.$attribute.identityColumnName;
~*/
        }
/*~
    RETURN null;
    END;
    $$BODY$$
    LANGUAGE plpgsql;

-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"dt_l$anchor.name\" ON $anchor.capsule$.\"l$anchor.name\";
CREATE TRIGGER \"dt_l$anchor.name\" INSTEAD OF DELETE ON $anchor.capsule$.\"l$anchor.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $anchor.capsule$.\"df_l$anchor.name\"();
~*/
    } // end of if attributes exist
}
