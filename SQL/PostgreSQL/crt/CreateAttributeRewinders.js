/*~
-- ATTRIBUTE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------
--
-- These table valued functions rewind an attribute posit table to the given
-- point in changing time, or an attribute annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time. The forwarder is the opposite of the rewinder, such that the 
-- union of the two will produce all rows in a posit table.
--
-- positor             the view of which positor to adopt (defaults to 0)
-- changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        schema.setIdentityGenerator(attribute);
        if(attribute.isHistorized()) {
/*~
-- Attribute posit rewinder -------------------------------------------------------------------------------------------
-- r$attribute.positName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"r$attribute.positName\" (
        changingTimepoint $attribute.timeRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $attribute.identityColumnName $attribute.identity,
        $attribute.anchorReferenceName $anchor.identity,
        $(attribute.hasChecksum())? $attribute.checksumColumnName $schema.checksumType,
        $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
        $attribute.changingColumnName $attribute.timeRange
    ) AS
$$BODY$$
    SELECT
        $attribute.identityColumnName,
        $attribute.anchorReferenceName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        \"$attribute.capsule$\".\"$attribute.positName\"
    WHERE
        $attribute.changingColumnName <= changingTimepoint;
$$BODY$$
LANGUAGE SQL;

-- Attribute posit forwarder ------------------------------------------------------------------------------------------
-- f$attribute.positName forwarding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"f$attribute.positName\" (
        changingTimepoint $attribute.timeRange = $schema.EOT
    )
    RETURNS TABLE (
        $attribute.identityColumnName $attribute.identity,
        $attribute.anchorReferenceName $anchor.identity,
        $(attribute.hasChecksum())? $attribute.checksumColumnName $schema.checksumType,
        $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
        $attribute.changingColumnName $attribute.timeRange
    ) AS
$$BODY$$
    SELECT
        $attribute.identityColumnName,
        $attribute.anchorReferenceName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        \"$attribute.capsule$\".\"$attribute.positName\"
    WHERE
        $attribute.changingColumnName > changingTimepoint;
$$BODY$$
LANGUAGE SQL;
    

-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- r$attribute.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"r$attribute.annexName\" (
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
        $attribute.identityColumnName $attribute.identity,
        $attribute.positingColumnName $schema.metadata.positingRange,
        $attribute.positorColumnName $schema.metadata.positorRange,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
        $attribute.reliableColumnName $schema.reliableColumnType
    ) AS 
$$BODY$$
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName,
        $attribute.reliableColumnName
    FROM
        \"$attribute.capsule$\".\"$attribute.annexName\"
    WHERE
        $attribute.positingColumnName <= positingTimepoint;
$$BODY$$
LANGUAGE SQL;

-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"r$attribute.name\" (
        positor $schema.metadata.positorRange DEFAULT 0,
        changingTimepoint $attribute.timeRange DEFAULT $schema.EOT,
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
        $attribute.identityColumnName $attribute.identity,
        $attribute.positingColumnName $schema.metadata.positingRange,
        $attribute.positorColumnName $schema.metadata.positorRange,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
        $attribute.reliableColumnName $schema.reliableColumnType,
        $attribute.anchorReferenceName $anchor.identity,
        $(attribute.hasChecksum())? $attribute.checksumColumnName $schema.checksumType,
        $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
        $attribute.changingColumnName $attribute.timeRange
    ) AS
$$BODY$$
    SELECT
        $(schema.METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName,
        a.$attribute.reliableColumnName,
        p.$attribute.anchorReferenceName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        p.$attribute.valueColumnName,
        p.$attribute.changingColumnName
    FROM
        \"$attribute.capsule$\".\"r$attribute.positName\"(changingTimepoint) p
    JOIN
        \"$attribute.capsule$\".\"r$attribute.annexName\"(positingTimepoint) a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positorColumnName = positor
    AND
        a.$attribute.positingColumnName = (
            SELECT sub.$attribute.positingColumnName
            FROM
                \"$attribute.capsule$\".\"r$attribute.annexName\"(positingTimepoint) sub
            WHERE
                sub.$attribute.identityColumnName = p.$attribute.identityColumnName
            AND
                sub.$attribute.positorColumnName = positor
            ORDER BY
                sub.$attribute.positingColumnName DESC
            LIMIT 1
        );
$$BODY$$
LANGUAGE SQL;

-- Attribute assembled forwarder --------------------------------------------------------------------------------------
-- f$attribute.name forwarding over changing and rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"f$attribute.name\" (
        positor $schema.metadata.positorRange DEFAULT 0,
        changingTimepoint $attribute.timeRange DEFAULT $schema.EOT,
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
        $attribute.identityColumnName $attribute.identity,
        $attribute.positingColumnName $schema.metadata.positingRange,
        $attribute.positorColumnName $schema.metadata.positorRange,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
        $attribute.reliableColumnName $schema.reliableColumnType,
        $attribute.anchorReferenceName $anchor.identity,
        $(attribute.hasChecksum())? $attribute.checksumColumnName $schema.checksumType,
        $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity, : $attribute.dataRange,
        $attribute.changingColumnName $attribute.timeRange
    ) AS
$$BODY$$
    SELECT
        $(schema.METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName,
        a.$attribute.reliableColumnName,
        p.$attribute.anchorReferenceName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        p.$attribute.valueColumnName,
        p.$attribute.changingColumnName
    FROM
        \"$attribute.capsule$\".\"f$attribute.positName\"(changingTimepoint) p
    JOIN
        \"$attribute.capsule$\".\"r$attribute.annexName\"(positingTimepoint) a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positorColumnName = positor
    AND
        a.$attribute.positingColumnName = (
            SELECT sub.$attribute.positingColumnName
            FROM
                \"$attribute.capsule$\".\"r$attribute.annexName\"(positingTimepoint) sub
            WHERE
                sub.$attribute.identityColumnName = p.$attribute.identityColumnName
            AND
                sub.$attribute.positorColumnName = positor
            ORDER BY
                sub.$attribute.positingColumnName DESC
            LIMIT 1
        );
$$BODY$$
LANGUAGE SQL;

-- Attribute previous value -------------------------------------------------------------------------------------------
-- pre$attribute.name function for getting previous value
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"pre$attribute.name\" (
        id $anchor.identity,
        positor $schema.metadata.positorRange DEFAULT 0,
        changingTimepoint $attribute.timeRange DEFAULT $schema.EOT,
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
    AS
$$BODY$$
    SELECT $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
    FROM
        \"$attribute.capsule$\".\"r$attribute.name\"(
            positor,
            changingTimepoint,
            positingTimepoint
        ) pre
    WHERE
        pre.$attribute.anchorReferenceName = id
    AND
        pre.$attribute.changingColumnName < changingTimepoint
    AND
        pre.$attribute.reliableColumnName = 1
    ORDER BY
        pre.$attribute.changingColumnName DESC,
        pre.$attribute.positingColumnName DESC
    LIMIT 1;
$$BODY$$
LANGUAGE SQL;

-- Attribute following value ------------------------------------------------------------------------------------------
-- fol$attribute.name function for getting following value
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"fol$attribute.name\" (
        id $anchor.identity,
        positor $schema.metadata.positorRange DEFAULT 0,
        changingTimepoint $attribute.timeRange DEFAULT $schema.EOT,
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
    AS
$$BODY$$
    SELECT $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
    FROM
        \"$attribute.capsule$\".\"f$attribute.name\"(
            positor,
            changingTimepoint,
            positingTimepoint
        ) fol
    WHERE
        fol.$attribute.anchorReferenceName = id
    AND
        fol.$attribute.changingColumnName > changingTimepoint
    AND
        fol.$attribute.reliableColumnName = 1
    ORDER BY
        fol.$attribute.changingColumnName ASC,
        fol.$attribute.positingColumnName DESC
    LIMIT 1;
$$BODY$$
LANGUAGE SQL;
~*/
        }
        else {
/*~
-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- r$attribute.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"r$attribute.annexName\" (
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
        $attribute.identityColumnName $attribute.identity,
        $attribute.positingColumnName $schema.metadata.positingRange,
        $attribute.positorColumnName $schema.metadata.positorRange,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
        $attribute.reliableColumnName $schema.reliableColumnType
    ) AS
$$BODY$$
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName,
        $attribute.reliableColumnName
    FROM
        \"$attribute.capsule$\".\"$attribute.annexName\"
    WHERE
        $attribute.positingColumnName <= positingTimepoint;
$$BODY$$
LANGUAGE SQL;

-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"$attribute.capsule$\".\"r$attribute.name\" (
        positor $schema.metadata.positorRange DEFAULT 0,
        positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
        $attribute.identityColumnName $attribute.identity,
        $attribute.positingColumnName $schema.metadata.positingRange,
        $attribute.positorColumnName $schema.metadata.positorRange,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
        $attribute.reliableColumnName $schema.reliableColumnType,
        $attribute.anchorReferenceName $anchor.identity,
        $(attribute.hasChecksum())? $attribute.checksumColumnName $schema.checksumType,
        $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
    ) AS
$$BODY$$
    SELECT
        $(schema.METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName,
        a.$attribute.reliableColumnName,
        p.$attribute.anchorReferenceName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        p.$attribute.valueColumnName
    FROM
        \"$attribute.capsule$\".\"$attribute.positName\" p
    JOIN
        \"$attribute.capsule$\".\"r$attribute.annexName\"(positingTimepoint) a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positorColumnName = positor
    AND
        a.$attribute.positingColumnName = (
            SELECT sub.$attribute.positingColumnName
            FROM
                \"$attribute.capsule$\".\"r$attribute.annexName\"(positingTimepoint) sub
            WHERE
                sub.$attribute.identityColumnName = p.$attribute.identityColumnName
            AND
                sub.$attribute.positorColumnName = positor
            ORDER BY
                sub.$attribute.positingColumnName DESC
            LIMIT 1
        );
$$BODY$$
LANGUAGE SQL;
~*/
        }

    }
}
