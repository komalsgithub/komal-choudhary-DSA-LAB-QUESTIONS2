# --- START OF ALL-IN-ONE CODE ---

# 1. INSTALL PYSPARK (Wait for this to finish!)
!pip install pyspark -q

# 2. SETUP & CREATE DUMMY FILES
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when
from pyspark.sql.types import IntegerType, DoubleType
import csv
import json
import os

spark = SparkSession.builder.appName("SimpleClimate").getOrCreate()

# Create Temperature CSV
with open('temperature.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows([["station_id","timestamp","temperature_c"], ["S001","2023-11-01","25.5"], ["S002","2023-11-01","22.0"]])

# Create Air Quality JSON
with open('air_quality.json', 'w') as f:
    json.dump([
        {"station_id": "S001", "timestamp": "2023-11-01", "aqi": 155, "co2": 410},
        {"station_id": "S002", "timestamp": "2023-11-01", "aqi": 45, "co2": 380}
    ], f)

# Create City Master CSV (Location Info)
with open('city_info.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows([["station_id","city","lat","long"], ["S001","Delhi","28.7","77.1"], ["S002","Bagrote","36.0","74.0"]])

# 3. PROCESS DATA (The Pipeline)
# Load
df_temp = spark.read.option("header","true").csv("temperature.csv")
df_aqi = spark.read.option("multiline","true").json("air_quality.json")
df_city = spark.read.option("header","true").csv("city_info.csv")

# Join (Merge Temp + AQI + City)
df_merged = df_temp.join(df_aqi, on=["station_id", "timestamp"], how="inner")
df_final = df_merged.join(df_city, on="station_id", how="left")

# Transform (Fix numbers)
df_final = df_final.withColumn("aqi", col("aqi").cast(IntegerType())) \
                   .withColumn("temperature_c", col("temperature_c").cast(DoubleType()))

# 4. SAVE RESULT
# This saves the clean data to a folder
df_final.coalesce(1).write.mode("overwrite").option("header","true").csv("FINAL_OUTPUT")

print("✅ SUCCESS! Your data is ready to download.")

# --- END OF CODE ---


# --- NEXT CODE ---

import shutil
from google.colab import files

# Create a zip archive of the FINAL_OUTPUT directory
shutil.make_archive('FINAL_OUTPUT_archive', 'zip', 'FINAL_OUTPUT')

# Download the zip file
files.download('FINAL_OUTPUT_archive.zip')
