const express=require("express");
const router=express.Router();
const {Contest,Platform}=require("./db/schema.js");



router.get("/",async(req,res)=>{
    try{
        const { status, platform, limit = 50, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        
        // Build query based on filters
        const query = {};
        if(status){query.status=status;}
        if(platform){query.platform=platform;}
        
        const contests = await Contest.find(query)
        .populate('platform', 'name url logoUrl')
        .sort({ startTime: 1 }) // Sort by start time
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Contest.countDocuments(query);
    
        res.json({
          contests,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ error: 'Failed to fetch contests' });
      }
})

router.get('/platforms', async (req, res) => {
    try {
      const platforms = await Platform.find({ enabled: true }, 'name url logoUrl');
      res.json(platforms);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      res.status(500).json({ error: 'Failed to fetch platforms' });
    }
  });
  
  // Get contest by ID
  router.get('/:id', async (req, res) => {
    try {
      const contest = await Contest.findById(req.params.id)
        .populate('platform', 'name url logoUrl');
      
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }
      
      res.json(contest);
    } catch (error) {
      console.error('Error fetching contest:', error);
      res.status(500).json({ error: 'Failed to fetch contest' });
    }
  });
  
  router.get("/platform/:platform", async (req, res) => {
    try {
        // First find the platform document by name
        const platformDoc = await Platform.findOne({ name: req.params.platform });
        
        if (!platformDoc) {
            return res.status(404).json({
                success: false,
                error: "Platform not found"
            });
        }

        // Then find contests using the platform's ObjectId
        const contests = await Contest.find({ platform: platformDoc._id })
            .populate('platform')  // This will populate platform details
            .sort({ startDate: 1 });  // Sort by start date ascending

        res.json({
            success: true,
            contests
        });
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch contests"
        });
    }
  });
  
  module.exports = router;
  