if(schema.BUSINESS_VIEWS) {
/*~
-- TIE TEMPORAL BUSINESS PERSPECTIVES ---------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each tie. There are four types of perspectives: latest,
-- point-in-time, difference, and now.
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
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- v_equivalent          the equivalent for which to retrieve data
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- Latest_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $tie.capsule\.\"Latest_$tie.businessName\" AS
SELECT
    $(schema.CRT)? tie.Positor,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS $role.businessName$(tie.hasMoreRoles())?,
~*/
            }
            else {
/*~
    tie.$role.columnName as $role.businessColumnName$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
FROM
    $tie.capsule\.\"l$tie.name\"" tie;

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- Point_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule\.\"Point_$tie.businessName\" (
    v_changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $(schema.CRT)? Positor $schema.metadata.positorRange,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $role.businessName $knot.dataRange$(tie.hasMoreRoles())?,
~*/
            } else if(role.anchor) {
/*~
    $role.businessColumnName $role.anchor.identity$(tie.hasMoreRoles())?,
~*/
    
            } else {
/*~
    $role.businessColumnName $role.knot.identity$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
) AS $$BODY$$
SELECT
    $(schema.CRT)? tie.Positor,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS $role.businessName$(tie.hasMoreRoles())?,
~*/
            }
            else {
/*~
    tie.$role.columnName as $role.businessColumnName$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
FROM
    $tie.capsule\.\"p$tie.name\"(v_changingTimepoint) tie
$$BODY$$ LANGUAGE SQL;
-- Now perspective ----------------------------------------------------------------------------------------------------
-- Current_$tie.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $tie.capsule\.\"Current_$tie.businessName\"
AS
SELECT
    *
FROM
    $tie.capsule\.\"Point_$tie.businessName\"(CURRENT_TIMESTAMP(6)::timestamp);

~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- Difference_$tie.businessName showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule\.\"Difference_$tie.businessName\" (
    v_intervalStart $schema.metadata.chronon,
    v_intervalEnd $schema.metadata.chronon
)
RETURNS TABLE (
    $(schema.CRT)? Positor  $schema.metadata.positorRange,
    $(tie.isHistorized())? Time_of_Change $tie.timeRange,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $role.businessName $knot.dataRange$(tie.hasMoreRoles())?,
~*/
            } else if(role.anchor) {
/*~
    $role.businessColumnName $role.anchor.identity$(tie.hasMoreRoles())?,
~*/
    
            } else {
/*~
    $role.businessColumnName $role.knot.identity$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
) AS $$BODY$$
SELECT
    $(schema.CRT)? tie.$tie.positorColumnName as Positor,
    $(tie.isHistorized())? tie.$tie.changingColumnName as Time_of_Change,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS $role.businessName$(tie.hasMoreRoles())?,
~*/
            }
            else {
/*~
    tie.$role.columnName as $role.businessColumnName$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
FROM
    $tie.capsule\.\"d$tie.name\"(v_intervalStart, v_intervalEnd) tie;
$$BODY$$ LANGUAGE SQL;
~*/
    }
// -------------------------------------------------- EQUIVALENCE -----------------------------------------------------
//equivalence goes here. omited because not supported by crt

} // end of loop over ties
}