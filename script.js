/* =====================================================
   PRODUCT FILTERING SYSTEM (simplified version)
   Same features as before:
   - loads products from products.json
   - lets you search, filter by category, sort by price
   - shows an empty state when nothing matches
===================================================== */

// This will hold all our products once they're loaded
let products = [];

// Grab the HTML elements we need, once, and reuse them everywhere
let searchInput = document.getElementById("searchInput");
let categorySelect = document.getElementById("categorySelect");
let sortSelect = document.getElementById("sortSelect");
let productGrid = document.getElementById("productGrid");
let resultsCount = document.getElementById("resultsCount");
let emptyState = document.getElementById("emptyState");
let clearFiltersBtn = document.getElementById("clearFiltersBtn");


/* -----------------------------------------------------
   1. LOAD THE PRODUCTS FROM products.json
   fetch() must run on a local server (not by double
   clicking the HTML file) or it will fail.
----------------------------------------------------- */
function loadProducts() {
  fetch("products.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      products = data;
      fillCategoryDropdown();
      updateProductList();
    })
    .catch(function (error) {
      console.log("Error loading products:", error);
      productGrid.hidden = true;
      emptyState.hidden = false;
      emptyState.querySelector("p").textContent =
        "Could not load products. Make sure products.json is in the same folder and you're running a local server.";
    });
}


/* -----------------------------------------------------
   2. BUILD THE CATEGORY DROPDOWN FROM THE PRODUCT DATA
----------------------------------------------------- */
function fillCategoryDropdown() {
  let categoriesFound = [];

  for (let i = 0; i < products.length; i++) {
    let category = products[i].category;

    // only add it if we haven't seen it before
    if (categoriesFound.indexOf(category) === -1) {
      categoriesFound.push(category);

      let option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    }
  }
}


/* -----------------------------------------------------
   3. FILTER THE PRODUCTS (search box + category dropdown)
----------------------------------------------------- */
function filterProducts() {
  let searchTerm = searchInput.value.trim().toLowerCase();
  let selectedCategory = categorySelect.value;
  let result = [];

  for (let i = 0; i < products.length; i++) {
    let product = products[i];
    let nameWords = product.name.toLowerCase().split(" ");

    // does any word in the name start with the search term?
    let matchesSearch = false;
    for (let j = 0; j < nameWords.length; j++) {
      if (nameWords[j].indexOf(searchTerm) === 0) {
        matchesSearch = true;
      }
    }

    let matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    if (matchesSearch && matchesCategory) {
      result.push(product);
    }
  }

  return result;
}


/* -----------------------------------------------------
   4. SORT THE PRODUCTS BY PRICE
----------------------------------------------------- */
function sortProducts(list) {
  let sortOption = sortSelect.value;
  let sortedList = list.slice(); // copy, so we don't change the original list

  if (sortOption === "low-high") {
    sortedList.sort(function (a, b) {
      return a.price - b.price;
    });
  } else if (sortOption === "high-low") {
    sortedList.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  return sortedList;
}


/* -----------------------------------------------------
   5. SHOW THE PRODUCTS ON THE PAGE
----------------------------------------------------- */
function renderProducts(list) {
  productGrid.innerHTML = "";

  // nothing matched the filters
  if (list.length === 0) {
    emptyState.hidden = false;
    productGrid.hidden = true;
    resultsCount.textContent = "Showing 0 products";
    return;
  }

  emptyState.hidden = true;
  productGrid.hidden = false;

  let html = "";

  for (let i = 0; i < list.length; i++) {
    let product = list[i];

    let imageHTML;
    if (product.image) {
      imageHTML = '<img src="' + product.image + '" alt="' + product.name + '">';
    } else {
      imageHTML = '<span class="image-placeholder-text">Add photo</span>';
    }

    html +=
      '<div class="product-card">' +
        '<div class="product-image">' + imageHTML + '</div>' +
        '<span class="category-chip">' + product.category + '</span>' +
        '<h3>' + product.name + '</h3>' +
        '<p class="description">' + product.description + '</p>' +
        '<p class="price-tag">' + product.price.toLocaleString("en-IN") + '</p>' +
      '</div>';
  }

  productGrid.innerHTML = html;

  if (list.length === products.length) {
    resultsCount.textContent = "Showing all products";
  } else {
    resultsCount.textContent = "Showing " + list.length + " of " + products.length + " products";
  }
}


/* -----------------------------------------------------
   6. THE MAIN FUNCTION: filter, then sort, then show
   This runs every time a filter changes.
----------------------------------------------------- */
function updateProductList() {
  let filtered = filterProducts();
  let sorted = sortProducts(filtered);
  renderProducts(sorted);
}


/* -----------------------------------------------------
   7. LISTEN FOR USER ACTIONS
----------------------------------------------------- */
searchInput.addEventListener("input", updateProductList);
categorySelect.addEventListener("change", updateProductList);
sortSelect.addEventListener("change", updateProductList);

clearFiltersBtn.addEventListener("click", function () {
  searchInput.value = "";
  categorySelect.value = "all";
  sortSelect.value = "default";
  updateProductList();
});


/* -----------------------------------------------------
   8. START
----------------------------------------------------- */
loadProducts();