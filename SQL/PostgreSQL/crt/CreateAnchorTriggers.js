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
    RETURNS void AS 
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
    --  SELECT INTO id FROM (SELECT CURRVAL(\'$anchor.identityColumnName\'));
    INSERT INTO \"$anchor.mnemonic\" (
        $anchor.identityColumnName
    )
    VALUES (id);
        
    END;
    $$BODY$$
    LANGUAGE plpgsql;

CREATE TRIGGER \"it_l$anchor.name\" INSTEAD OF INSERT ON $anchor.capsule$.\"l$anchor.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $anchor.capsule$.\"tf_l$anchor.name\"();
~*/
            }
        }
