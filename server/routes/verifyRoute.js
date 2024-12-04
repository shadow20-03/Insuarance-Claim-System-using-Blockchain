const express = require("express");
const router = express.Router();
const {
  VehicleInsurance,
  HealthInsurance,
  LifeInsurance,
  TravelInsurance
} = require("../models/InsuranceModel");

// router.post('/verify-user', async (req, res) => {
//     const { name, phoneNumber, insuranceCompany } = req.body;
//     console.log(`Request received with data:`, { name, phoneNumber, insuranceCompany });

//     let InsuranceModel;
//     switch (insuranceType.toLowerCase()) {
//         case 'vehicle':
//             InsuranceModel = VehicleInsurance;
//             break;
//         case 'health':
//             InsuranceModel = HealthInsurance;
//             break;
//         case 'life':
//             InsuranceModel = LifeInsurance;
//             break;
//         case 'travel':
//             InsuranceModel = TravelInsurance;
//             break;
//         default:
//             return res.status(400).json({ success: false, message: 'Invalid insurance type provided.' });
//     }

//     try {
//         const user = await InsuranceModel.findOne({
//             name,
//             phoneNumber,
//             insuranceCompany
//         });
//         console.log(`Database query result:`, user);

//         if (user) {
//             res.json({ success: true, message: `${insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)} insurance in ${user.insuranceCompany} for Mr. ${user.name} exists.` });
//         } else {
//             res.json({ success: false, message: 'User not found.' });
//         }
//     } catch (error) {
//         console.error('Error querying the database:', error);
//         res.status(500).json({ success: false, message: 'Server error.' });
//     }
// });

router.post("/verify-user", async (req, res) => {
  const {
    name,
    phoneNumber,
    insuranceCompany,
    insurancePolicyid,
    insuranceType
  } = req.body;

  try {
    let InsuranceModel;

    // Check which insurance type is being verified
    switch (insuranceType.toLowerCase()) {
      case "vehicle":
        InsuranceModel = VehicleInsurance;
        break;
      case "health":
        InsuranceModel = HealthInsurance;
        break;
      case "life":
        InsuranceModel = LifeInsurance;
        break;
      case "travel":
        InsuranceModel = TravelInsurance;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid insurance type." });
    }

    // Query the corresponding collection
    const user = await InsuranceModel.findOne({
      name,
      phoneNumber,
      insuranceCompany,
      insurancePolicyid
    });

    if (user) {
      res.json({
        success: true,
        message: `${
          insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)
        } insurance in ${user.insuranceCompany} for Mr./Ms. ${
          user.name
        } exists.`,
      });
    } else {
      res.json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const {
//   VehicleInsurance,
//   HealthInsurance,
//   LifeInsurance,
//   TravelInsurance,
// } = require("../models/InsuranceModel");

// router.post("/verify-user", async (req, res) => {
//   const {
//     name,
//     phoneNumber,
//     insuranceCompany,
//     insurancePolicyid,
//     insuranceType,
//   } = req.body;

//   try {
//     let InsuranceModel;

//     // Check which insurance type is being verified
//     switch (insuranceType.toLowerCase()) {
//       case "vehicle":
//         InsuranceModel = VehicleInsurance;
//         break;
//       case "health":
//         InsuranceModel = HealthInsurance; // This should be the model matching your collection name
//         break;
//       case "life":
//         InsuranceModel = LifeInsurance;
//         break;
//       case "travel":
//         InsuranceModel = TravelInsurance;
//         break;
//       default:
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid insurance type." });
//     }

//     // Query the corresponding collection
//     const user = await InsuranceModel.findOne({
//       name: { $regex: new RegExp(name, "i") }, // Case-insensitive match for name
//       phoneNumber,
//       insuranceCompany: { $regex: new RegExp(insuranceCompany, "i") }, // Case-insensitive match for insuranceCompany
//       insurancePolicyid,
//     });

//     if (user) {
//       res.json({
//         success: true,
//         message: `${
//           insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)
//         } insurance in ${user.insuranceCompany} for Mr./Ms. ${
//           user.name
//         } exists.`,
//       });
//     } else {
//       res.json({ success: false, message: "User not found." });
//     }
//   } catch (error) {
//     console.error("Error querying the database:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });

// module.exports = router;
