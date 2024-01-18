// Assuming you are running this in a browser environment
let currentPage = 1;
let reposPerPage = 10; // Number of repositories per page

const username=document.querySelector("#username")


function changeReposPerPage() {
    const selectElement = document.getElementById('reposPerPage');
    reposPerPage = parseInt(selectElement.value);
    if(username.value!==""){

        loadRepos(); 
    }
}

async function fetchUserRepositories(username, page = 1) {
    const apiURL = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${reposPerPage}`;
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const linkHeader = response.headers.get('Link');
        const totalRepos = getTotalReposFromLinkHeader(linkHeader);
        const repos = await response.json();
        console.log(repos)
        return { repos, totalRepos };
    } catch (error) {
        console.error('Fetching error:', error);
        return { repos: [], totalRepos: 0 };
    }
}

function loadRepos() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter a GitHub username.");
        return;
    }
    currentPage = 1; // Reset to first page
    fetchAndDisplayRepos(username);
}

function fetchAndDisplayRepos(username) {
    fetchUserRepositories(username, currentPage)
        .then(({ repos, totalRepos }) => {
            updatePagination(username, totalRepos);
            displayRepos(repos);
        });
}

function displayRepos(repos) {
    const repoList = document.getElementById('repo-list');
    repoList.innerHTML = '';

    if (repos.length === 0) {
        repoList.innerHTML = '<p>No repositories found.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.style.display = "grid";
    list.style.margin = "auto";
    list.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))"; // This will create as many columns as can fit
    list.style.gridGap = "1rem";
    list.style.padding = "0"; 
    repos.forEach(repo => {
        const listItem = document.createElement('li');
        listItem.style.listStyle = "none";
        listItem.style.background=" white"
        listItem.style.margin = "0"; 
        listItem.style.border = "1px solid #000"; 
        listItem.style.borderRadius="5px"
        listItem.style.padding = "0.5rem"; 
        listItem.innerHTML = `<a href="${repo.html_url}"   target="_blank">${repo.name}</a>`;
        list.appendChild(listItem);
    });
    repoList.appendChild(list);
}
function updatePagination(username) {
    const paginationDiv = document.querySelector('#pagination');
    paginationDiv.innerHTML = '';


    const maxPagesToShow = 10;
    for (let i = 1; i <= maxPagesToShow; i++) {
        const pageItem = document.createElement('span');
        pageItem.className = 'page-item';
        pageItem.innerText = i;
        if (i === currentPage) {
            pageItem.classList.add('active');
        }
        pageItem.addEventListener('click', () => {
            currentPage = i;
            fetchAndDisplayRepos(username);
        });

        paginationDiv.appendChild(pageItem);
    }
}


function getTotalReposFromLinkHeader(linkHeader) {
    if (!linkHeader) return 0;

    const links = linkHeader.split(',').map(a => a.split(';'));
    for (const link of links) {
        if (link[1].includes('rel="last"')) {
            return extractPageNumber(link[0]);
        }
    }
    return 0;
}

function extractPageNumber(link) {
    const match = link.match(/&page=(\d+).*$/);
    if (match && match.length > 1) {
        return parseInt(match[1], 10);
    }
    return 0;
}

// Add event listener to load button
document.addEventListener('DOMContentLoaded', () => {
    const loadButton = document.querySelector('button');
    if (loadButton) {
        loadButton.addEventListener('click', loadRepos);
    }
});
