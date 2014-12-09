/*~
-- KNOTS --------------------------------------------------------------------------------------------------------------
--
-- Knots are used to store finite sets of values, normally used to describe states
-- of entities (through knotted attributes) or relationships (through knotted ties).
-- Knots have their own surrogate identities and are therefore immutable.
-- Values can be added to the set over time though.
-- Knots should have values that are mutually exclusive and exhaustive.
-- Knots are unfolded when using equivalence.
--
 ~*/
var knot;

while (knot = schema.nextKnot()) {
    schema.setIdentityGenerator(knot);
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $knot.capsule$.\"$knot.name\" (
    \"$knot.identityColumnName\" $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    \"$knot.valueColumnName\" $knot.dataRange not null,
    $(knot.hasChecksum())? \"$knot.checksumColumnName\" bytea,
    $(schema.METADATA)? \"$knot.metadataColumnName\" $schema.metadata.metadataType not null,
    constraint \"pk$knot.name\" primary key (
        \"$knot.identityColumnName\"
    ),
    constraint \"uq$knot.name\" unique (
        $(knot.hasChecksum())? \"$knot.checksumColumnName\" : \"$knot.valueColumnName\"
    )
);
ALTER TABLE IF EXISTS ONLY $knot.capsule$.\"$knot.name\" CLUSTER ON \"pk$knot.name\";
~*/
}
