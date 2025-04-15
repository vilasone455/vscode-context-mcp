import axios from "axios";
import { PORT } from "../../utils/common.js";

/**
 * Get a list of all open tabs/editors in VS Code
 * @returns The list of open tabs or error message
 */
export async function getOpenTabs(): Promise<any> {
    try {
        const port = PORT;
        const res = await axios.get(`http://localhost:${port}/open-tabs`);
        return res.data;
    } catch (error) {
        console.error("Error fetching open tabs:", error);
        return "Error fetching open tabs";
    }
}
