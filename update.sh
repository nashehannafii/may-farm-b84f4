#!/bin/bash

# Menambahkan semua perubahan ke staging area
git add .

# Melakukan commit dengan pesan yang diambil dari argumen pertama
# Tanda kutip di sekitar "$1" penting untuk menangani pesan komit yang mengandung spasi
git commit -m "$1"

# Mendorong perubahan ke branch 'main' di remote 'origin'
git push origin main