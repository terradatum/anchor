/*~
-- ATTRIBUTE TRIGGERS ------------------------------------------------------------------------------------------------
--
-- The following triggers on the assembled views make them behave like tables.
-- There is one 'instead of' trigger for: insert.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, attribute;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        var statementTypes = "'N'";
        if(attribute.isAssertive())
            statementTypes += ",'D'";
        if(attribute.isHistorized() && !attribute.isIdempotent())
            statementTypes += ",'R'";
        var changingParameter = attribute.isHistorized() ? 'v_changingtimepoint := v.' + attribute.changingColumnName + ', ' : '';
/*~
-- Insert trigger Before Statement ------------------------------------------------------------------------------------
-- if_$attribute.name$_pre instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $attribute.capsule$.\"if_$attribute.name$_pre\"()
	RETURNS trigger AS 
	$$BODY$$
	BEGIN
	CREATE TEMP TABLE inserted_$attribute.name (
		$attribute.anchorReferenceName $anchor.identity not null,
		$(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
		$(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
		$attribute.positorColumnName $schema.metadata.positorRange not null,
		$attribute.positingColumnName $schema.metadata.positingRange not null,
		$attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
		$attribute.reliableColumnName smallint not null,
		$(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
		$(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
		primary key(
		    $attribute.anchorReferenceName
		)
	) ON COMMIT DROP;
	END
	$$BODY$$
	LANGUAGE plpgsql;

-- Insert trigger Instead of Row --------------------------------------------------------------------------------------
-- if_$attribute.name_post instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $attribute.capsule$.\"if_$attribute.name\"()
	RETURNS trigger AS 
	$$BODY$$
	BEGIN
    INSERT INTO inserted_$attribute.name select NEW.*;
    END
	$$BODY$$
	LANGUAGE plpgsql;

-- Insert trigger After Statement -------------------------------------------------------------------------------------
-- if_$attribute.name$_post instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $attribute.capsule$.\"if_$attribute.name$_post\"()
	RETURNS trigger AS 
	$$BODY$$
	DECLARE \"maxVersion\" int;
	DECLARE \"currentVersion\" int;
	BEGIN
	CREATE TEMP TABLE tmp_$attribute.name (
		$attribute.anchorReferenceName $anchor.identity not null,
		$(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
		$(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
		$attribute.positorColumnName $schema.metadata.positorRange not null,
		$attribute.positingColumnName $schema.metadata.positingRange not null,
		$attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
		$attribute.reliableColumnName smallint not null,
		$(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
		$(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
		$attribute.versionColumnName bigint not null,
		$attribute.statementTypeColumnName char(1) not null,
		primary key(
		    $attribute.versionColumnName,
		    $attribute.positorColumnName,
		    $attribute.anchorReferenceName
		)
	) ON COMMIT DROP;
	INSERT INTO tmp_$attribute.name
	    SELECT
		i.$attribute.anchorReferenceName,
		$(schema.METADATA)? i.$attribute.metadataColumnName,
		$(attribute.isHistorized())? i.$attribute.changingColumnName,
		i.$attribute.positorColumnName,
		i.$attribute.positingColumnName,
		i.$attribute.reliabilityColumnName,
		case
		    when i.$attribute.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
		    else 1
		end,
		i.$attribute.valueColumnName,
		$(attribute.hasChecksum())? ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))),
		DENSE_RANK() OVER (
		    PARTITION BY
			i.$attribute.positorColumnName,
			i.$attribute.anchorReferenceName
		    ORDER BY
			$(attribute.isHistorized())? i.$attribute.changingColumnName ASC,
			i.$attribute.positingColumnName ASC,
			i.$attribute.reliabilityColumnName ASC
		),
		'X'
	    FROM
		inserted_$attribute.name i;

		\"currentVersion\" = 0;

	    SELECT
		    MAX($attribute.versionColumnName)
	    FROM
		    tmp_$attribute.name
		INTO \"maxVersion\";
	    WHILE (\"currentVersion\" < \"maxVersion\")
	    LOOP
		\"currentVersion\" = \"currentVersion\" + 1;
		UPDATE tmp_$attribute.name
		SET
		    $attribute.statementTypeColumnName =
			CASE
			    WHEN EXISTS (
				SELECT
				    t.$attribute.identityColumnName
				FROM
				    \"$anchor.capsule\".\"t$anchor.name\"(v_positor := v.$attribute.positorColumnName, $changingParameter v_positingtimepoint := v.$attribute.positingColumnName, v_reliable := v.$attribute.reliableColumnName) t
				WHERE
				    t.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
				$(attribute.isHistorized())? AND
				    $(attribute.isHistorized())? t.$attribute.changingColumnName = v.$attribute.changingColumnName
				AND
				    t.$attribute.reliabilityColumnName = v.$attribute.reliabilityColumnName
				AND
				    $(attribute.hasChecksum())? t.$attribute.checksumColumnName = v.$attribute.checksumColumnName : t.$attribute.valueColumnName = v.$attribute.valueColumnName
			    LIMIT 1)
			    THEN 'D' -- duplicate assertion
			    WHEN p.$attribute.anchorReferenceName is not null
			    THEN 'S' -- duplicate statement
	~*/
		    if(attribute.isHistorized()) {
	/*~
			    WHEN EXISTS (
				SELECT
				    $(attribute.hasChecksum())? v.$attribute.checksumColumnName : v.$attribute.valueColumnName
				WHERE
				    $(attribute.hasChecksum())? v.$attribute.checksumColumnName =  : v.$attribute.valueColumnName =
					$attribute.capsule$.\"pre$attribute.name\" (
					    v.$attribute.anchorReferenceName,
					    v.$attribute.positorColumnName,
					    v.$attribute.changingColumnName,
					    v.$attribute.positingColumnName
					)
			    ) OR EXISTS (
				SELECT
				    $(attribute.hasChecksum())? v.$attribute.checksumColumnName : v.$attribute.valueColumnName
				WHERE
				    $(attribute.hasChecksum())? v.$attribute.checksumColumnName = : v.$attribute.valueColumnName =
					$attribute.capsule$.\"fol$attribute.name\" (
					    v.$attribute.anchorReferenceName,
					    v.$attribute.positorColumnName,
					    v.$attribute.changingColumnName,
					    v.$attribute.positingColumnName
					)
			    )
			    THEN 'R' -- restatement
	~*/
		    }
	/*~
			    ELSE 'N' -- new statement
			END
		FROM
		    tmp_$attribute.name v
		LEFT JOIN
		    \"$attribute.capsule\".\"$attribute.positName\" p
		ON
		    p.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
		$(attribute.isHistorized())? AND
		    $(attribute.isHistorized())? p.$attribute.changingColumnName = v.$attribute.changingColumnName
		AND
		    $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
		WHERE
		    v.$attribute.versionColumnName = \"currentVersion\";

		INSERT INTO \"$attribute.capsule\".\"$attribute.positName\" (
		    $attribute.anchorReferenceName,
		    $(attribute.isHistorized())? $attribute.changingColumnName,
		    $attribute.valueColumnName
		)
		SELECT
		    $attribute.anchorReferenceName,
		    $(attribute.isHistorized())? $attribute.changingColumnName,
		    $attribute.valueColumnName
		FROM
		    tmp_$attribute.name
		WHERE
		    $attribute.versionColumnName = \"currentVersion\"
		AND
		    $attribute.statementTypeColumnName in ($statementTypes);

		INSERT INTO \"$attribute.capsule\".\"$attribute.annexName\" (
		    $(schema.METADATA)? $attribute.metadataColumnName,
		    $attribute.identityColumnName,
		    $attribute.positorColumnName,
		    $attribute.positingColumnName,
		    $attribute.reliabilityColumnName
		)
		SELECT
		    $(schema.METADATA)? v.$attribute.metadataColumnName,
		    p.$attribute.identityColumnName,
		    v.$attribute.positorColumnName,
		    v.$attribute.positingColumnName,
		    v.$attribute.reliabilityColumnName
		FROM
		    tmp_$attribute.name v
		JOIN
		    \"$attribute.capsule\".\"$attribute.positName\" p
		ON
		    p.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
		$(attribute.isHistorized())? AND
		    $(attribute.isHistorized())? p.$attribute.changingColumnName = v.$attribute.changingColumnName
		AND
		    $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
		WHERE
		    v.$attribute.versionColumnName = \"currentVersion\"
		AND
		    $attribute.statementTypeColumnName in ('S',$statementTypes);
		END LOOP;

	DROP TABLE inserted_$attribute.name;
	DROP TABLE tmp_$attribute.name;
    RETURN null;
	END;
	$$BODY$$
	LANGUAGE plpgsql;

-- Insert triggers ----------------------------------------------------------------------------------------------------
-- it_l$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"it_$attribute.name$_pre\" ON $attribute.capsule$.\"$attribute.name\";
DROP TRIGGER IF EXISTS \"it_$attribute.name\" ON $attribute.capsule$.\"$attribute.name\";
DROP TRIGGER IF EXISTS \"it_$attribute.name$_post\" ON $attribute.capsule$.\"$attribute.name\";
CREATE TRIGGER \"it_$attribute.name$_pre\" BEFORE INSERT ON $attribute.capsule$.\"$attribute.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $attribute.capsule$.\"if_$attribute.name$_pre\"();
CREATE TRIGGER \"it_$attribute.name\" INSTEAD OF INSERT ON $attribute.capsule$.\"$attribute.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $attribute.capsule$.\"if_$attribute.name\"();
CREATE TRIGGER \"it_$attribute.name$_post\" AFTER INSERT ON $attribute.capsule$.\"$attribute.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $attribute.capsule$.\"if_$attribute.name$_post\"();
~*/
    } // end of loop over attributes
}