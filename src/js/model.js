import { RECIPES_URL, RES_PER_PAGE } from './config.js'
import { AJAX } from './helpers.js'

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
    user: {},
}

const createRecipeObject = function (data) {
    const { recipe } = data.data
    return {
        id: recipe._id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image,
        servings: recipe.servings,
        cookingTime: recipe.cookingTime,
        ingredients: recipe.ingredients,
        cookingDirections: recipe.cookingDirections,
        ...(recipe.userID && { userID: recipe.userID }),
    }
}

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX({
            url: `${RECIPES_URL}/${id}`,
            method: 'GET',
        })
        state.recipe = createRecipeObject(data)

        if (state.bookmarks.some((bookmark) => bookmark.id === id))
            state.recipe.bookmarked = true
        else state.recipe.bookmarked = false
    } catch (err) {
        console.error(`${err} 💥💥💥💥`)
        throw err
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query

        const data = await AJAX({
            url: `${RECIPES_URL}?search=${query}`,
            method: 'GET',
        })

        state.search.results = data.data.recipes.map((rec) => {
            return {
                id: rec._id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.userID && { userID: rec.userID }),
            }
        })
        state.search.page = 1
    } catch (err) {
        console.error(`${err} 💥💥💥💥`)
        throw err
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page

    const start = (page - 1) * state.search.resultsPerPage
    const end = page * state.search.resultsPerPage

    return state.search.results.slice(start, end)
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach((ing) => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings
    })

    state.recipe.servings = newServings
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmark = function (recipe) {
    state.bookmarks.push(recipe)

    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true

    persistBookmarks()
}

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex((el) => el.id === id)
    state.bookmarks.splice(index, 1)

    if (id === state.recipe.id) state.recipe.bookmarked = false

    persistBookmarks()
}

const init = function () {
    const storage = localStorage.getItem('bookmarks')
    if (storage) state.bookmarks = JSON.parse(storage)
}
init()

export const uploadRecipe = async function (auth0Client, newRecipe) {
    const ingredients = Object.entries(newRecipe)
        .filter((entry) => entry[0].startsWith('ingredient') && entry[1] !== '')
        .map((ing) => {
            const ingArr = ing[1].split(',').map((el) => el.trim())
            if (ingArr.length !== 3)
                throw new Error(
                    'Wrong ingredient fromat! Please use the correct format :)'
                )

            const [quantity, unit, description] = ingArr

            return { quantity: quantity ? +quantity : null, unit, description }
        })

    const cookingDirections = newRecipe.cookingDirections

    const recipe = {
        title: newRecipe.title,
        image_url: newRecipe.image,
        publisher: newRecipe.publisher,
        cookingTime: +newRecipe.cookingTime,
        servings: +newRecipe.servings,
        ingredients,
        cookingDirections,
    }

    const data = await AJAX({
        auth0Client,
        url: `${RECIPES_URL}`,
        method: 'POST',
        uploadData: recipe,
    })
    state.recipe = createRecipeObject(data)
    addBookmark(state.recipe)
}

export const deleteRecipe = async function (auth0Client, id) {
    await AJAX({
        auth0Client,
        url: `${RECIPES_URL}/${id}`,
        method: 'DELETE',
    })
}
