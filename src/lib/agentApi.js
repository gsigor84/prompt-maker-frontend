/**
 * Calls the Agentic Pipeline V2 API.
 * 
 * @param {string} task - The user's task description.
 * @param {string} [model="gpt-4o-mini"] - The model to use.
 * @param {boolean} [interactiveMode=false] - Whether to use interactive mode.
 * @param {Object} [answers=null] - Optional answers to a previous interruption.
 * @returns {Promise<Object>} The response containing final_prompt, execution_trace, and/or questions.
 */
export async function runAgentPipeline(task, model = "gpt-4o-mini", interactiveMode = false, answers = null) {
    // Switch fallback to production
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://prompt-maker-backend.fly.dev";

    // ... (rest of the code remains the same)
    try {
        const response = await fetch(`${API_URL}/api/v2/agent/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task, model, interactive_mode: interactiveMode, answers }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Agent Pipeline failed:", error);
        throw error;
    }
}

/**
 * Calls the Thinking Partner Analyze API.
 */
export async function analyzeThinking(task) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://prompt-maker-backend.fly.dev";

    try {
        const response = await fetch(`${API_URL}/api/v2/thinking-partner/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: task }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Stringify the error detail if it's an object/array (FastAPI Validation errors are lists)
            const errorMessage = typeof errorData.detail === 'object'
                ? JSON.stringify(errorData.detail)
                : (errorData.detail || `API Error: ${response.status}`);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Thinking Partner failed:", error);
        throw error;
    }
}
