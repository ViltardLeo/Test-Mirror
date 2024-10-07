const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const { body, validationResult, matchedData } = require('express-validator');
const { encodeToken } = require('../utils/token');

const app = express();
app.use(express.json());

app.post(
    '/login',
    body('email').isEmail(),
    async (req, res, next) => {
      const { email } = matchedData(req);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const token = encodeToken({
        email,
        timestamp: new Date().toISOString(),
      });
      // use next
      next();
      return res.status(200).json({ token });
    },
);

exports.api = app;