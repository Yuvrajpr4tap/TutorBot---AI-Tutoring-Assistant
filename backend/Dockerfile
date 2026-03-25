FROM python:3.10-slim# Python dependencies





















CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]# Run Flask appEXPOSE 5000# Expose portCOPY . .# Copy applicationRUN pip install --no-cache-dir -r requirements.txtCOPY requirements.txt .# Copy requirements first for better caching    && rm -rf /var/lib/apt/lists/*    gcc \RUN apt-get update && apt-get install -y \# Install system dependenciesWORKDIR /appFlask==2.3.3
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
