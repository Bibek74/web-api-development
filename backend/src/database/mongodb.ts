import { DBconnection } from "../../db/db";

const connectDatabase = async () => {
    await DBconnection();
};

export default connectDatabase;