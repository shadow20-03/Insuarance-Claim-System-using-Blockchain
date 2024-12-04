// server/server.js

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Claim = require('./models/Claim');
const bcrypt = require('bcrypt'); 
const verifyRoute = require('./routes/verifyRoute');
const ClaimSubmit = require('./models/ClaimSubmit');

// const signupRoute = require('./routes/signupRoute');
const app = express();

// Middleware
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000'  // Adjust if your React app is on a different port
  }));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
// mongoose.connect('mongodb+srv://Cluster50304:rishi271@cluster0.yxvgaib.mongodb.net/insuranceDB?retryWrites=true&w=majority&appName=Cluster0',)
//     .then(() => console.log(Connected to MongoDB successfully))
//     .catch(err => console.error('Could not connect to MongoDB:', err));

mongoose.connect('mongodb+srv://smchincholkar2003:shamdeep@cluster0.nm1of.mongodb.net/insuranceDB?retryWrites=true&w=majority&appName=Cluster0', {
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Use routes
app.use('/api', verifyRoute);
// app.use('/api', signupRoute); 

const JWT_SECRET = 'your_jwt_secret_key';

app.post('/api/signup', async (req, res) => {
  const { userType, name, phone, email, password } = req.body;

  if (!userType || !name || !phone || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userType, name, phone, email, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ success: false, message: `Failed to register user: ${error.message}` });
  }
});


// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email,companyName: user.userType === 'company' ? user.name : null }, JWT_SECRET, { expiresIn: '1h' });

    // res.cookie('token', token, { httpOnly: true }).json({ success: true, message: 'Login successful' });
    res.cookie('token', token, { httpOnly: true }).json({ success: true, message: 'Login successful', token,userType: user.userType,companyName: user.name}); // Add token in response


    // Successful login
    // res.json({ success: true, message: 'Login successful' });
  } 
  catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ success: false, message: `Login failed: ${error.message}` });
  }
});

// const authenticateToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.sendStatus(401); // Unauthorized

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403); // Forbidden
//     req.user = user;
//     next();
//   });
// };

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token, return forbidden
    req.user = user;
    next();
  });
}

app.post('/api/logout', (req, res) => {
  res.clearCookie('token').json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


app.post('/api/claim', authenticateToken, async (req, res) => {
  console.log(req.body); 
  const { insuranceType, companyName, policyNumber } = req.body;
  
  if (!insuranceType || !companyName || !policyNumber) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    const newClaim = new Claim({
      userId: req.user.userId,
      insuranceType,
      companyName,
      policyNumber,
    });

    await newClaim.save();
    res.json({ success: true, message: 'Claim filed successfully' });
  } catch (error) {
    console.error('Error filing claim:', error.message);
    res.status(500).json({ success: false, message: `Failed to file claim: ${error.message}` });
  }
});


app.get('/api/claims', authenticateToken, async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user.userId });
    res.json({ success: true, claims });
  } catch (error) {
    console.error('Error fetching claims:', error.message);
    res.status(500).json({ success: false, message: `Failed to fetch claims: ${error.message}` });
  }
});

app.post('/api/storeClaim', authenticateToken, async (req, res) => {
  const { name, policyNumber, companyName, ipfsLink, supportingDocumentIpfsLink } = req.body;
  if (!name || !policyNumber || !companyName || !ipfsLink || !supportingDocumentIpfsLink) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const newClaimSubmit = new ClaimSubmit({ name, policyNumber, companyName, ipfsLink, supportingDocumentIpfsLink });
    await newClaimSubmit.save();
    res.json({ success: true, message: 'Claim stored successfully' });
  } catch (error) {
    console.error('Error storing claim:', error.message);
    res.status(500).json({ success: false, message: `Failed to store claim: ${error.message}` });
  }
});

app.get('/api/claim-requests', authenticateToken, async (req, res) => {
  // const companyName = req.user.companyName;
  const { companyName } = req.user;

  try {
    const claims = await ClaimSubmit.find({ companyName });
    res.json({ success: true, claims });
  } catch (error) {
    console.error('Error fetching claim requests:', error.message);
    res.status(500).json({ success: false, message: `Failed to fetch claims: ${error.message}` });
  }
});

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_FE1fP2uk3SE1nb",
  key_secret: "wO85D0ZkeKNb6VY6xd0zKOVD",
});

app.post("/api/create-order", async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100, // Amount in paisa
    currency: "INR",
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
});

app.post('/api/update-claim-status', authenticateToken, async (req, res) => {
  const { policyNumber, ClaimStatus } = req.body;
  try {
      const updatedClaim = await Claim.findOneAndUpdate(
          { policyNumber },
          { ClaimStatus },
          { new: true }
      );
      if (updatedClaim) {
          res.json({ success: true, message: "Claim status updated." });
      } else {
          res.status(404).json({ success: false, message: "Claim not found." });
      }
  } catch (error) {
      console.error("Error updating claim status:", error);
      res.status(500).json({ success: false, message: "Failed to update claim status." });
  }
});

app.post('/api/update-claim-status_reject', authenticateToken, async (req, res) => {
  const { policyNumber, ClaimStatus } = req.body;
  try {
      const updatedClaim = await Claim.findOneAndUpdate(
          { policyNumber },
          { ClaimStatus },
          { new: true }
      );
      if (updatedClaim) {
          res.json({ success: true, message: "Claim status updated." });
      } else {
          res.status(404).json({ success: false, message: "Claim not found." });
      }
  } catch (error) {
      console.error("Error updating claim status:", error);
      res.status(500).json({ success: false, message: "Failed to update claim status." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));