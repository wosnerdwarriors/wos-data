import csv
import json
from datetime import datetime
from collections import defaultdict

# Paths to your input CSV and output JSON files
csv_file_path = 'path/to/csv-file'  
json_output_path = 'svs_history_converted.json'         

result_mapping = {
    "Supreme Win": {"won-prep": True, "won-castle": True},
    "Battle Win": {"won-prep": False, "won-castle": True},
    "Lost Both": {"won-prep": False, "won-castle": False},
    "Prep Win": {"won-prep": True, "won-castle": False}
}

# Initialize a dictionary to hold all states and their data
data_json = {"svs-data-per-state": defaultdict(dict)}

# Set of all states to ensure they are included in the final output
all_states = set()

with open(csv_file_path, mode='r') as file:
    csv_reader = csv.reader(file)
    headers = next(csv_reader)     
    headers = next(csv_reader)  
    
    for row in csv_reader:
        state = row[0].strip()  # State ID is in the first column
        
        if not state:
            continue  # Skip empty rows

        all_states.add(state)  # Keep track of all states

        # Process date-event pairs for each state
        for i in range(1, len(headers), 2):
            date_header = headers[i]
            opponent_header = row[i].strip()
            result_header = row[i + 1].strip()

            if not date_header or not opponent_header or not result_header:
                continue  # Skip incomplete entries

            # Extract date and reformat it to YYYY-MM-DD
            try:
                date_str = date_header.split()[1]  # Original date in MM/DD format
                date_obj = datetime.strptime(date_str, "%m/%d")  # Parse to date object
                date = f"2024-{date_obj.strftime('%m-%d')}"  # Format to YYYY-MM-DD with fixed year
            except ValueError:
                continue  # Skip invalid date entries

            # Validate opponent as numeric
            try:
                opposition_state = int(opponent_header)
            except ValueError:
                continue  # Skip non-numeric opponent entries

            result = result_mapping.get(result_header, None)

            if result:
                # Populate the data in the desired format
                data_json["svs-data-per-state"][state][date] = {
                    "opposition-state": opposition_state,
                    "won-prep": result["won-prep"],
                    "won-castle": result["won-castle"],
                    "had-svs-match": True
                }

# Ensure all states are represented in the final output, even without matches
for state in all_states:
    if state not in data_json["svs-data-per-state"]:
        data_json["svs-data-per-state"][state] = {}

# Write to JSON file
with open(json_output_path, 'w') as json_file:
    json.dump(data_json, json_file, indent=4)

print(f"Conversion completed! JSON data saved to {json_output_path}")

