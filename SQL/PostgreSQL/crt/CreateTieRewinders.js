/*~
-- TIE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------------
--
-- These table valued functions rewind a tie posit table to the given
-- point in changing time, or a tie annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time. The forwarder is the opposite of the rewinder, such that 
-- their union corresponds to all rows in the posit table.
--
-- positor             the view of which positor to adopt (defaults to 0)
-- changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
    if(tie.isHistorized()) {
/*~
-- Tie posit rewinder -------------------------------------------------------------------------------------------------
-- r$tie.positName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.r$tie.positName (
        \"changingTimepoint\" $tie.timeRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $tie.identityColumnName $tie.identity,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
        }
/*~
        $tie.changingColumnName $tie.timeRange
    ) AS
$$BODY$$
BEGIN
    SELECT
        $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $tie.changingColumnName
    FROM
        $tie.capsule$.$tie.positName
    WHERE
        $tie.changingColumnName <= changingTimepoint;
END;
$$BODY$$
LANGUAGE plpgsql;

-- Tie posit forwarder ------------------------------------------------------------------------------------------------
-- f$tie.positName forwarding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.f$tie.positName (
        \"changingTimepoint\" $tie.timeRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $tie.identityColumnName $tie.identity,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
        }
/*~
        $tie.changingColumnName $tie.timeRange
    ) AS
$$BODY$$
BEGIN
    SELECT
        $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $tie.changingColumnName
    FROM
        $tie.capsule$.$tie.positName
    WHERE
        $tie.changingColumnName > changingTimepoint;
END;
$$BODY$$
LANGUAGE plpgsql;
~*/
    }
/*~
-- Tie annex rewinder -------------------------------------------------------------------------------------------------
-- r$tie.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.r$tie.annexName (
        \"positingTimepoint\" $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
        $tie.identityColumnName $tie.identity,
        $tie.positingColumnName $schema.metadata.positingRange,
        $tie.positorColumnName $schema.metadata.positorRange,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
        $tie.reliableColumnName $schema.reliableColumnType
    ) AS
$$BODY$$
BEGIN
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positingColumnName,
        $tie.positorColumnName,
        $tie.reliabilityColumnName,
        $tie.reliableColumnName
    FROM
        $tie.capsule$.$tie.annexName
    WHERE
        $tie.positingColumnName <= positingTimepoint;
END;
$$BODY$$
LANGUAGE plpgsql;

-- Tie assembled rewinder ---------------------------------------------------------------------------------------------
-- r$tie.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.r$tie.name (
        \"positor\" $schema.metadata.positorRange DEFAULT 0,
        $(tie.isHistorized())? \"changingTimepoint\" $tie.timeRange DEFAULT $schema.EOT,
        \"positingTimepoint\" $schema.metadata.positingRange DEFAULT $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
        $tie.identityColumnName $tie.identity,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
        }
/*~
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
        $tie.positingColumnName $schema.metadata.positingRange,
        $tie.positorColumnName $schema.metadata.positorRange,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
        $tie.reliableColumnName $schema.reliableColumnType
    ) AS
$$BODY$$
BEGIN
    SELECT
        $(schema.METADATA)? a.$tie.metadataColumnName,
        p.$tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        p.$role.columnName,
~*/
        }
/*~
        $(tie.isHistorized())? p.$tie.changingColumnName,
        a.$tie.positingColumnName,
        a.$tie.positorColumnName,
        a.$tie.reliabilityColumnName,
        a.$tie.reliableColumnName
    FROM
        $(tie.isHistorized())? $tie.capsule$.r$tie.positName(changingTimepoint) p : $tie.capsule$.$tie.positName p
    JOIN
        $tie.capsule$.r$tie.annexName(positingTimepoint) a
    ON
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positorColumnName = positor
    AND
        a.$tie.positingColumnName = (
            SELECT sub.$tie.positingColumnName
            FROM
                $tie.capsule$.r$tie.annexName(positingTimepoint) sub
            WHERE
                sub.$tie.identityColumnName = p.$tie.identityColumnName
            AND
                sub.$tie.positorColumnName = positor
            ORDER BY
                sub.$tie.positingColumnName DESC
            LIMIT 1
        );
END;
$$BODY$$
LANGUAGE plpgsql;

-- Tie assembled forwarder --------------------------------------------------------------------------------------------
-- f$tie.name forwarding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.f$tie.name (
        \"positor\" $schema.metadata.positorRange = 0,
        $(tie.isHistorized())? \"changingTimepoint\" $tie.timeRange = $schema.EOT,
        \"positingTimepoint\" $schema.metadata.positingRange = $schema.EOT
    )
    RETURNS TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
        $tie.identityColumnName $tie.identity,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
        }
/*~
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
        $tie.positingColumnName $schema.metadata.positingRange,
        $tie.positorColumnName $schema.metadata.positorRange,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
        $tie.reliableColumnName $schema.reliableColumnType
    ) AS
$$BODY$$
BEGIN
    SELECT
        $(schema.METADATA)? a.$tie.metadataColumnName,
        p.$tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        p.$role.columnName,
~*/
        }
/*~
        $(tie.isHistorized())? p.$tie.changingColumnName,
        a.$tie.positingColumnName,
        a.$tie.positorColumnName,
        a.$tie.reliabilityColumnName,
        a.$tie.reliableColumnName
    FROM
        $(tie.isHistorized())? $tie.capsule$.f$tie.positName(changingTimepoint) p : $tie.capsule$.$tie.positName p
    JOIN
        $tie.capsule$.r$tie.annexName(positingTimepoint) a
    ON
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positorColumnName = positor
    AND
        a.$tie.positingColumnName = (
            SELECT sub.$tie.positingColumnName
            FROM
                $tie.capsule$.r$tie.annexName(positingTimepoint) sub
            WHERE
                sub.$tie.identityColumnName = p.$tie.identityColumnName
            AND
                sub.$tie.positorColumnName = positor
            ORDER BY
                sub.$tie.positingColumnName DESC
            LIMIT 1
        );
END;
$$BODY$$
LANGUAGE plpgsql;
~*/
}