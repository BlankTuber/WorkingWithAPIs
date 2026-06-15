const API = "https://api.jikan.moe/v4";

const state = {
	query: "",
	genre: "",
	sort: "score",

	page: 1,
	hasNextPage: true,
	isLoading: false,

	favoritesOnly: false,

	totalResults: 0,
};

// ========================================
// Startup
// ========================================

window.onload = async () => {
	await loadGenres();

	setupEventListeners();

	await loadTrending();
};

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
	let debounceTimer;

	document.getElementById("searchInput").addEventListener("input", (event) => {
		clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
			state.query = event.target.value.trim();

			resetSearch();

			searchManga();
		}, 400);
	});

	document
		.getElementById("genreSelector")
		.addEventListener("change", (event) => {
			state.genre = event.target.value;

			resetSearch();

			searchManga();
		});

	document
		.getElementById("sortSelector")
		.addEventListener("change", (event) => {
			state.sort = event.target.value;

			resetSearch();

			searchManga();
		});

	document
		.getElementById("favoritesToggle")
		.addEventListener("click", toggleFavoritesMode);

	document.getElementById("closeModal").addEventListener("click", closeModal);

	document.getElementById("modalOverlay").addEventListener("click", (event) => {
		if (event.target.id === "modalOverlay") closeModal();
	});

	window.addEventListener("scroll", handleScroll);
}

// ========================================
// Genres
// ========================================

async function loadGenres() {
	try {
		const response = await fetch(`${API}/genres/manga`);

		const data = await response.json();

		const selector = document.getElementById("genreSelector");

		data.data.forEach((genre) => {
			const option = document.createElement("option");

			option.value = genre.mal_id;

			option.textContent = genre.name;

			selector.append(option);
		});
	} catch (error) {
		console.error("Failed to load genres", error);
	}
}

// ========================================
// Trending
// ========================================

async function loadTrending() {
	resetSearch();

	document.getElementById("resultsTitle").textContent = "🔥 Trending Manga";

	try {
		const response = await fetch(`${API}/top/manga?page=1`);

		const data = await response.json();

		state.hasNextPage = data.pagination.has_next_page;

		state.totalResults = data.pagination.items.total;

		renderManga(data.data, true);

		updateResultCount();
	} catch (error) {
		console.error(error);

		showEmptyState("Failed to load manga.");
	}
}

// ========================================
// Search
// ========================================

async function searchManga() {
	if (state.favoritesOnly) {
		renderFavorites();
		return;
	}

	if (state.isLoading) return;

	state.isLoading = true;

	showLoading();

	try {
		const params = new URLSearchParams();

		params.append("page", state.page);

		params.append("limit", 24);

		if (state.query) params.append("q", state.query);

		if (state.genre) params.append("genres", state.genre);

		const sortMap = {
			score: "score",
			favorites: "favorites",
			members: "members",
			chapters: "chapters",
			published: "start_date",
		};

		if (state.sort === "newest") {
			params.delete("q");
			params.delete("genres");

			params.set("order_by", "start_date");
			params.set("sort", "desc");
		}

		params.append("order_by", sortMap[state.sort] || "score");

		params.append("sort", "desc");

		const response = await fetch(`${API}/manga?${params}`);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();

		state.hasNextPage = data?.pagination?.has_next_page ?? false;

		state.totalResults = data?.pagination?.items?.total ?? 0;

		state.totalResults = data.pagination.items.total;

		renderManga(data.data, state.page === 1);

		updateResultCount();

		document.getElementById("resultsTitle").textContent = state.query
			? `🔎 Results for "${state.query}"`
			: "📚 Browse Manga";
	} catch (error) {
		console.error(error);

		if (state.page === 1) showEmptyState("Failed to load manga.");
	} finally {
		hideLoading();

		state.isLoading = false;
	}
}

// ========================================
// Infinite Scroll
// ========================================

async function handleScroll() {
	if (state.favoritesOnly) return;

	if (!state.hasNextPage) return;

	if (state.isLoading) return;

	const nearBottom =
		window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;

	if (!nearBottom) return;

	state.page++;

	await searchManga();
}

// ========================================
// Rendering
// ========================================

function renderManga(mangaList, clear = false) {
	const grid = document.getElementById("resultsGrid");

	if (clear) grid.innerHTML = "";

	if (clear && mangaList.length === 0) {
		showEmptyState("No manga found.");

		return;
	}

	mangaList.forEach((manga) => {
		const card = createCard(manga);

		grid.append(card);
	});
}

function createCard(manga) {
	const card = document.createElement("article");

	card.className = "mangaCard";

	const isFavorite = getFavorites().includes(manga.mal_id);

	const genres = manga.genres
		.slice(0, 3)
		.map((genre) => `<span>${genre.name}</span>`)
		.join("");

	card.innerHTML = `
        <button
            class="favoriteBtn ${isFavorite ? "active" : ""}"
        >
            ❤️
        </button>

        <img
            src="${manga.images.jpg.large_image_url}"
            alt="${manga.title}"
        >

        <div class="cardBody">

            <h3 class="cardTitle">
                ${manga.title}
            </h3>

            <div class="cardStats">
                <span>
                    ⭐ ${manga.score ?? "N/A"}
                </span>

                <span>
                    📖 ${manga.chapters ?? "?"}
                </span>
            </div>

            <div class="genreTags">
                ${genres}
            </div>

        </div>
    `;

	card.querySelector(".favoriteBtn").addEventListener("click", (event) => {
		event.stopPropagation();

		toggleFavorite(manga.mal_id, event.target);
	});

	card.addEventListener("click", () => showModal(manga));

	return card;
}

// ========================================
// Modal
// ========================================

function showModal(manga) {
	const content = document.getElementById("modalContent");

	content.innerHTML = `
        <div class="modalHeader">

            <img
                src="${manga.images.jpg.large_image_url}"
                alt="${manga.title}"
            >

            <div class="modalInfo">

                <h2>
                    ${manga.title}
                </h2>

                <p>
                    ⭐ Score:
                    ${manga.score ?? "N/A"}
                </p>

                <p>
                    📖 Chapters:
                    ${manga.chapters ?? "Unknown"}
                </p>

                <p>
                    ❤️ Favorites:
                    ${manga.favorites?.toLocaleString() ?? "N/A"}
                </p>

                <p>
                    📅 Status:
                    ${manga.status}
                </p>

                <a
                    class="malLink"
                    href="${manga.url}"
                    target="_blank"
                >
                    Open on MyAnimeList →
                </a>

            </div>

        </div>

        <p class="synopsis">
            ${manga.synopsis ?? "No synopsis available."}
        </p>
    `;

	document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
	document.getElementById("modalOverlay").classList.add("hidden");
}

// ========================================
// Favorites
// ========================================

function getFavorites() {
	return JSON.parse(localStorage.getItem("favorites") ?? "[]");
}

function toggleFavorite(malId, button) {
	const favorites = getFavorites();

	const index = favorites.indexOf(malId);

	if (index >= 0) {
		favorites.splice(index, 1);

		button.classList.remove("active");
	} else {
		favorites.push(malId);

		button.classList.add("active");
	}

	localStorage.setItem("favorites", JSON.stringify(favorites));
}

async function toggleFavoritesMode() {
	state.favoritesOnly = !state.favoritesOnly;

	const button = document.getElementById("favoritesToggle");

	button.classList.toggle("active", state.favoritesOnly);

	if (state.favoritesOnly) {
		renderFavorites();
	} else {
		resetSearch();
		await searchManga();
	}
}

async function renderFavorites() {
	const favorites = getFavorites();

	const grid = document.getElementById("resultsGrid");

	grid.innerHTML = "";

	document.getElementById("resultsTitle").textContent = "❤️ Favorite Manga";

	document.getElementById("resultsCount").textContent =
		`${favorites.length} saved`;

	if (favorites.length === 0) {
		showEmptyState("No favorites yet.");

		return;
	}

	for (const id of favorites) {
		try {
			const response = await fetch(`${API}/manga/${id}`);

			const data = await response.json();

			grid.append(createCard(data.data));
		} catch (error) {
			console.error(error);
		}
	}
}

// ========================================
// UI Helpers
// ========================================

function updateResultCount() {
	document.getElementById("resultsCount").textContent =
		`${state.totalResults.toLocaleString()} manga found`;
}

function showLoading() {
	document.getElementById("loadingIndicator").style.display = "block";
}

function hideLoading() {
	document.getElementById("loadingIndicator").style.display = "none";
}

function showEmptyState(message) {
	document.getElementById("resultsGrid").innerHTML = `
        <div class="emptyState">
            <h2>${message}</h2>
        </div>
    `;
}

function resetSearch() {
	state.page = 1;

	state.hasNextPage = true;

	document.getElementById("resultsGrid").innerHTML = "";
}
