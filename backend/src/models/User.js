const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
            unique: true,
            minlength: [1, 'Name must be at least 1 character long'],
            maxlength: [100, 'Name cannot exceed 100 characters']
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
