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
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule$.\"tf_l$anchor.name\"()
    RETURNS trigger AS 
    $$BODY$$
    DECLARE \"now\" $schema.metadata.chronon;
    \"id\" $anchor.identity;
    BEGIN
    now := $schema.metadata.now;
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
        inserted
    WHERE
        inserted.$anchor.identityColumnName is null
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
    );
    RETURN inserted;
    END;
    $$BODY$$
    LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS \"it_l$anchor.name\" ON $anchor.capsule$.\"l$anchor.name\";
CREATE TRIGGER \"it_l$anchor.name\" INSTEAD OF INSERT ON $anchor.capsule$.\"l$anchor.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $anchor.capsule$.\"tf_l$anchor.name\"();
~*/
            }
        }
