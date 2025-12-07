const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { convertToUTC } = require('../utils/timezone');

router.post('/', async (req, res) => {
    try {
        const { profiles, timezone, startDate, endDate } = req.body;

        if (!profiles || !timezone || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'All fields (profiles, timezone, startDate, endDate) are required'
            });
        }

        const startDateUTC = convertToUTC(startDate, timezone);
        const endDateUTC = convertToUTC(endDate, timezone);

        const event = new Event({
            profiles,
            timezone,
            startDate: startDateUTC,
            endDate: endDateUTC
        });

        await event.save();

        res.status(201).json({
            success: true,
            data: event.toTimezone()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { timezone, profile } = req.query;

        const filter = {};
        if (profile) {
            filter.profiles = profile;
        }

        const events = await Event.find(filter).sort({ createdAt: -1 });

        const eventsWithTimezone = events.map(event =>
            event.toTimezone(timezone)
        );

        res.status(200).json({
            success: true,
            count: events.length,
            data: eventsWithTimezone
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { timezone } = req.query;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event.toTimezone(timezone)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { profiles, timezone, startDate, endDate } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        if (profiles) event.profiles = profiles;

        const targetTimezone = timezone || event.timezone;

        if (timezone) event.timezone = timezone;

        if (startDate) {
            const newStart = convertToUTC(startDate, targetTimezone);
            if (!event.startDate || newStart.getTime() !== event.startDate.getTime()) {
                event.startDate = newStart;
            }
        }
        if (endDate) {
            const newEnd = convertToUTC(endDate, targetTimezone);
            if (!event.endDate || newEnd.getTime() !== event.endDate.getTime()) {
                event.endDate = newEnd;
            }
        }

        await event.save();

        res.status(200).json({
            success: true,
            data: event.toTimezone()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
