import axios from "axios";
import { PORT } from "../../utils/common.js";

/**
 * Get diagnostic problems (errors/warnings) in the workspace
 * @returns The problems list or error message
 */
export async function getProblems(): Promise<any> {
    try {
        const port = PORT;
        const res = await axios.get(`http://localhost:${port}/problems`);
        return res.data;
    } catch (error) {
        console.error("Error fetching workspace problems:", error);
        return "Error fetching workspace problems";
    }
}
