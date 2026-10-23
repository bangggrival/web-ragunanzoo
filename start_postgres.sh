#!/bin/bash

echo "Starting PostgreSQL via Docker Compose..."
docker compose up -d postgres

echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 3

echo "PostgreSQL is now running on localhost:5432"
echo "Database: ragunan_zoo"
echo "User: postgres"
echo "Password: postgres"
