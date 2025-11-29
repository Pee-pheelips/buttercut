# backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py

# frontend
cd frontend
npm install
npx expo start