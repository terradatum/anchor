/**********************************************************************
** HelpersOverride.js
**
** Description: Overrides to the default helpers - this allows us to
**              set some sane defaults that will work for most DBMSs,
**              and override them on a database-specific basis
** Author/Date/Modification:
**              2014-11-10      Nathan Clayton
**                Initial file creation - added override for end of
**                time
**********************************************************************/

// PostgreSQL has the concept of -infinity and infinity, which are always
// greater or less than (respectively) all normal timestamps/dates/times
schema.EOT = '\'infinity\'::timestamptz'; //End Of Time
