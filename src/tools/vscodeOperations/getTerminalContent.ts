import axios from "axios";
import { PORT } from "../../utils/common.js";

/**
 * Get content of the VS Code terminal
 * @returns The terminal content or error message
 */
export async function getTerminalContent(): Promise<any> {
    try {
        const port = PORT;
        const res = await axios.get(`http://localhost:${port}/terminal-content`);
        return res.data;
    } catch (error) {
        console.error("Error fetching terminal content:", error);
        return "Error fetching terminal content";
    }
}
