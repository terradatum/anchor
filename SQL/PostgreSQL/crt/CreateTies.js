/*~
-- TIES ---------------------------------------------------------------------------------------------------------------
--
-- Ties are used to represent relationships between entities.
-- They come in four flavors: static, historized, knotted static, and knotted historized.
-- Ties have cardinality, constraining how members may participate in the relationship.
-- Every entity that is a member in a tie has a specified role in the relationship.
-- Ties must have at least two anchor roles and zero or more knot roles.
--
~*/
var tie;
while (tie = schema.nextTie()) {
    if(schema.METADATA)
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
    schema.setIdentityGenerator(tie);
    if(tie.isHistorized() && tie.isKnotted()) {
/*~
-- Knotted historized tie table ---------------------------------------------------------------------------------------
~*/
    }
    else if(tie.isHistorized()) {
/*~
-- Historized tie table -----------------------------------------------------------------------------------------------
~*/
    }
    else if(tie.isKnotted()) {
/*~
-- Knotted static tie table -------------------------------------------------------------------------------------------
~*/
    }
    else {
/*~
-- Static tie table ---------------------------------------------------------------------------------------------------
~*/
    }
/*~
-- $tie.positName table (having $tie.roles.length roles)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $tie.capsule$.\"$tie.positName\" (
    $tie.identityColumnName $tie.identityGenerator not null,
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.anchor)? $role.anchor.identity not null, : $role.knot.identity not null,
~*/
    }
/*~
    $(tie.timeRange)? $tie.changingColumnName $tie.timeRange not null,
~*/
    while (role = tie.nextRole()) {
/*~
    constraint ${(tie.positName + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $(role.anchor)? $role.anchor.capsule\.\"$role.anchor.name\"($role.anchor.identityColumnName), : $role.knot.capsule$.\"$role.knot.name\"($role.knot.identityColumnName),
 ~*/
    }
    // one-to-one and we need additional constraints
    if(!tie.hasMoreIdentifiers()) {
        while (role = tie.nextRole()) {
            if(role.isAnchorRole()) {
                if(tie.isHistorized()) {
/*~
    constraint ${tie.positName + '_uq' + role.name}$ unique (
        $role.columnName,
        $tie.changingColumnName
    ),
~*/
                }
                else {
/*~
    constraint ${tie.positName + '_uq' + role.name}$ unique (
        $role.columnName
    ),
~*/
                }
            }
        }
    }
/*~
    constraint pk$tie.positName primary key (
        $tie.identityColumnName
    ),
    constraint uq$tie.name unique (
~*/
    while (role = tie.nextIdentifier()) {
/*~
        $role.columnName~*/
        if(tie.hasMoreIdentifiers() || tie.hasMoreValues() || tie.isHistorized()) {
            /*~,~*/
        }
    }
    if(tie.isHistorized()) {
/*~
        $tie.changingColumnName~*/
        if(tie.hasMoreValues()) {
            /*~,~*/
        }
    }
    while (role = tie.nextValue()) {
/*~
        $role.columnName~*/
        if(tie.hasMoreValues()) {
            /*~,~*/
        }
    }
/*~
    )
);
~*/
    var scheme = schema.PARTITIONING ? ' ON PositorScheme(' + tie.positorColumnName + ')' : '';
/*~
-- Tie annex table ----------------------------------------------------------------------------------------------------
-- $tie.annexName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $tie.capsule$.\"$tie.annexName\" (
    $tie.identityColumnName $tie.identityGenerator not null,
    $tie.positingColumnName $schema.metadata.positingRange not null,
    $tie.positorColumnName $schema.metadata.positorRange not null,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $tie.reliableColumnName $schema.reliableColumnType not null,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$tie.annexName foreign key (
        $tie.identityColumnName
    ) references $tie.capsule$.\"$tie.positName\"($tie.identityColumnName),
    constraint pk$tie.annexName primary key (
        $tie.identityColumnName,
        $tie.positorColumnName,
        $tie.positingColumnName
    )
)$scheme;

-- This trigger serves to replace the computed column functionality we saw in the MS SQL code
--$tie.reliableColumnName as isnull(cast(
--    case
--        when $tie.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
--        else 1
--    end
--as tinyint), 1) persisted
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"func_$tie.annexName\"()
  RETURNS trigger AS
$$BODY$$
BEGIN
    NEW.$tie.reliableColumnName =
        coalesce(cast(
            case
                when NEW.$tie.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
                else 1
            end
       as $schema.reliableColumnType), 1);
 
    RETURN NEW;
END;
$$BODY$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS \"trig_$tie.annexName\" ON $tie.capsule$.\"$tie.annexName\";

CREATE TRIGGER \"trig_$tie.annexName\"
  BEFORE INSERT OR UPDATE
  ON $tie.capsule$.\"$tie.annexName\"
  FOR EACH ROW
  EXECUTE PROCEDURE $tie.capsule$.\"func_$tie.annexName\"();
~*/
}
