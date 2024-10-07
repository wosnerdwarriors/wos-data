document.addEventListener('DOMContentLoaded', function () {
    const stateSearch = document.getElementById('stateSearch');
    const stateSelectContainer = document.getElementById('stateSelectContainer');
    const dateSearch = document.getElementById('dateSearch');
    const dateSelectContainer = document.getElementById('dateSelectContainer');
    const tableHead = document.getElementById('tableHead').getElementsByTagName('tr')[0];
    const tableBody = document.getElementById('tableBody');
    const currentPageSpan = document.getElementById('currentPage');
    
    let svsData = {};
    let selectedStates = {};
    let selectedSvsDates = [];
    let allSvsDates = [];
    let currentPage = 1;
    let statesPerPage = 50;

    // Determine if debug mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.has('debug') && urlParams.get('debug') === 'true';

    if (debug) console.log('Debug mode enabled');

    // Fetch the JSON data and initialize
    fetch('data/svs-history.json')
        .then(response => response.json())
        .then(data => {
            if (debug) console.log('JSON data loaded:', data);
            svsData = data["svs-data-per-state"];
            collectAllSvsDates();  // Collect all SVS dates from all states
            populateStateSelect();
            populateDateSelect();
            selectDefaultDates();  // Select the last 5 dates by default
            updatePagination();
        })
        .catch(error => console.error('Error loading JSON data:', error));

    // Collect a list of SVS dates from all states
    function collectAllSvsDates() {
        let allDates = new Set();  // Use a Set to ensure unique dates

        // Collect dates from all states
        for (const state in svsData) {
            const dates = Object.keys(svsData[state]);
            dates.forEach(date => allDates.add(date));  // Add each date to the Set
        }

        // Convert Set back to Array and sort
        allSvsDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

        if (debug) console.log('All SVS dates collected and sorted:', allSvsDates);

        // Validate that all dates in the JSON are covered
        for (const state in svsData) {
            const dates = Object.keys(svsData[state]);
            dates.forEach(date => {
                if (!allSvsDates.includes(date)) {
                    console.error(`Error: Date ${date} in state ${state} is not in the generated list of dates.`);
                }
            });
        }
    }

    // Default: select the last 5 dates
    function selectDefaultDates() {
        selectedSvsDates = allSvsDates.slice(-5);  // Select the last 5 dates
        if (debug) console.log('Default selected dates:', selectedSvsDates);
        renderTable();
    }

    // Populate state checkboxes
    function populateStateSelect() {
        const states = Object.keys(svsData);
        stateSelectContainer.innerHTML = '';  // Clear previous options
        states.forEach(state => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = state;
            checkbox.id = `state-${state}`;
            checkbox.classList.add('form-check-input');
            checkbox.checked = selectedStates[state] || false;
            checkbox.addEventListener('change', handleStateSelection);

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.setAttribute('for', `state-${state}`);
            label.textContent = `State ${state}`;

            const div = document.createElement('div');
            div.classList.add('form-check');
            div.appendChild(checkbox);
            div.appendChild(label);

            stateSelectContainer.appendChild(div);
        });

        if (debug) console.log('State checkboxes populated:', states);
    }

    // Populate date checkboxes
    function populateDateSelect() {
        dateSelectContainer.innerHTML = '';  // Clear previous options
        allSvsDates.forEach(date => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = date;
            checkbox.id = `date-${date}`;
            checkbox.classList.add('form-check-input');
            checkbox.checked = selectedSvsDates.includes(date);
            checkbox.addEventListener('change', handleDateSelection);

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.setAttribute('for', `date-${date}`);
            label.textContent = date;

            const div = document.createElement('div');
            div.classList.add('form-check');
            div.appendChild(checkbox);
            div.appendChild(label);

            dateSelectContainer.appendChild(div);
        });

        if (debug) console.log('Date checkboxes populated:', allSvsDates);
    }

    // Handle state selection changes
    function handleStateSelection(e) {
        const state = e.target.value;
        selectedStates[state] = e.target.checked;
        if (debug) console.log(`State ${state} selected:`, selectedStates[state]);
        renderTable();
    }

    // Handle SVS date selection changes
    function handleDateSelection(e) {
        const date = e.target.value;
        if (e.target.checked) {
            if (!selectedSvsDates.includes(date)) {
                selectedSvsDates.push(date);
            }
        } else {
            selectedSvsDates = selectedSvsDates.filter(d => d !== date);
        }

        if (debug) console.log('Updated selected SVS dates:', selectedSvsDates);

        renderTable();
    }

    // "Add All Dates" button functionality
    document.getElementById('addAllDatesBtn').addEventListener('click', () => {
        const checkboxes = dateSelectContainer.querySelectorAll('input[type="checkbox"]');
        selectedSvsDates = [];  // Reset selected dates
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            selectedSvsDates.push(checkbox.value);  // Add all dates
        });
        if (debug) console.log('All dates added:', selectedSvsDates);
        renderTable();
    });

    // "Clear All Dates" button functionality
    document.getElementById('clearAllDatesBtn').addEventListener('click', () => {
        const checkboxes = dateSelectContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectedSvsDates = [];  // Clear selected dates
        if (debug) console.log('All dates cleared.');
        renderTable();
    });

    // Render the table with dynamically populated date columns and corresponding state data
    function renderTable() {
        tableBody.innerHTML = ''; // Clear previous table content
        tableHead.innerHTML = ''; // Clear previous date column headers

        // Create the state header
        const stateHeader = document.createElement('th');
        stateHeader.textContent = 'State';
        tableHead.appendChild(stateHeader);

        // If no dates are selected, don't render any date columns
        if (selectedSvsDates.length === 0) {
            if (debug) console.log('No dates selected, table will not render dates.');
            return;  // Exit early if no dates are selected
        }

        // Populate the date columns dynamically based on the selected dates
        selectedSvsDates.forEach(date => {
            const th = document.createElement('th');
            th.textContent = date;  // Set the date as the column title
            th.classList.add(`date-${date}`);
            tableHead.appendChild(th);  // Add the date header to the table
            if (debug) console.log('Rendering date column:', date);
        });

        const states = Object.keys(selectedStates).filter(state => selectedStates[state]);

        states.forEach(state => {
            const stateData = svsData[state];
            const row = document.createElement('tr');

            // Add state column (locked in place)
            const stateCell = document.createElement('th');
            stateCell.textContent = `State ${state}`;
            row.appendChild(stateCell);

            // Add date columns with prep and castle results or "no-data" if not available
            selectedSvsDates.forEach(date => {
                const dateCell = document.createElement('td');
                const details = stateData[date] || { 'won-prep': 'no-data', 'won-castle': 'no-data' };
                dateCell.innerHTML = `                    <div class="prep ${details['won-prep'] === 'no-data' ? '' : details['won-prep'] ? 'highlight-yes' : 'highlight-no'}">Prep: ${details['won-prep'] === 'no-data' ? 'no-data' : details['won-prep'] ? 'Yes' : 'No'}</div>
                    <div class="castle ${details['won-castle'] === 'no-data' ? '' : details['won-castle'] ? 'highlight-yes' : 'highlight-no'}">Castle: ${details['won-castle'] === 'no-data' ? 'no-data' : details['won-castle'] ? 'Yes' : 'No'}</div>
                `;
                dateCell.classList.add(`date-${date}`);
                row.appendChild(dateCell);
            });

            tableBody.appendChild(row);
        });

        if (debug) console.log('Table rendered with states:', selectedStates, 'and dates:', selectedSvsDates);
    }

    // Pagination logic (unchanged from before)
    function updatePagination() {
        const totalPages = Math.ceil(Object.keys(selectedStates).length / statesPerPage);

        document.getElementById('firstPageBtn').disabled = currentPage === 1;
        document.getElementById('prevPageBtn').disabled = currentPage === 1;
        document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
        document.getElementById('lastPageBtn').disabled = currentPage === totalPages;

        currentPageSpan.textContent = currentPage;
    }

    document.getElementById('firstPageBtn').addEventListener('click', () => {
        currentPage = 1;
        updatePagination();
        renderTable();
    });

    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            renderTable();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(Object.keys(selectedStates).length / statesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            renderTable();
        }
    });

    document.getElementById('lastPageBtn').addEventListener('click', () => {
        currentPage = Math.ceil(Object.keys(selectedStates).length / statesPerPage);
        updatePagination();
        renderTable();
    });

    // State search functionality
    stateSearch.addEventListener('input', function () {
        const searchTerm = stateSearch.value.toLowerCase();
        const checkboxes = stateSelectContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling.textContent.toLowerCase();
            const wildcardMatch = searchTerm.includes('*') ? new RegExp(searchTerm.replace('*', '.*')) : null;
            const isVisible = wildcardMatch ? wildcardMatch.test(label) : label.includes(searchTerm);
            checkbox.parentElement.style.display = isVisible ? '' : 'none';
        });
        if (debug) console.log('State search updated with term:', searchTerm);
    });

    // Date search functionality
    dateSearch.addEventListener('input', function () {
        const searchTerm = dateSearch.value.toLowerCase();
        const checkboxes = dateSelectContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling.textContent.toLowerCase();
            const wildcardMatch = searchTerm.includes('*') ? new RegExp(searchTerm.replace('*', '.*')) : null;
            const isVisible = wildcardMatch ? wildcardMatch.test(label) : label.includes(searchTerm);
            checkbox.parentElement.style.display = isVisible ? '' : 'none';
        });
        if (debug) console.log('Date search updated with term:', searchTerm);
    });
});

