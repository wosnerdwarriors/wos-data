#!/usr/bin/env python3

import json
import argparse

def sort_svs_data(data):
	# Sort dates for each state's SvS data
	for state in data["svs-data-per-state"]:
		state_data = data["svs-data-per-state"][state]
		# Sort the dates by the key
		sorted_state_data = dict(sorted(state_data.items(), key=lambda stateDataOnDate: stateDataOnDate[0]))
		
		# Reorder the keys within each date element, only including existing keys
		for date in sorted_state_data:
			element = sorted_state_data[date]
			ordered_element = {key: element[key] for key in ["won-prep", "won-castle", "had-svs-match", "opposition-state"] if key in element}
			sorted_state_data[date] = ordered_element
		
		data["svs-data-per-state"][state] = sorted_state_data

	return data

def main():
	# Set up argument parser
	parser = argparse.ArgumentParser(description="Sort SvS data by date and reorder keys")
	parser.add_argument('--input-json', required=True, help="Path to the input JSON file")
	parser.add_argument('--output-json', required=True, help="Path to the output JSON file")

	# Parse arguments
	args = parser.parse_args()

	# Load the JSON data
	with open(args.input_json, 'r') as f:
		data = json.load(f)

	# Sort the SvS data and reorder keys
	sorted_data = sort_svs_data(data)

	# Write the sorted data to the output file
	with open(args.output_json, 'w') as f:
		json.dump(sorted_data, f, indent=4)

	print(f"Sorted data saved to {args.output_json}")

if __name__ == '__main__':
	main()
