"""
FastAPI Backend for DualMind Orchestrator
Provides a REST API for the React frontend
"""

import os
import logging
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Import the orchestrator and tools
from orchestrator import create_orchestrator
from tools.pdf_parser import pdf_parser_tool
from synthesizer import synthesize_answer, create_executive_summary

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="DualMind API",
    description="API for DualMind Orchestrator",
    version="1.0.0"
)

# CORS middleware
origins = [
    "http://localhost:3000",  # Default React port
    "http://localhost:5173",  # Vite default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
orchestrator = create_orchestrator()

# Models
class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class ToolResult(BaseModel):
    name: str
    result: Any

# API Endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "DualMind API is running"}

@app.post("/api/query")
async def process_query(request: QueryRequest):
    """Process a user query through the orchestrator"""
    try:
        # Process the query using the orchestrator
        result = orchestrator.process_query(
            user_query=request.query,
            max_iterations=3  # Default value, can be made configurable
        )
        
        # Extract execution results and plan from the orchestrator's result
        execution_results = result.get('execution_results', [])
        plan = result.get('plan', {})
        
        # Synthesize the final answer
        final_answer = synthesize_answer(
            user_query=request.query,
            execution_results=execution_results,
            plan=plan
        )
        
        # Create executive summary
        summary = create_executive_summary(
            user_query=request.query,
            execution_results=execution_results
        )
        
        return {
            "status": "success",
            "query": request.query,
            "plan": result.get("plan", []),
            "execution_results": result.get("execution_results", []),
            "final_answer": final_answer,
            "summary": summary,
            "context": result.get("context", {})
        }
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    """Parse a PDF file and return its text content"""
    try:
        # Save the uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Parse the PDF
        result = pdf_parser_tool(temp_file_path)
        
        # Clean up the temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        return {
            "status": "success",
            "filename": file.filename,
            "content": result
        }
        
    except Exception as e:
        logger.error(f"Error parsing PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools")
async def list_tools():
    """List all available tools"""
    try:
        # Get the list of available tools from the orchestrator
        tools = []
        if hasattr(orchestrator, 'tools'):
            tools = [{"name": name, "description": str(tool)} 
                    for name, tool in orchestrator.tools.items()]
        
        return {
            "status": "success",
            "tools": tools
        }
    except Exception as e:
        logger.error(f"Error listing tools: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Create necessary directories
os.makedirs("output", exist_ok=True)

# Mount static files directory for generated content
app.mount("/static", StaticFiles(directory="output"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
