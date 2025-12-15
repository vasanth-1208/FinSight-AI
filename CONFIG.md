# Configuration Guide

## Database Configuration

The application uses MongoDB for data storage. To configure your database connection:

### Option 1: Environment Variables (Recommended)

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=your_app
DB_NAME=alphacoders_bank
PORT=3000
```

Then install dotenv:
```bash
npm install dotenv
```

And update `server.js` to load environment variables:
```javascript
require('dotenv').config();
```

### Option 2: Direct Configuration

Update the MongoDB connection string in `server.js`:

```javascript
const MONGODB_URI = 'your_mongodb_connection_string';
const DB_NAME = 'alphacoders_bank';
```

## Sample Test Numbers

Use these numbers for testing different scenarios:

- **9876543210** - Instant Approval
- **9123456780** - Salary Slip Required (Low Credit)
- **7654321098** - Salary Slip Required (High Amount)
- **9679012345** - Rejection (Low Credit Score)
- **8765432109** - Rejection (Amount > 2× Limit)

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Configure your database (see above)

3. Start the server:
```bash
npm start
```

4. Open your browser:
```
http://localhost:3000
```

