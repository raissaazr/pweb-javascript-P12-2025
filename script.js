// ========================================
// GLOBAL VARIABLES
// ========================================
let allRecipes = [];
let filteredRecipes = [];
let displayedRecipesCount = 9;
const recipesPerPage = 9;
let debounceTimer;

// DOM Elements
const recipesGrid = document.getElementById('recipesGrid');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const cuisineFilter = document.getElementById('cuisineFilter');
const showMoreContainer = document.getElementById('showMoreContainer');
const recipeCount = document.getElementById('recipeCount');
const userNameDisplay = document.getElementById('userName');
const modal = document.getElementById('recipeModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');


// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchRecipes();
    addEventListeners();
});

function addEventListeners() {
    searchInput.addEventListener('input', handleFilterChange);
    cuisineFilter.addEventListener('change', handleFilterChange);
}


// ========================================
// AUTHENTICATION
// ========================================
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
    } else {
        userNameDisplay.textContent = user;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}


// ========================================
// API & DATA HANDLING
// ========================================
async function fetchRecipes() {
    try {
        const response = await fetch('https://dummyjson.com/recipes');
        if (!response.ok) {
            throw new Error(`Failed to fetch recipes. Status: ${response.status}`);
        }
        const data = await response.json();
        allRecipes = data.recipes;
        filteredRecipes = allRecipes;
        
        populateCuisineFilter();
        displayRecipes();
        
        loadingMessage.style.display = 'none';
    } catch (error) {
        console.error('Error fetching recipes:', error);
        loadingMessage.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}. Please try again later.`;
        errorMessage.style.display = 'block';
    }
}


// ========================================
// DISPLAY & UI FUNCTIONS
// ========================================
function displayRecipes() {
    recipesGrid.innerHTML = '';
    
    if (filteredRecipes.length === 0) {
        recipesGrid.innerHTML = `<p class="error">No recipes found matching your criteria.</p>`;
        showMoreContainer.style.display = 'none';
        updateRecipeCount();
        return;
    }

    const recipesToShow = filteredRecipes.slice(0, displayedRecipesCount);
    
    recipesToShow.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipesGrid.appendChild(card);
    });

    updateRecipeCount();
    
    if (filteredRecipes.length > displayedRecipesCount) {
        showMoreContainer.style.display = 'block';
    } else {
        showMoreContainer.style.display = 'none';
    }
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const difficultyClass = `difficulty-${recipe.difficulty.toLowerCase()}`;
    const stars = '★'.repeat(Math.round(recipe.rating));
    const ingredientsText = recipe.ingredients.slice(0, 3).join(', ') + 
        (recipe.ingredients.length > 3 ? ` +${recipe.ingredients.length - 3} more` : '');

    card.innerHTML = `
        <div class="recipe-image-wrapper">
            <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
            <div class="recipe-image-overlay"></div>
        </div>
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.name}</h3>
            <div class="recipe-meta">
                <div class="meta-item"><span class="meta-icon">⏱</span><span>${totalTime} mins</span></div>
                <div class="meta-item ${difficultyClass}"><span class="meta-icon">📊</span><span>${recipe.difficulty}</span></div>
                <div class="meta-item"><span class="cuisine-tag">🍽 ${recipe.cuisine}</span></div>
            </div>
            <p class="recipe-ingredients"><strong>Ingredients:</strong> ${ingredientsText}</p>
            <div class="recipe-rating">
                <span class="stars">${stars}</span>
                <span class="rating-number">(${recipe.rating})</span>
            </div>
            <button class="view-recipe-btn" onclick="viewRecipe(${recipe.id})">View Full Recipe</button>
        </div>
    `;
    return card;
}

function updateRecipeCount() {
    const showing = Math.min(displayedRecipesCount, filteredRecipes.length);
    const total = filteredRecipes.length;
    
    if (allRecipes.length === total) {
        recipeCount.textContent = `Showing ${showing} of ${total} recipes`;
    } else {
        recipeCount.textContent = `Found ${total} recipes, showing ${showing}`;
    }
}

function showMore() {
    displayedRecipesCount += recipesPerPage;
    displayRecipes();
}


// ========================================
// FILTER & SEARCH
// ========================================
function populateCuisineFilter() {
    const cuisines = [...new Set(allRecipes.map(recipe => recipe.cuisine))].sort();
    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.value = cuisine;
        option.textContent = cuisine;
        cuisineFilter.appendChild(option);
    });
}

function handleFilterChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        applyFilters();
    }, 300); // 300ms debounce delay
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const cuisine = cuisineFilter.value;
    
    filteredRecipes = allRecipes.filter(recipe => {
        const matchesSearch = searchTerm === '' || 
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.cuisine.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesCuisine = cuisine === '' || recipe.cuisine === cuisine;
        
        return matchesSearch && matchesCuisine;
    });
    
    // Reset view when filtering
    displayedRecipesCount = recipesPerPage;
    displayRecipes();
}


// ========================================
// MODAL FUNCTIONS
// ========================================
function viewRecipe(id) {
    const recipe = allRecipes.find(r => r.id === id);
    if (!recipe) return;

    modalTitle.textContent = recipe.name;
    const stars = '★'.repeat(Math.round(recipe.rating));
    const tags = recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const ingredients = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const instructions = recipe.instructions.map(inst => `<li>${inst}</li>`).join('');

    modalBody.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="modal-image">
        <div class="modal-details">
            <div class="detail-item"><div class="detail-label">Prep Time</div><div class="detail-value">${recipe.prepTimeMinutes} mins</div></div>
            <div class="detail-item"><div class="detail-label">Cook Time</div><div class="detail-value">${recipe.cookTimeMinutes} mins</div></div>
            <div class="detail-item"><div class="detail-label">Servings</div><div class="detail-value">${recipe.servings}</div></div>
            <div class="detail-item"><div class="detail-label">Difficulty</div><div class="detail-value">${recipe.difficulty}</div></div>
            <div class="detail-item"><div class="detail-label">Cuisine</div><div class="detail-value">${recipe.cuisine}</div></div>
            <div class="detail-item"><div class="detail-label">Calories</div><div class="detail-value">${recipe.caloriesPerServing} cal</div></div>
        </div>
        <div class="modal-rating"><span class="stars">${stars}</span><span class="rating-number">(${recipe.rating}) ${recipe.reviewCount} reviews</span></div>
        <div class="tags-container">${tags}</div>
        <h4 class="section-title">Ingredients</h4>
        <ul class="ingredients-list">${ingredients}</ul>
        <h4 class="section-title">Instructions</h4>
        <ol class="instructions-list">${instructions}</ol>
    `;

    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}