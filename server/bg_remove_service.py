from rembg import remove
from PIL import Image
import sys
import os

# Check args
if len(sys.argv) < 3:
    print("ERROR: Usage: python bg_remove_service.py <input_path> <output_path>")
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

if not os.path.exists(input_path):
    print(f"ERROR: Input file not found: {input_path}")
    sys.exit(1)

try:
    with open(input_path, "rb") as i:
        input_data = i.read()

    output_data = remove(input_data)

    with open(output_path, "wb") as o:
        o.write(output_data)

    print("SUCCESS")

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
