import axios from "axios";
import { PORT } from "../../utils/common.js";

/**
 * Get details of the currently active file in VS Code
 * @returns The current file details or error message
 */
export async function getCurrentFile(): Promise<any> {
    try {
        const port = PORT;
        const res = await axios.get(`http://localhost:${port}/current-file`);
        return res.data;
    } catch (error) {
        console.error("Error fetching current file details:", error);
        return "Error fetching current file details";
    }
}
