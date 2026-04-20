const mongoose = require('mongoose');
const dns = require('dns');

// Some ISP routers (gpon.net, PTCL, etc.) block MongoDB SRV DNS lookups.
// Force Google/Cloudflare public DNS so Atlas connection strings always resolve.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
