FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY ml/server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and server
COPY ml/models/onnx ./models/onnx
COPY ml/server/inference_server.py .

# Expose port
EXPOSE 8000

# Run server
CMD ["uvicorn", "inference_server:app", "--host", "0.0.0.0", "--port", "8000"]
