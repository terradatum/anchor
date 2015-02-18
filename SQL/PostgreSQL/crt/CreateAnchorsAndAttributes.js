/*~
-- ANCHORS AND ATTRIBUTES ---------------------------------------------------------------------------------------------
--
-- Anchors are used to store the identities of entities.
-- Anchors are immutable.
-- Attributes are used to store values for properties of entities.
-- Attributes are mutable, their values may change over one or more types of time.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
-- Anchors may have zero or more adjoined attributes.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    schema.setIdentityGenerator(anchor);
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $anchor.capsule$.\"$anchor.name\" (
    $anchor.identityColumnName $anchor.identityGenerator not null,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null, : $anchor.dummyColumnName bit null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName
    )
);
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        schema.setIdentityGenerator(attribute);
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule$.\"$attribute.positName\" (
    $attribute.identityColumnName $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule$.\"$anchor.name\"($anchor.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName 
    )
);
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted historized attribute posit table ---------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule$.\"$attribute.positName\" (
    $attribute.identityColumnName $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule$.\"$anchor.name\"($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule$.\"$knot.name\"($knot.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.knotReferenceName
    )
);
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule$.\"$attribute.positName\" (
    $attribute.identityColumnName $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule$.\"$anchor.name\"($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule$.\"$knot.name\"($knot.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $attribute.knotReferenceName
    )
);
~*/
    }
    else {
/*~
-- Static attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule$.\"$attribute.positName\" (
    $attribute.identityColumnName $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule$.\"$anchor.name\"($anchor.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    )
);
~*/
    }
    var scheme = schema.PARTITIONING ? ' ON PositorScheme(' + attribute.positorColumnName + ')' : '';
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule$.\"$attribute.annexName\" (
    $attribute.identityColumnName $attribute.identityGenerator not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.positorColumnName $schema.metadata.positorRange not null,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $attribute.reliableColumnName $schema.reliableColumnType not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references $attribute.capsule$.\"$attribute.positName\"($attribute.identityColumnName),
    constraint pk$attribute.annexName primary key (
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )
)$scheme;

-- This trigger serves to replace the computed column functionality that was in the MS SQL code
--$attribute.reliableColumnName as isnull(cast(
--    case
--        when $attribute.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
--        else 1
--    end
--as tinyint), 1) persisted
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION func_$attribute.annexName()
  RETURNS trigger AS
$$BODY$$
BEGIN
    NEW.$attribute.reliableColumnName =
        coalesce(cast(
            case
                when NEW.$attribute.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
                else 1
            end
       as $schema.reliableColumnType), 1);
 
    RETURN NEW;
END;
$$BODY$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_$attribute.annexName ON $attribute.capsule$.\"$attribute.annexName\";

CREATE TRIGGER trig_$attribute.annexName
  BEFORE INSERT OR UPDATE
  ON $attribute.capsule$.\"$attribute.annexName\"
  FOR EACH ROW
  EXECUTE PROCEDURE func_$attribute.annexName();
~*/
}}