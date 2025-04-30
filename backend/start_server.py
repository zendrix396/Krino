import uvicorn

if __name__ == "__main__":
    # Run with reload=True for development, host="0.0.0.0" to allow external connections
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info",
        access_log=True,
        workers=1
    ) 