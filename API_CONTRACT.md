# Agentic Pipeline API Contract

## Endpoint
**POST** `http://localhost:8000/api/v2/agent/run`

## Request Payload (JSON)
The frontend must send a JSON object with this structure:

```json
{
  "task": "Write a python script to scrape data",
  "model": "gpt-4o-mini",
  "interactive_mode": false
}
```

- **task** (string, required): The user's input prompt.
- **model** (string, optional): One of "gpt-4o", "gpt-4o-mini", "claude-3-opus". Default: "gpt-4o-mini".
- **interactive_mode** (boolean, optional): Default `false`.

## Response Payload (JSON)
The backend responds with:

```json
{
  "final_prompt": "ACT AS a generic scraper...",
  "execution_trace": [
    {
      "step_name": "Collect",
      "status": "completed",
      "output": "Received task...",
      "meta": {}
    },
    {
      "step_name": "Propose",
      "status": "completed",
      "output": "Strategy: Expert Persona",
      "meta": {}
    }
  ],
  "critique_score": 8.5,
  "critique_text": "Good coverage of requirements."
}
```
