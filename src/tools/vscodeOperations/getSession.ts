import axios from "axios";
import { PORT } from "../../utils/common.js";

export async function getVsCodeSession(): Promise<any> {
    try {
        let port = PORT
        let res = await axios.get("http://localhost:" + port + "/session-context")
        let data = res.data
        return data
    } catch (error) {
        console.error("Error fetching VSCode session:", error);
        return "Error fetching VSCode session";
    }
}
