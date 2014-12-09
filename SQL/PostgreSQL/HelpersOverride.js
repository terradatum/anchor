/**********************************************************************
** HelpersOverride.js
**
** Description: Overrides to the default helpers - this allows us to
**              set some sane defaults that will work for most DBMSs,
**              and override them on a database-specific basis
** Author/Date/Modification:
**              2014-12-08      Julie Morahan
**                  Added schema.checksumType, schema.reliableColumnType
**                  and schema.setIdentityGenerator()
**              2014-11-10      Nathan Clayton
**                Initial file creation - added override for end of
**                time
**********************************************************************/

// PostgreSQL has the concept of -infinity and infinity, which are always
// greater or less than (respectively) all normal timestamps/dates/times
schema.EOT = '\'infinity\'::timestamptz'; //End Of Time

// Add hardcoded data types to make them easy to change if we need to in the future
schema.checksumType = 'varbinary(16)'
schema.reliableColumnType = 'smallint'

// Custom function to determine valid postgres identity types
schema.setIdentityGenerator = function(entity) {
	switch (entity.identity) {
        case 'smallint': entity.identityGenerator = 'smallserial'; break;
        case 'bigint': entity.identityGenerator = 'bigserial'; break;
        default: entity.identityGenerator = 'serial'; break;
    }
};
