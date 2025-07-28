# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const PORT = 5000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
// SQL Server config
const dbConfig = {
  user: "ANDON",
  password: "Tml@1278",
  server: "172.25.166.224",          // e.g., 'localhost' or '192.168.1.100'
  database: "Planthead",
  options: {
    encrypt: false,                 // Set to true for Azure or if required
    trustServerCertificate: false  // Set to true for local dev with self-signed cert
  }
};

// Dummy PLC-like environment data
const dummyData = {
  AREA1: {
    AREA1_TEMPERATURE: 24.5,
    AREA1_HUMIDITY: 60,
    AREA1_STATUS: 0,
  },
  AREA2: {
    AREA2_TEMPERATURE: 30.2,
    AREA2_HUMIDITY: 45,
    AREA2_STATUS: 1,
  },
  AREA3: {
    AREA3_TEMPERATURE: 22.8,
    AREA3_HUMIDITY: 55,
  },
};

// API: /api/plc-data
app.get("/api/plc-data", (req, res) => {
  res.json(dummyData);
});

// API: /api/area-groups (Fetch from MSSQL DB)
app.get("/api/area-groups", async (req, res) => {
  try {
    // Connect to the DB
    await sql.connect(dbConfig);

    // Run query
    const result = await sql.query(`
      SELECT area_key, major_area, display_name FROM area_groups
    `);

    // Format response
    const data = {};
    result.recordset.forEach((row) => {
      data[row.area_key] = {
        major_area: row.major_area,
        display_name: row.display_name,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("MSSQL Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Mock PLC API server running at http://localhost:${PORT}`);
});
