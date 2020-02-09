if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `${(process.env.NODE_ENV || 'development').toLowerCase()}.variables.env` });
} else {
  require('dotenv');
}

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.express.use(cookieParser());
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }

  next();
});
server.express.use(async (req, res, next) => {
  const { userId } = req;
  if (!userId) return next();

  const user = await db.query.user(
    { where: { id: userId } },
    `
      {
        id,
        name,
        email,
        permissions
        cart {
          id
          quantity
          item {
            id
            title
            price
            image
            largeImage
            description
          }
        }
      }
    `,
  );

  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
  },
);
