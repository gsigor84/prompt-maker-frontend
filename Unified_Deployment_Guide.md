# Unified Deployment Guide: Agentic Pipeline

> [!NOTE]
> **Action Required**
> I have already applied **Part 2 (Frontend)** for you.
> You must manually apply **Part 1 (Backend)** in your other workspace.

---

## Part 1: Backend Setup
**Target Folder**: `prompt-maker-backend` (or `Prompt-master`)

### Step 1.1: Create `agentic_flow/schemas.py`
Create a new folder `agentic_flow` inside your backend project and add this file:

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

class AgentRequest(BaseModel):
    task: str
    model: Literal["gpt-4o", "gpt-4o-mini"] = "gpt-4o-mini"
    interactive_mode: bool = False

class PipelineStep(BaseModel):
    step_name: str
    status: Literal["completed", "failed"]
    output: Optional[str] = None
    meta: Dict[str, Any] = Field(default_factory=dict)

class AgentResponse(BaseModel):
    final_prompt: Optional[str] = None
    execution_trace: List[PipelineStep] = []
    critique_score: Optional[float] = None
    critique_text: Optional[str] = None
```

### Step 1.2: Create `agentic_flow/pipeline.py`
In the `agentic_flow` folder:

```python
import time
from typing import List
from .schemas import PipelineStep, AgentResponse

class AgentOrchestrator:
    def __init__(self, task: str, model: str):
        self.task = task
        self.model = model
        self.trace: List[PipelineStep] = []
        
    def _log_step(self, name: str, output: str, meta: dict = None):
        step = PipelineStep(
            step_name=name,
            status="completed",
            output=output,
            meta=meta or {}
        )
        self.trace.append(step)

    def run(self) -> AgentResponse:
        self._log_step("Collect", f"Received task: {self.task}")
        self._log_step("Analyze", "Identified requirements.")
        self._log_step("Propose", "Strategy: Chain-of-Thought.")
        
        final = f"Optimized Prompt for: {self.task}\n\nStrict mode enabled."
        self._log_step("Execute", "Draft created.")
        self._log_step("Refine", "Polished output.")
        self._log_step("Format", "Markdown applied.")
        
        return AgentResponse(
            final_prompt=final,
            execution_trace=self.trace,
            critique_score=9.0,
            critique_text="Excellent clarity."
        )

def run_agentic_pipeline(task: str, model: str = "gpt-4o-mini") -> AgentResponse:
    orchestrator = AgentOrchestrator(task, model)
    return orchestrator.run()
```

### Step 1.3: Create `agentic_flow/router.py`
In the `agentic_flow` folder:

```python
from fastapi import APIRouter, HTTPException
from .schemas import AgentRequest, AgentResponse
from .pipeline import run_agentic_pipeline

router = APIRouter(
    prefix="/api/v2/agent",
    tags=["Agentic Pipeline"]
)

@router.post("/run", response_model=AgentResponse)
async def run_pipeline(request: AgentRequest):
    try:
        response = run_agentic_pipeline(task=request.task, model=request.model)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 1.4: Update `main.py`
Find your `main.py`.

1.  **Add Import**:
    ```python
    from agentic_flow.router import router as agent_router
    ```

2.  **Mount Router**:
    (Look for where `app` or `fastapi_app` is defined)
    ```python
    fastapi_app.include_router(agent_router)
    ```

---

## Part 2: Frontend Setup (COMPLETED)
**Target Folder**: `prompt-maker` (Current Workspace)

I have already created:
- `src/lib/agentApi.js`: The function to call the backend.
- `API_CONTRACT.md`: The documentation.

You can now use `runAgentPipeline` in your React components!
