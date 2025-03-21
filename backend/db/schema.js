const mongoose = require("mongoose");

const PlatformSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  url: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  logoUrl: { type: String, required: true },
  api_url: { type: String, required: true },
  parsing_strategy: { type: String, enum:["api", "scraping"],default:"api"},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const contestSchema = new mongoose.Schema({
  platform: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Platform', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'finished'],
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  solution: {
    type: String,
    default: ""
  }
});

contestSchema.index({ platform: 1, startDate: 1 });
contestSchema.index({ platform: 1, status: 1 });

const Platform = mongoose.model("Platform", PlatformSchema);
const Contest = mongoose.model("Contest", contestSchema);

module.exports = { Platform, Contest };
