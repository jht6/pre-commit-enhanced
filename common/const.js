const FOREACH_COMMAND_PARAM = '<filepath>';

module.exports = () => ({
    FOREACH_COMMAND_KEY: 'pce-foreach-command',
    FOREACH_COMMAND_TPL: `command-name ${FOREACH_COMMAND_PARAM}`,
    FOREACH_COMMAND_PARAM,
    LOG_PREFIX: 'pre-commit:'
});
