/*~
-- ATTRIBUTE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------
--
-- The assembled view of an attribute combines the posit and annex table of the attribute.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
/*~
-- Attribute assembled view -------------------------------------------------------------------------------------------
-- $attribute.name assembled view of the posit and annex tables,
-- pk$attribute.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------

    CREATE OR REPLACE VIEW \"$attribute.name\"
    AS
    SELECT
        $(schema.METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        p.$attribute.anchorReferenceName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        p.$attribute.valueColumnName,
        $(attribute.timeRange)? p.$attribute.changingColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName --,
        --TODO: a.$attribute.reliableColumnName
    FROM
        \"$attribute.positName\" p
    JOIN
        \"$attribute.annexName\" a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName;
~*/
        if(schema.INTEGRITY) {
            var scheme = schema.PARTITIONING ? ' ON PositorScheme(' + attribute.positorColumnName + ')' : '';
/*~
    -- Constraint ensuring that recorded and erased posits are temporally consistent
    -- TODO: Explore further the efficacy of using a materialized view in place of
    -- the mssql concept of a view with a unique clustered index.
    --CREATE UNIQUE CLUSTERED INDEX [pk$attribute.name]
    --ON \"$attribute.name\" (
    --    $attribute.reliableColumnName desc,
    --    $attribute.anchorReferenceName asc,
    --    $(attribute.timeRange)? $attribute.changingColumnName desc,
    --    $attribute.positingColumnName desc,
    --    $attribute.positorColumnName asc
    --)$scheme;
~*/
        }
/*~

~*/
    }
}