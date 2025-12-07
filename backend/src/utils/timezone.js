const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const convertToTimezone = (date, tz) => {
    if (!date) return null;
    return dayjs(date).tz(tz).format();
};

const convertToUTC = (dateString, tz) => {
    if (!dateString) return null;
    return dayjs.tz(dateString, tz).utc().toDate();
};

const formatInTimezone = (date, tz, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return null;
    return dayjs(date).tz(tz).format(format);
};

const isValidTimezone = (tz) => {
    try {
        dayjs.tz.setDefault(tz);
        dayjs.tz.setDefault();
        return true;
    } catch (error) {
        return false;
    }
};

const getCurrentTimeInTimezone = (tz) => {
    return dayjs().tz(tz).format();
};

module.exports = {
    convertToTimezone,
    convertToUTC,
};
