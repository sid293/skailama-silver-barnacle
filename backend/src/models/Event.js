const mongoose = require('mongoose');
const { convertToTimezone } = require('../utils/timezone');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
const changeLogSchema = new mongoose.Schema(
    {
        fields: [{ type: String }],
        changedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

dayjs.extend(timezone);

const eventSchema = new mongoose.Schema(
    {
        profiles: {
            type: [String],
            required: [true, 'At least one profile is required'],
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: 'Profiles array cannot be empty'
            }
        },
        timezone: {
            type: String,
            required: [true, 'Timezone is required'],
            default: 'UTC',
            trim: true,
            validate: {
                validator: function (v) {
                    try {
                        dayjs.tz('2024-01-01', v);
                        return true;
                    } catch (error) {
                        return false;
                    }
                },
                message: props => `${props.value} is not a valid timezone. Use IANA timezone names like 'UTC', 'Asia/Kolkata', 'America/New_York'`
            }
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
            validate: {
                validator: function (v) {
                    return v >= this.startDate;
                },
                message: 'End date must be after or equal to start date'
            }
        },
        changeLog: { type: [changeLogSchema], default: [] }
    },
    {
        timestamps: true
    }
);

eventSchema.index({ profiles: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ updatedAt: -1 });

eventSchema.virtual('startDateInTimezone').get(function () {
    return convertToTimezone(this.startDate, this.timezone);
});

eventSchema.virtual('endDateInTimezone').get(function () {
    return convertToTimezone(this.endDate, this.timezone);
});

eventSchema.pre('save', function (next) {
    if (!this.isNew) {
        const modified = this.modifiedPaths();
        const ignore = ['updatedAt', '__v', 'changeLog'];
        const changedFields = modified.filter(p => !ignore.includes(p));
        if (changedFields.length) {
            this.changeLog.push({ fields: changedFields });
        }
    }
    next();
});

eventSchema.methods.toTimezone = function (tz) {
    const targetTz = tz || this.timezone;
    return {
        _id: this._id,
        profiles: this.profiles,
        timezone: this.timezone,
        startDate: convertToTimezone(this.startDate, targetTz),
        endDate: convertToTimezone(this.endDate, targetTz),
        displayTimezone: targetTz,
        createdAt: convertToTimezone(this.createdAt, targetTz),
        updatedAt: convertToTimezone(this.updatedAt, targetTz),
        changeLog: this.changeLog
    };
};

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
