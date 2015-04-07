/*~
-- TIE TRIGGERS -------------------------------------------------------------------------------------------------------
--
-- The following triggers on the assembled and latest views make them behave like tables.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent ties, only changes that represent values different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var tie, role, knot, anchor;
while (tie = schema.nextTie()) {
/*~
-- Insert trigger BEFORE STATEMENT ------------------------------------------------------------------------------------
-- it$tie.name before INSERT trigger on $tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"tri_$tie.name\"()
	RETURNS trigger AS 
	$$BODY$$
    DECLARE
        prefix varchar;
    BEGIN
    FOR i IN 0..TG_NARGS-1 LOOP
    prefix := TG_ARGV[i];
    EXECUTE format('CREATE TEMP TABLE %s_$tie.name  (
		$(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType null,
		$tie.identityColumnName $tie.identity null,
~*/
    var role;
    while (role = tie.nextRole()) {
		    if(role.knot) {
			knot = role.knot;
	/*~
		$role.columnName $knot.identity null,
	~*/
		    }
		    else {
			anchor = role.anchor;
	/*~
		$role.columnName $anchor.identity null,
	~*/
		    }
		}
/*~
		$(tie.timeRange)? $tie.changingColumnName $tie.timeRange null,
		$tie.positingColumnName $schema.metadata.positingRange null,
		$tie.positorColumnName $schema.metadata.positorRange null,
		$tie.reliabilityColumnName $schema.metadata.reliabilityRange null,
		$tie.reliableColumnName $schema.reliableColumnType null
	    ) ON COMMIT DROP;', prefix);
    END LOOP;
    RETURN null;
    END;
    $$BODY$$
    LANGUAGE plpgsql;

-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$tie.name instead of INSERT trigger on $tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"if_$tie.name\"()
	RETURNS trigger AS 
	$$BODY$$
	DECLARE \"now\" $schema.metadata.chronon;
	\"maxVersion\" int;
	\"currentVersion\" int;
	BEGIN
	    now := $schema.metadata.now;

	    CREATE TEMP TABLE inserted2  (
		ref int not null,
		$(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
		$(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
		$tie.versionColumnName bigint not null,
		$tie.statementTypeColumnName char(1) not null,
		$tie.positorColumnName $schema.metadata.positorRange not null,
		$tie.positingColumnName $schema.metadata.positingRange not null,
		$tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
	~*/
		while (role = tie.nextRole()) {
		    if(role.knot) {
			knot = role.knot;
	/*~
		$role.columnName $knot.identity not null,
	~*/
		    }
		    else {
			anchor = role.anchor;
	/*~
		$role.columnName $anchor.identity not null,
	~*/
		    }
		}
	/*~
		primary key (
		    $(tie.isHistorized())? $tie.versionColumnName,
	~*/
		    if(tie.hasMoreIdentifiers()) {
			while(role = tie.nextIdentifier()) {
	/*~
		    $role.columnName$(tie.hasMoreIdentifiers())?,
	~*/
			}
		    }
		    else {
			while(role = tie.nextValue()) {
	/*~
		    $role.columnName$(tie.hasMoreValues())?,
	~*/
			}
		    }
	/*~
		)
	    ) ON COMMIT DROP;
	    INSERT INTO inserted2
	    SELECT
		ROW_NUMBER() OVER (),
		$(schema.METADATA)? COALESCE(i.$tie.metadataColumnName, 0),
		$(tie.isHistorized())? COALESCE(i.$tie.changingColumnName, now),
		DENSE_RANK() OVER (
		    PARTITION BY
			i.$tie.positorColumnName,
	~*/
		    if(tie.hasMoreIdentifiers()) {
			while(role = tie.nextIdentifier()) {
	/*~
			i.$role.columnName$(tie.hasMoreIdentifiers())?,
	~*/
			}
		    }
		    else {
			while(role = tie.nextValue()) {
	/*~
			i.$role.columnName$(tie.hasMoreValues())?,
	~*/
			}
		    }
	/*~
		    ORDER BY
			$(tie.isHistorized())? COALESCE(i.$tie.changingColumnName, now),
			i.$tie.positingColumnName ASC,
			i.$tie.reliabilityColumnName ASC                
		),
		'X',
		COALESCE(i.$tie.positorColumnName, 0),
		COALESCE(i.$tie.positingColumnName, now),
		COALESCE(i.$tie.reliabilityColumnName, 
		CASE i.$tie.reliableColumnName
		    WHEN 0 THEN $schema.metadata.deleteReliability
		    ELSE $schema.metadata.reliableCutoff
		END),        
	~*/
		while (role = tie.nextRole()) {
	/*~
		i.$role.columnName$(tie.hasMoreRoles())?,
	~*/
		}
	/*~
	    FROM
		new_$tie.name i
	    WHERE
	~*/
		if(tie.hasMoreIdentifiers()) {
		    while(role = tie.nextIdentifier()) {
	/*~
	    $(!tie.isFirstIdentifier())? AND
		i.$role.columnName is not null~*/
		    }
		}
		else {
		    while(role = tie.nextValue()) {
	/*~
	    $(!tie.isFirstValue())? AND
		i.$role.columnName is not null~*/
		    }
		}
	/*~;~*/
	    var changingParameter = tie.isHistorized() ? 'v_changingtimepoint := v.' + tie.changingColumnName + ', ' : '';
		var statementTypes = "'N'";
		console.log(tie.isIdempotent());
		if(tie.isAssertive())
		    statementTypes += ",'D'";
		if(tie.isHistorized() && !tie.isIdempotent())
		    statementTypes += ",'R'";
	/*~
		\"currentVersion\" := 0;
	    SELECT
		    max($tie.versionColumnName)
	    FROM
		inserted2
		INTO \"maxVersion\";
	    WHILE (\"currentVersion\" < \"maxVersion\")
	    LOOP
		\"currentVersion\" = \"currentVersion\" + 1;
		UPDATE inserted2
		SET
		    $tie.statementTypeColumnName =
			CASE
			    WHEN EXISTS (
				SELECT
				    t.$tie.identityColumnName
				FROM
				    \"$tie.capsule\".\"t$tie.name\"(v_positor := v.$tie.positorColumnName, $changingParameter v_positingtimepoint :=v.$tie.positingColumnName, v_reliable := 1::smallint) t
				WHERE
				    t.$tie.reliabilityColumnName = v.$tie.reliabilityColumnName
				$(tie.isHistorized())? AND
				    $(tie.isHistorized())? t.$tie.changingColumnName = v.$tie.changingColumnName
	~*/
		while(role = tie.nextRole()) {
	/*~
				AND
				    t.$role.columnName = v.$role.columnName
	~*/
		}
	/*~
			    LIMIT 1) 
			    THEN 'D' -- duplicate assertion    
			    WHEN p.$tie.identityColumnName is not null
			    THEN 'S' -- duplicate statement
	~*/
		if(tie.isHistorized() && tie.hasMoreValues()) {
	/*~    
			    WHEN (
			    SELECT
				COUNT(*)
			    FROM (
				(SELECT
	~*/
		    while(role = tie.nextValue()) {
	/*~
				    pre.$role.columnName$(tie.hasMoreValues())?,
	~*/
		    }
	/*~
				FROM
				    \"$tie.capsule\".\"r$tie.name\" (
					v.$tie.positorColumnName,
					v.$tie.changingColumnName,
					v.$tie.positingColumnName                            
				    ) pre
				WHERE
	~*/
		    if(tie.hasMoreIdentifiers()) {
			while(role = tie.nextIdentifier()) {
	/*~
				    pre.$role.columnName = v.$role.columnName
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
					pre.$role.columnName = v.$role.columnName
				    $(tie.hasMoreValues())? OR
	~*/
			}
	/*~
				)
				AND
	~*/
		    }
	/*~
				    pre.$tie.changingColumnName < v.$tie.changingColumnName
				AND
				    pre.$tie.reliableColumnName = 1
				ORDER BY
				    pre.$tie.changingColumnName DESC,
				    pre.$tie.positingColumnName DESC
				LIMIT 1) 
				UNION
				(SELECT 
	~*/
		    while(role = tie.nextValue()) {
	/*~
				    fol.$role.columnName$(tie.hasMoreValues())?,
	~*/
		    }
	/*~
				FROM
				    \"$tie.capsule\".\"f$tie.name\" (
					v.$tie.positorColumnName,
					v.$tie.changingColumnName,
					v.$tie.positingColumnName                            
				    ) fol
				WHERE
	~*/
		    if(tie.hasMoreIdentifiers()) {
			while(role = tie.nextIdentifier()) {
	/*~
				    fol.$role.columnName = v.$role.columnName
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
					fol.$role.columnName = v.$role.columnName
				    $(tie.hasMoreValues())? OR
	~*/
			}
	/*~
				)
				AND
	~*/
		    }
	/*~
				    fol.$tie.changingColumnName > v.$tie.changingColumnName
				AND
				    fol.$tie.reliableColumnName = 1
				ORDER BY
				    fol.$tie.changingColumnName ASC,
				    fol.$tie.positingColumnName DESC
			    LIMIT 1) 
			    ) s
			    WHERE
	~*/
		    while(role = tie.nextValue()) {
	/*~
				s.$role.columnName = v.$role.columnName
			    $(tie.hasMoreValues())? AND
	~*/
		    }
	/*~
			    ) > 0
			    THEN 'R' -- restatement
	~*/
		}
	/*~
			    ELSE 'N' -- new statement
			END
		FROM
		    inserted2 v
		LEFT JOIN
		    \"$tie.capsule\".\"$tie.positName\" p
		ON
	~*/
		    while(role = tie.nextRole()) {
	/*~
		    p.$role.columnName = v.$role.columnName
		$(tie.hasMoreRoles())? AND
	~*/
		    }
	/*~
		$(tie.isHistorized())? AND
		    $(tie.isHistorized())? p.$tie.changingColumnName = v.$tie.changingColumnName
		WHERE
			inserted2.ref = v.ref
		AND
		    v.$tie.versionColumnName = \"currentVersion\";

		INSERT INTO \"$tie.capsule\".\"$tie.positName\" (
		    $(tie.isHistorized())? $tie.changingColumnName,
	~*/
		    while(role = tie.nextRole()) {
	/*~
		    $role.columnName$(tie.hasMoreRoles())?,
	~*/
		    }
	/*~
		)
		SELECT
		    $(tie.isHistorized())? $tie.changingColumnName,
	~*/
		    while(role = tie.nextRole()) {
	/*~
		    $role.columnName$(tie.hasMoreRoles())?,
	~*/
		    }
	/*~
		FROM
		    inserted2
		WHERE
		    $tie.versionColumnName = \"currentVersion\"
		AND
		    $tie.statementTypeColumnName in ($statementTypes);

		INSERT INTO \"$tie.capsule\".\"$tie.annexName\" (
		    $(schema.METADATA)? $tie.metadataColumnName,
		    $tie.identityColumnName,
		    $tie.positorColumnName,
		    $tie.positingColumnName,
		    $tie.reliabilityColumnName
		)
		SELECT
		    $(schema.METADATA)? v.$tie.metadataColumnName,
		    p.$tie.identityColumnName,
		    v.$tie.positorColumnName,
		    v.$tie.positingColumnName,
		    v.$tie.reliabilityColumnName
		FROM
		    inserted2 v
		JOIN
		    \"$tie.capsule\".\"$tie.positName\" p
		ON
	~*/
		while(role = tie.nextRole()) {
	/*~
		    p.$role.columnName = v.$role.columnName
		$(tie.hasMoreRoles())? AND
	~*/
		}
	/*~
		$(tie.isHistorized())? AND
		    $(tie.isHistorized())? p.$tie.changingColumnName = v.$tie.changingColumnName
		WHERE
		    v.$tie.versionColumnName = \"currentVersion\"
		AND
		    v.$tie.statementTypeColumnName in ('S',$statementTypes);
		END LOOP;
    DROP TABLE new_$tie.name;
    DROP TABLE inserted2;
	RETURN null;
	END;
	$$BODY$$
    LANGUAGE plpgsql;

-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_$tie.name instead of INSERT trigger on $tie.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"it_$tie.name$_pre\" ON $tie.capsule$.\"$tie.name\";
DROP TRIGGER IF EXISTS \"it_$tie.name\" ON $tie.capsule$.\"$tie.name\";
DROP TRIGGER IF EXISTS \"it_$tie.name$_post\" ON $tie.capsule$.\"$tie.name\";

CREATE TRIGGER \"it_$tie.name$_pre\" BEFORE INSERT ON $tie.capsule$.\"$tie.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $tie.capsule$.\"tri_$tie.name\"('new');
CREATE TRIGGER \"it_$tie.name\" INSTEAD OF INSERT ON $tie.capsule$.\"$tie.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $tie.capsule$.tri_instead('$tie.name', 'new');
CREATE TRIGGER \"it_$tie.name$_post\" AFTER INSERT ON $tie.capsule$.\"$tie.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $tie.capsule$.\"if_$tie.name\"();

~*/
// Here comes the trigger on the latest view, using the trigger above
/*~

-- Insert trigger -----------------------------------------------------------------------------------------------------
-- tri_l$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"tri_l$tie.name\"()
	RETURNS trigger AS 
	$$BODY$$
	DECLARE
        prefix varchar;
    BEGIN
    FOR i IN 0..TG_NARGS-1 LOOP
    prefix := TG_ARGV[i];
    EXECUTE format('CREATE TEMP TABLE %s_l$tie.name (
		$schema.metadata.positorSuffix $schema.metadata.positorRange null,
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
		) ON COMMIT DROP;', prefix);
    END LOOP;
    RETURN null;
    END;
    $$BODY$$
    LANGUAGE plpgsql;

-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"if_l$tie.name\"()
	RETURNS trigger AS 
	$$BODY$$
	DECLARE \"now\" $schema.metadata.chronon;
	BEGIN
	    now := $schema.metadata.now;
	    INSERT INTO \"$tie.capsule\".\"$tie.name\" (
		$(schema.METADATA)? $tie.metadataColumnName,
		$(tie.isHistorized())? $tie.changingColumnName,
	~*/
		while (role = tie.nextRole()) {
	/*~
		$role.columnName,
	~*/
		}
	/*~        
		$tie.positorColumnName,
		$tie.positingColumnName,
		$tie.reliabilityColumnName
	    )
	    SELECT
		$(schema.METADATA)? i.$tie.metadataColumnName,
		$(tie.isHistorized())? i.$tie.changingColumnName,
	~*/
		while (role = tie.nextRole()) {
	/*~
		$(role.knot)? COALESCE(i.$role.columnName, \"$role.name\".$knot.identityColumnName), : i.$role.columnName,
	~*/
		}
	/*~
		i.$tie.positorColumnName,
		i.$tie.positingColumnName,
		i.$tie.reliabilityColumnName
	    FROM
		new_l$tie.name i~*/
		while (role = tie.nextKnotRole()) {
		    knot = role.knot;
	/*~
	    LEFT JOIN
		\"$knot.capsule\".\"$knot.name\" \"$role.name\"
	    ON
		\"$role.name\".$knot.valueColumnName = i.$role.knotValueColumnName~*/
		}
	/*~;
	DROP TABLE new_l$tie.name;
	RETURN null;
	END;
	$$BODY$$
	LANGUAGE plpgsql;

-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"it_l$tie.name$_pre\" ON $tie.capsule$.\"l$tie.name\";
DROP TRIGGER IF EXISTS \"it_l$tie.name\" ON $tie.capsule$.\"l$tie.name\";
DROP TRIGGER IF EXISTS \"it_l$tie.name$_post\" ON $tie.capsule$.\"l$tie.name\";

CREATE TRIGGER \"it_l$tie.name$_pre\" BEFORE INSERT ON $tie.capsule$.\"l$tie.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $tie.capsule$.\"tri_l$tie.name\"('new');
CREATE TRIGGER \"it_l$tie.name\" INSTEAD OF INSERT ON $tie.capsule$.\"l$tie.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $tie.capsule$.tri_instead('l$tie.name', 'new');
CREATE TRIGGER \"it_l$tie.name$_post\" AFTER INSERT ON $tie.capsule$.\"l$tie.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $tie.capsule$.\"if_l$tie.name\"();
~*/
    if(tie.hasMoreValues()) {
/*~




-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$tie.name instead of UPDATE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"uf_l$tie.name\"()
	RETURNS trigger AS 
	$$BODY$$
	DECLARE \"now\" $schema.metadata.chronon;
	BEGIN
	    now := $schema.metadata.now;
	~*/
		if(tie.hasMoreIdentifiers()) {
		    while(role = tie.nextIdentifier()) {
	/*~
	    IF(aergo.HAS_UPDATE('l$tie.name', '$role.columnName'))
			THEN RAISE EXCEPTION 'The identity column $role.columnName is not updatable.';
		END IF;
	~*/
		    }
		}
	/*~
	    INSERT INTO \"$tie.capsule\".\"$tie.name\" (
		$(schema.METADATA)? $tie.metadataColumnName,
		$(tie.isHistorized())? $tie.changingColumnName,
	~*/
		while (role = tie.nextRole()) {
	/*~
		$role.columnName,
	~*/
		}
	/*~
		$tie.positorColumnName,
		$tie.positingColumnName,
		$tie.reliabilityColumnName
	    )
	    SELECT
		$(schema.METADATA)? i.$tie.metadataColumnName,
		$(tie.isHistorized())? cast(CASE WHEN (aergo.HAS_UPDATE('l$tie.name', '$tie.changingColumnName')) THEN i.$tie.changingColumnName ELSE now END as $tie.timeRange),
	~*/
		while (role = tie.nextRole()) {
	/*~
		$(role.knot)? COALESCE(i.$role.columnName, \"$role.name\".$knot.identityColumnName), : i.$role.columnName,
	~*/
		}
	/*~
		CASE WHEN (aergo.HAS_UPDATE('l$tie.name', '$tie.positorColumnName')) THEN i.$tie.positorColumnName ELSE 0 END,
		cast(CASE WHEN (aergo.HAS_UPDATE('l$tie.name', '$tie.positingColumnName')) THEN i.$tie.positingColumnName ELSE now END as $schema.metadata.positingRange),
		CASE 
		    WHEN
	~*/
		while(role = tie.nextValue()) {
	/*~
			i.$role.columnName is null
		    $(tie.hasMoreValues())? OR
	~*/
		}
	/*~
		    THEN $schema.metadata.deleteReliability
		    WHEN (aergo.HAS_UPDATE('l$tie.name', '$tie.reliabilityColumnName')) THEN i.$tie.reliabilityColumnName 
		    WHEN (aergo.HAS_UPDATE('l$tie.name', '$tie.reliableColumnName')) THEN 
			CASE i.$tie.reliableColumnName
			    WHEN 0 THEN $schema.metadata.deleteReliability
			    ELSE $schema.metadata.reliableCutoff
			END                
		    ELSE COALESCE(i.$tie.reliabilityColumnName, $schema.metadata.reliableCutoff)
		END
	    FROM
		new_l$tie.name i~*/
		while (role = tie.nextKnotRole()) {
		    knot = role.knot;
	/*~
	    LEFT JOIN
		\"$knot.capsule\".\"$knot.name\" \"$role.name\"
	    ON
		\"$role.name\".$knot.valueColumnName = i.$role.knotValueColumnName~*/
		}
	/*~;
	DROP TABLE new_l$tie.name;
	DROP TABLE old_l$tie.name;
	RETURN null;
	END;
	$$BODY$$
	LANGUAGE plpgsql;

-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$tie.name instead of UPDATE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"ut_l$tie.name$_pre\" ON $tie.capsule$.\"l$tie.name\";
DROP TRIGGER IF EXISTS \"ut_l$tie.name\" ON $tie.capsule$.\"l$tie.name\";
DROP TRIGGER IF EXISTS \"ut_l$tie.name$_post\" ON $tie.capsule$.\"l$tie.name\";
CREATE TRIGGER \"ut_l$tie.name$_pre\" BEFORE UPDATE ON $tie.capsule$.\"l$tie.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $tie.capsule$.\"tri_l$tie.name\"('new', 'old');
CREATE TRIGGER \"ut_l$tie.name\" INSTEAD OF UPDATE ON $tie.capsule$.\"l$tie.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $tie.capsule$.tri_instead('l$tie.name', 'new', 'old');
CREATE TRIGGER \"ut_l$tie.name$_post\" AFTER UPDATE ON $tie.capsule$.\"l$tie.name\"
    FOR EACH STATEMENT
    EXECUTE PROCEDURE $tie.capsule$.\"uf_l$tie.name\"();
~*/
    }
/*~



-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$tie.name instead of DELETE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule$.\"df_l$tie.name\"()
	RETURNS trigger AS 
	$$BODY$$
	DECLARE \"now\" $schema.metadata.chronon;
	BEGIN
	    now := $schema.metadata.now;
	    INSERT INTO \"$tie.capsule\".\"$tie.annexName\" (
		$(schema.METADATA)? $tie.metadataColumnName,
		$tie.identityColumnName,
		$tie.positorColumnName,
		$tie.positingColumnName,
		$tie.reliabilityColumnName
	    )
	    SELECT
		$(schema.METADATA)? d.$tie.metadataColumnName,
		d.$tie.identityColumnName,
		d.$tie.positorColumnName,
		now,
		$schema.metadata.deleteReliability
	    FROM
		deleted d;
	RETURN null;
	END;
	$$BODY$$
	LANGUAGE plpgsql;

-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$tie.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS \"dt_l$tie.name\" ON $tie.capsule$.\"l$tie.name\";
CREATE TRIGGER \"dt_l$tie.name\" INSTEAD OF DELETE ON $tie.capsule$.\"l$tie.name\"
    FOR EACH ROW
    EXECUTE PROCEDURE $tie.capsule$.\"df_l$tie.name\"();
~*/
}