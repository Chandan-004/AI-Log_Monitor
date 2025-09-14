import * as logQueries from '../queries/log.queries.js';

export const createSystemLog = async ({ message, metadata = {}, severity = 1 }) => {
    // Determine level based on severity
    let level = 'info';
    if (severity >= 7) level = 'critical';
    else if (severity >= 4) level = 'warning';

    return await logQueries.createLog({
        userId: null,  // System-generated log
        message,
        level,
        source: 'SystemLogger',
        metadata
    });
};
