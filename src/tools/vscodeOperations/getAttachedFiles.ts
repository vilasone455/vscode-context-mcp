import axios from "axios";
import { PORT } from "../../utils/common.js";

export async function getAttachedFiles(): Promise<any> {
    try {
        const port = PORT;
        const res = await axios.get(`http://localhost:${port}/get-file-list-and-clear`);
        return res.data;
    } catch (error) {
        console.error("Error fetching attached files:", error);
        return "Error fetching attached files";
    }
}