#!/usr/bin/env python3

import json
import argparse
import pandas as pd

# Ensure that you use pip3 to install any required package, such as `pandas` and `odfpy`.
# pip3 install pandas odfpy

def parse_ods_to_json(input_file, output_file, debug=False):
	# Load the ODS file with all sheets
	data = pd.read_excel(input_file, engine='odf', sheet_name=None, header=0)

	# Prepare a dictionary to hold data for each sheet
	parsed_data = {}

	for sheet_name, sheet_data in data.items():
		# Drop columns without headers and rows that are completely empty
		sheet_data = sheet_data.dropna(axis=1, how='all')  # Drop columns where all values are NaN
		sheet_data = sheet_data.dropna(how='all')  # Drop rows where all values are NaN
		
		# Keep only columns with headers
		sheet_data = sheet_data.loc[:, sheet_data.columns.notna()]

		# Convert numeric columns to integers
		for col in sheet_data.select_dtypes(include=['number']).columns:
			sheet_data[col] = sheet_data[col].apply(lambda x: int(x) if pd.notnull(x) else x)

		# Convert to dictionary-like format if data exists
		if not sheet_data.empty:
			parsed_data[sheet_name] = sheet_data.to_dict(orient='records')

			if debug:
				print(f"\nDebug info for sheet: {sheet_name}")
				for i, col_name in enumerate(sheet_data.columns[:4]):  # Only the first 4 columns
					value_counts = sheet_data[col_name].value_counts().sort_values()
					print(f"\nColumn '{col_name}':")
					for value, count in value_counts.items():
						print(f"Value: {value}, Count: {count}")

	# Write the parsed data to a JSON file
	with open(output_file, 'w') as f:
		json.dump(parsed_data, f, indent=4)

	if debug:
		print("\nDebug mode completed: Printed value counts for the first 4 columns of each sheet.")

if __name__ == "__main__":
	# Set up argument parser
	parser = argparse.ArgumentParser(description='Convert an ODS file with troop stats to JSON.')
	parser.add_argument('-i', '--input', required=True, help='Path to the input ODS file.')
	parser.add_argument('-o', '--output', required=True, help='Path to the output JSON file.')
	parser.add_argument('--debug', action='store_true', help='Print debug information including value counts for the first 4 columns.')

	# Parse arguments
	args = parser.parse_args()

	# Run the function
	parse_ods_to_json(args.input, args.output, debug=args.debug)
	print(f"Data successfully parsed to {args.output}")

