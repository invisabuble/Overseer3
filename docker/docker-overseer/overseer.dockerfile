FROM python:3.10-slim

COPY ./docker-overseer/requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

CMD ["python", "/Overseer/Overseer.py"]