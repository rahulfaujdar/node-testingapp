import {API_DB_HOST, API_DB_NAME, API_DB_PASSWORD, API_DB_USERNAME, MONGO_CONNECTION_URL, API_DB_PORT} from "../constants";
import mongoose from "mongoose";
import {createConnection} from "mysql2";

const mongo = "mongodb+srv://test:Password1234@test.wn9hp.mongodb.net/test?retryWrites=true&w=majority";

export const apiDb = createConnection({
    host: API_DB_HOST,
    user: API_DB_USERNAME,
    database: API_DB_NAME,
    password: API_DB_PASSWORD,
    port: API_DB_PORT as number,
    connectTimeout: 300000,
    typeCast: function castField (field, useDefaultTypeCasting ){
        // We only want to cast bit fields that have a single-bit in them. If the field
        // has more than one bit, then we cannot assume it is supposed to be a Boolean.
        if ( ( field.type === "BIT" ) && ( field.length === 1 ) ){
            const bytes = field.buffer();
            // A Buffer in Node represents a collection of 8-bit unsigned integers.
            // Therefore, our single "bit field" comes back as the bits '0000 0001',
            // which is equivalent to the number 1.
            return( bytes[ 0 ] === 1 );
        }

        return( useDefaultTypeCasting() );
    }
}).promise();

export const connectTestDb = () => mongoose.connect(mongo, {
    useCreateIndex: true,
    useUnifiedTopology: true
});

