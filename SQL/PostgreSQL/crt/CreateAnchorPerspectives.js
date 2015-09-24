/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each anchor. There are five types of perspectives: time traveling, latest,
-- point-in-time, difference, and now. They also denormalize the anchor, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The time traveling perspective shows information as it was or will be based on a number
-- of input parameters.
--
-- v_positor             the view of which positor to adopt (defaults to 0)
-- v_changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- v_positingTimepoint   the point in positing time to travel to (defaults to End of Time)
-- v_reliable            whether to show reliable (1) or unreliable (0) results
--
-- The latest perspective shows the latest available (changing & positing) information for each anchor.
-- The now perspective shows the information as it is right now, with latest positing time.
-- The point-in-time perspective lets you travel through the information to the given timepoint,
-- with latest positing time and the given point in changing time.
--
-- v_changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints, and for
-- changes in all or a selection of attributes, with latest positing time.
--
-- v_intervalStart       the start of the interval for finding changes
-- v_intervalEnd         the end of the interval for finding changes
-- v_selection           a list of mnemonics for tracked attributes, ie 'MNE MON ICS', or null for all
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
/*~
-- No need to drop perspectives because we will do CREATE OR REPLACE
~*/
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-- t$anchor.name viewed as given by the input parameters
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule\.\"t$anchor.name\" (
    v_positor $schema.metadata.positorRange DEFAULT 0,
    v_changingTimepoint $schema.metadata.chronon DEFAULT $schema.EOT,
    v_positingTimepoint $schema.metadata.positingRange DEFAULT $schema.EOT,
    v_reliable smallint DEFAULT 1
)
RETURNS TABLE (
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.reliableColumnName smallint,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName, --TODO
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName,  --TODO
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
    $(anchor.hasMoreAttributes())?,
~*/
        }
/*~
) AS $$BODY$$
SELECT
    $anchor.mnemonic\.$anchor.identityColumnName,
    $(schema.METADATA)? $anchor.mnemonic\.$anchor.metadataColumnName,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.mnemonic\.$attribute.anchorReferenceName,
    $(schema.METADATA)? $attribute.mnemonic\.$attribute.metadataColumnName,
    $attribute.mnemonic\.$attribute.identityColumnName,
    $(attribute.timeRange)? $attribute.mnemonic\.$attribute.changingColumnName,
    $attribute.mnemonic\.$attribute.positingColumnName,
    $attribute.mnemonic\.$attribute.positorColumnName,
    $attribute.mnemonic\.$attribute.reliabilityColumnName,
    $attribute.mnemonic\.$attribute.reliableColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k$attribute.mnemonic\.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    k$attribute.mnemonic\.$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? k$attribute.mnemonic\.$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.mnemonic\.$attribute.checksumColumnName,
    $attribute.mnemonic\.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    $anchor.capsule\.\"$anchor.name\" $anchor.mnemonic
~*/
        while (attribute = anchor.nextAttribute()) {
            var timeRangeCaster = "::" + attribute.timeRange;
/*~
LEFT JOIN
    $attribute.capsule\.\"r$attribute.name\"(
        v_positor,
        $(attribute.isHistorized())? v_changingTimepoint$timeRangeCaster,
        v_positingTimepoint
    ) $attribute.mnemonic
ON
    $attribute.mnemonic\.$attribute.identityColumnName = (
        SELECT
            sub.$attribute.identityColumnName
        FROM
            $attribute.capsule\.\"r$attribute.name\"(
                v_positor,
                $(attribute.isHistorized())? v_changingTimepoint$timeRangeCaster,
                v_positingTimepoint
            ) sub
        WHERE
            sub.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName
        AND
            sub.$attribute.reliableColumnName = v_reliable
        ORDER BY
            $(attribute.isHistorized())? sub.$attribute.changingColumnName DESC,
            sub.$attribute.positingColumnName DESC
        LIMIT 1
    )~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    $knot.capsule\.\"$knot.name\" k$attribute.mnemonic
ON
    k$attribute.mnemonic\.$knot.identityColumnName = $attribute.mnemonic\.$attribute.knotReferenceName~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
$$BODY$$ LANGUAGE SQL;

-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information for all positors (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $anchor.capsule\.\"l$anchor.name\"
AS
SELECT
    p.*, 
    1 as $schema.metadata.reliableSuffix,
    $anchor.mnemonic\.*
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
CROSS JOIN LATERAL
    $anchor.capsule\.\"t$anchor.name\" (
        v_positor := p.$schema.metadata.positorSuffix
    ) $anchor.mnemonic;

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule\.\"p$anchor.name\" (
    v_changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.positorSuffix $schema.metadata.positorRange,
    Reliable int,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.reliableColumnName smallint,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName, --TODO
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName,  --TODO
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
    $(anchor.hasMoreAttributes())?,
~*/
        }
/*~
) AS $$BODY$$
SELECT
    p.*, 
    1 as $schema.metadata.reliableSuffix,
    $anchor.mnemonic\.*
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
CROSS JOIN LATERAL
    $anchor.capsule\.\"t$anchor.name\" (
        v_positor := p.$schema.metadata.positorSuffix,
        v_changingTimepoint := v_changingTimepoint
    ) $anchor.mnemonic;
$$BODY$$ LANGUAGE SQL;

-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $anchor.capsule\.\"n$anchor.name\"
AS
SELECT
    p.*, 
    1 as $schema.metadata.reliableSuffix,
    $anchor.mnemonic\.*
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
CROSS JOIN LATERAL
    $anchor.capsule\.\"t$anchor.name\" (
        v_positor := p.$schema.metadata.positorSuffix,
        v_changingTimepoint := CURRENT_TIMESTAMP(6)::timestamp
    ) $anchor.mnemonic;

~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule\.\"d$anchor.name\" (
    v_intervalStart $schema.metadata.chronon,
    v_intervalEnd $schema.metadata.chronon,
    v_selection varchar(1000) = null
)
RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.reliableColumnName smallint,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName, --TODO
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName,  --TODO
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
    $(anchor.hasMoreAttributes())?,
~*/
        }
/*~

) AS $$BODY$$
SELECT
    timepoints.inspectedTimepoint,
    $anchor.mnemonic\.*
FROM
    $schema.metadata.encapsulation\.\"_$schema.metadata.positorSuffix\" p
JOIN (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.positorColumnName AS positor,
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $attribute.capsule\.\"$attribute.name\"
    WHERE
        (v_selection is null OR v_selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN v_intervalStart AND v_intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
ON
    timepoints.positor = p.$schema.metadata.positorSuffix
CROSS JOIN LATERAL
    $anchor.capsule\.\"t$anchor.name\" (
        timepoints.positor,
        timepoints.inspectedTimepoint
    ) $anchor.mnemonic
 WHERE
    $anchor.mnemonic\.$anchor.identityColumnName = timepoints.$anchor.identityColumnName;

$$BODY$$ LANGUAGE SQL;

~*/
        }
    }
}