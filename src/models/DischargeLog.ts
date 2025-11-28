import mongoose from 'mongoose';

const DischargeLogSchema = new mongoose.Schema({
    doctorEmail: { type: String, required: true },
    patient: {
        id: String,
        name: String,
        age: Number,
        gender: String,
        weight: Number,
    },
    diagnosis: String,
    summary: String,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DischargeLog ||
    mongoose.model('DischargeLog', DischargeLogSchema);
