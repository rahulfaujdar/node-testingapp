export const {
    HOST,
    PORT,
    API_DB_HOST,
    API_DB_PORT = 3306,
    API_DB_NAME,
    API_DB_USERNAME,
    API_DB_PASSWORD,
    MONGO_CONNECTION_URL,
    scheduleTime
} = process.env;

/*Token Types*/
export const LOGIN_TOKEN = "login";
export const RESET_PASSWORD_TOKEN = "reset-password";
export const TFA_TOKEN = "two-factor-authentication";
/*Token Types*/
