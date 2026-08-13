import colors from "colors";
const {
  NODE_ENV,
  PORT
} = process.env;

// Determine Frontend URL based on environment
const FrontendURL =  (NODE_ENV === 'PRODUCTION' 
    ? process.env.FRONTEND_LIVE_URI
    : 'http://localhost:5173');

class AppError extends Error {
  constructor(message, statusCode = 400, isSystemError = false) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isSystemError = isSystemError; // false = app error, true = system error
    this.isOperational = true; // Mark as operational error
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}


const serverUrl = NODE_ENV === 'PRODUCTION' ? process.env.SERVER_URL || "https://busypilot-bot-server.up.railway.app" : `http://localhost:${PORT}`;



const logger = (req, res, next) => {
  const { method, url } = req;
  const host = req.get('host');
  req.domain = FrontendURL;
  req.serverUrl = serverUrl;
  req.AppError = AppError;
  req.originalRequestPath = req.path;
  console.log(colors.cyan(`\n\na host ${host}, Sent ${method} Request To ${url}\n\n`));
  console.log(colors.yellow(req.body));
  next();
}

const log = (message, color = "good") => {
  switch (color) {
    case "good":
      console.log(`\n ${colors.green(message)} \n`);
      break;
    case "bad":
      console.log(`\n ${colors.red(message)} \n`);
      break;
    case "warning":
      console.log(`\n ${colors.yellow(message)} \n`);
      break;
    default:
      console.log(`\n ${message} \n`);
  }
}




export {
  log,
  logger,
  FrontendURL,
  serverUrl,
  AppError
}
