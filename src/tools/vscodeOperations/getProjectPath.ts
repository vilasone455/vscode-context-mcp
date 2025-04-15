import axios from "axios";
import { PORT } from "../../utils/common.js";

/**
 * Get the current VS Code project path
 * @returns The project path or error message
 */
export async function getProjectPath(): Promise<any> {
    try {
        const port = PORT;
        const res = await axios.get(`http://localhost:${port}/project-path`);
        return res.data;
    } catch (error) {
        console.error("Error fetching VSCode project path:", error);
        return "Error fetching VSCode project path";
    }
}
