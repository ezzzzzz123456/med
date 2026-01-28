const User = require('../models/User');

exports.findBestDonors = async (req, res) => {
  const { latitude, longitude, requiredBloodGroup } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, msg: "Missing GPS coordinates" });
  }

  try {
    // 90 days ago (Standard Blood Donation Cooldown period)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          distanceField: "distance",
          maxDistance: 5000, // 5,000 meters = 5km
          spherical: true,
          query: { 
            role: 'user', 
            bloodGroup: requiredBloodGroup,
            // EXCLUDE UNFIT DONORS:
            "healthDetails.hadRecentInfection": false,
            "healthDetails.hasChronicIllness": false,
            // Ensure they haven't donated in the last 90 days
            $or: [
              { "healthDetails.lastDonationDate": null },
              { "healthDetails.lastDonationDate": { $lt: ninetyDaysAgo } }
            ]
          }
        }
      },
      { $limit: 15 }, // Only fetch top 15 closest
      { $sort: { distance: 1 } },
      {
        $project: {
          name: 1,
          email: 1,
          bloodGroup: 1,
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 1] }, // Round to 1 decimal
          "healthDetails.age": 1
        }
      }
    ];

    const donors = await User.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: donors.length,
      donors: donors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Server Error during geo-query" });
  }
};