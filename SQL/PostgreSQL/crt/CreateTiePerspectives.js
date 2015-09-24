/*~
-- TIE TEMPORAL PERSPECTIVES ------------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each tie. There are four types of perspectives: latest,
-- point-in-time, difference, and now.
--
-- The time traveling perspective shows information as it was or will be based on a number
-- of input parameters.
--
-- v_positor             the view of which positor to adopt (defaults to 0)
-- v_changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- v_positingTimepoint   the point in positing time to travel to (defaults to End of Time)
-- v_reliable            whether to show reliable (1) or unreliable (0) results
--
-- The latest perspective shows the latest available information for each tie.
-- The now perspective shows the information as it is right now.
-- The point-in-time perspective lets you travel through the information to the given timepoint.
--
-- v_changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints.
--
-- v_intervalStart       the start of the interval for finding changes
-- v_intervalEnd         the end of the interval for finding changes
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
    var timeRangeCaster = "::" + tie.timeRange;
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-- t$tie.name viewed as given by the input parameters
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule\.\"t$tie.name\" (
    v_positor $schema.metadata.positorRange DEFAULT 0,
    v_changingTimepoint $schema.metadata.chronon DEFAULT $schema.EOT,
    v_positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT,
    v_reliable $schema.reliableColumnType DEFAULT 1
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.positorColumnName $schema.metadata.positorRange,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.reliableColumnName $schema.reliableColumnType,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)?  $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $(role.anchor)? $role.anchor.identity : $role.knot.identity
    $(tie.hasMoreRoles())?,
~*/
        }
/*~
) AS $$BODY$$
SELECT
    tie.$tie.identityColumnName,
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    tie.$tie.positorColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
    tie.$tie.positingColumnName,
    tie.$tie.reliabilityColumnName,
    tie.$tie.reliableColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $role.name\.$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? $role.name\.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    $tie.capsule\.\"r$tie.name\"(
        v_positor,
        $(tie.isHistorized())? v_changingTimepoint$timeRangeCaster,
        v_positingTimepoint
    ) tie
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    $knot.capsule\.\"$knot.name\" $role.name
ON
    $role.name\.$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.identityColumnName = (
        SELECT
            sub.$tie.identityColumnName
        FROM
            $tie.capsule\.\"r$tie.name\"(
                v_positor,
                $(tie.isHistorized())? v_changingTimepoint$timeRangeCaster,
                v_positingTimepoint
            ) sub
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        AND
~*/
                }
            }
            else {
/*~
        (
~*/
                while(role = tie.nextValue()) {
/*~
                sub.$role.columnName = tie.$role.columnName
            $(tie.hasMoreValues())? OR
~*/
                }
/*~
        )
        AND
~*/
            }
/*~
            sub.$tie.reliableColumnName = v_reliable
        ORDER BY
            $(tie.isHistorized())? sub.$tie.changingColumnName DESC,
            sub.$tie.positingColumnName DESC
        LIMIT 1
    );
$$BODY$$ LANGUAGE SQL;
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $tie.capsule\.\"l$tie.name\" AS
SELECT
    *
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
CROSS JOIN LATERAL
    $tie.capsule\.\"t$tie.name\" (
        p.$schema.metadata.positorSuffix
    ) tie;

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule\.\"p$tie.name\" (
    v_changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.positorSuffix $schema.metadata.positorRange,
    $tie.identityColumnName  $tie.identity,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.positorColumnName $schema.metadata.positorRange,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.reliableColumnName $schema.reliableColumnType,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)?  $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $(role.anchor)? $role.anchor.identity : $role.knot.identity
    $(tie.hasMoreRoles())?,
~*/
        }
/*~
) AS $$BODY$$
SELECT
    *
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
CROSS JOIN LATERAL
    $tie.capsule\.\"t$tie.name\" (
        p.$schema.metadata.positorSuffix,
        v_changingTimepoint
    ) tie;
$$BODY$$ LANGUAGE SQL;
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $tie.capsule\.\"n$tie.name\" AS
SELECT
    *
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
CROSS JOIN LATERAL
    $tie.capsule\.\"t$tie.name\" (
        v_positor := p.$schema.metadata.positorSuffix,
        v_changingTimepoint := CURRENT_TIMESTAMP(6)::timestamp
    ) tie;

~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$tie.name showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule\.\"d$tie.name\" (
    v_intervalStart $schema.metadata.chronon,
    v_intervalEnd $schema.metadata.chronon
)
RETURNS TABLE (
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)?  $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
        }
/*~
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
    }
/*~
    $(tie.timeRange)? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.reliableColumnName $schema.reliableColumnType
) AS $$BODY$$
SELECT
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
    $role.name\.$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? $role.name\.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
        }
/*~
    tie.*
FROM
    $tie.capsule\.\"$tie.name\" tie
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    $knot.capsule\.\"$knot.name\" $role.name
ON
    $role.name\.$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN v_intervalStart AND v_intervalEnd;
$$BODY$$ LANGUAGE SQL;
~*/
    }
}